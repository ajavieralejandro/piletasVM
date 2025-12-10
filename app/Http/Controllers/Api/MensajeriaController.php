<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Mensaje;
use App\Models\MensajeDestinatario;
use App\Models\Notificacion;
use App\Models\Turno;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MensajeriaController extends Controller
{
    /**
     * Obtener conversaciones del usuario autenticado
     */
    public function misConversaciones()
    {
        $usuario = Auth::user();
        
        // Obtener todas las conversaciones (agrupadas por interlocutor)
        $conversaciones = Mensaje::where(function($query) use ($usuario) {
            $query->where('remitente_id', $usuario->id)
                  ->orWhere('destinatario_id', $usuario->id);
        })
        ->with(['remitente', 'destinatario'])
        ->orderBy('created_at', 'desc')
        ->get()
        ->groupBy(function($mensaje) use ($usuario) {
            // Agrupar por el otro usuario (no el autenticado)
            return $mensaje->remitente_id === $usuario->id 
                ? $mensaje->destinatario_id 
                : $mensaje->remitente_id;
        })
        ->map(function($mensajes) use ($usuario) {
            $ultimoMensaje = $mensajes->first();
            $interlocutor = $ultimoMensaje->remitente_id === $usuario->id 
                ? $ultimoMensaje->destinatario 
                : $ultimoMensaje->remitente;
            
            $noLeidos = $mensajes->where('destinatario_id', $usuario->id)
                                 ->where('leido', false)
                                 ->count();
            
            return [
                'interlocutor' => [
                    'id' => $interlocutor->id,
                    'nombre' => $interlocutor->nombre_completo,
                    'tipo' => $interlocutor->tipo_usuario,
                ],
                'ultimo_mensaje' => [
                    'contenido' => $ultimoMensaje->contenido,
                    'fecha' => $ultimoMensaje->created_at->format('d/m/Y H:i'),
                    'es_mio' => $ultimoMensaje->remitente_id === $usuario->id,
                ],
                'no_leidos' => $noLeidos,
            ];
        })
        ->values();

        return response()->json([
            'success' => true,
            'data' => $conversaciones,
        ]);
    }

    /**
     * Obtener mensajes de una conversación específica
     */
    public function obtenerConversacion($interlocutorId)
    {
        $usuario = Auth::user();
        
        $mensajes = Mensaje::where(function($query) use ($usuario, $interlocutorId) {
            $query->where(function($q) use ($usuario, $interlocutorId) {
                $q->where('remitente_id', $usuario->id)
                  ->where('destinatario_id', $interlocutorId);
            })->orWhere(function($q) use ($usuario, $interlocutorId) {
                $q->where('remitente_id', $interlocutorId)
                  ->where('destinatario_id', $usuario->id);
            });
        })
        ->with(['remitente', 'destinatario'])
        ->orderBy('created_at', 'asc')
        ->get()
        ->map(function($mensaje) use ($usuario) {
            return [
                'id' => $mensaje->id,
                'contenido' => $mensaje->contenido,
                'es_mio' => $mensaje->remitente_id === $usuario->id,
                'leido' => $mensaje->leido,
                'fecha' => $mensaje->created_at->format('d/m/Y H:i'),
                'prioridad' => $mensaje->prioridad,
            ];
        });

        // Marcar como leídos los mensajes recibidos
        Mensaje::where('remitente_id', $interlocutorId)
               ->where('destinatario_id', $usuario->id)
               ->where('leido', false)
               ->update(['leido' => true, 'fecha_leido' => now()]);

        $interlocutor = User::find($interlocutorId);

        return response()->json([
            'success' => true,
            'data' => [
                'interlocutor' => [
                    'id' => $interlocutor->id,
                    'nombre' => $interlocutor->nombre_completo,
                    'tipo' => $interlocutor->tipo_usuario,
                ],
                'mensajes' => $mensajes,
            ],
        ]);
    }

    /**
     * Enviar mensaje individual
     */
    public function enviarMensaje(Request $request)
    {
        $request->validate([
            'destinatario_id' => 'required|exists:users,id',
            'contenido' => 'required|string|max:1000',
            'prioridad' => 'nullable|in:normal,importante,urgente',
        ]);

        $mensaje = Mensaje::create([
            'remitente_id' => Auth::id(),
            'destinatario_id' => $request->destinatario_id,
            'contenido' => $request->contenido,
            'prioridad' => $request->prioridad ?? 'normal',
            'es_grupal' => false,
        ]);

        // Crear notificación para el destinatario
        Notificacion::crearMensaje($request->destinatario_id, Auth::user());

        return response()->json([
            'success' => true,
            'message' => 'Mensaje enviado',
            'data' => $mensaje,
        ]);
    }

    /**
     * Enviar mensaje grupal a un turno
     */
    public function enviarMensajeGrupal(Request $request)
    {
        $request->validate([
            'turno_id' => 'required|exists:turnos,id',
            'contenido' => 'required|string|max:1000',
            'prioridad' => 'nullable|in:normal,importante,urgente',
        ]);

        $turno = Turno::with('inscripciones.alumno')->find($request->turno_id);
        
        // Verificar que el profesor sea el dueño del turno
        if ($turno->profesor_id !== Auth::id() && Auth::user()->tipo_usuario !== 'secretaria') {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permiso para enviar mensajes a este turno',
            ], 403);
        }

        // Crear mensaje grupal
        $mensaje = Mensaje::create([
            'remitente_id' => Auth::id(),
            'turno_id' => $request->turno_id,
            'contenido' => $request->contenido,
            'prioridad' => $request->prioridad ?? 'normal',
            'es_grupal' => true,
        ]);

        // Crear registro para cada alumno del turno
        foreach ($turno->inscripciones as $inscripcion) {
            MensajeDestinatario::create([
                'mensaje_id' => $mensaje->id,
                'destinatario_id' => $inscripcion->alumno_id,
            ]);

            // Crear notificación
            Notificacion::crearMensaje($inscripcion->alumno_id, Auth::user());
        }

        return response()->json([
            'success' => true,
            'message' => 'Mensaje enviado a ' . $turno->inscripciones->count() . ' alumnos',
            'data' => $mensaje,
        ]);
    }

    /**
     * Obtener contador de mensajes no leídos
     */
    public function contarNoLeidos()
    {
        $usuario = Auth::user();
        
        $noLeidos = Mensaje::where('destinatario_id', $usuario->id)
                           ->where('leido', false)
                           ->count();

        return response()->json([
            'success' => true,
            'data' => ['no_leidos' => $noLeidos],
        ]);
    }

    /**
     * Marcar mensaje como leído
     */
    public function marcarComoLeido($mensajeId)
    {
        $mensaje = Mensaje::findOrFail($mensajeId);
        
        if ($mensaje->destinatario_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permiso para marcar este mensaje',
            ], 403);
        }

        $mensaje->marcarComoLeido();

        return response()->json([
            'success' => true,
            'message' => 'Mensaje marcado como leído',
        ]);
    }

    /**
     * Obtener lista de profesores (para secretaría)
     */
    public function listarProfesores()
    {
        if (Auth::user()->tipo_usuario !== 'secretaria') {
            return response()->json([
                'success' => false,
                'message' => 'No autorizado',
            ], 403);
        }

        $profesores = User::where('tipo_usuario', 'profesor')
                          ->where('activo', true)
                          ->select('id', 'nombre_completo', 'email')
                          ->get();

        return response()->json([
            'success' => true,
            'data' => $profesores,
        ]);
    }

    /**
     * Obtener lista de alumnos de un turno (para profesor)
     */
    public function listarAlumnosTurno($turnoId)
    {
        $turno = Turno::with('inscripciones.alumno')->findOrFail($turnoId);
        
        // Verificar que el profesor sea el dueño del turno
        if ($turno->profesor_id !== Auth::id() && Auth::user()->tipo_usuario !== 'secretaria') {
            return response()->json([
                'success' => false,
                'message' => 'No autorizado',
            ], 403);
        }

        $alumnos = $turno->inscripciones->map(function($inscripcion) {
            return [
                'id' => $inscripcion->alumno->id,
                'nombre' => $inscripcion->alumno->nombre_completo,
                'email' => $inscripcion->alumno->email,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $alumnos,
        ]);
    }
}
