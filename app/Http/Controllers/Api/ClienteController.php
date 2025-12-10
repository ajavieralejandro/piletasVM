<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inscripcion;
use App\Models\Asistencia;
use Illuminate\Http\Request;

class ClienteController extends Controller
{
    /**
     * Inscribirse a un turno
     */
    public function inscribirse(Request $request)
    {
        $cliente = $request->user();

        $request->validate([
            'turno_id' => 'required|exists:turnos,id',
        ]);

        $turnoId = $request->turno_id;

        // 🔍 Verificar si ya está inscripto en ese turno
        $yaInscripto = Inscripcion::where('alumno_id', $cliente->id)
            ->where('turno_id', $turnoId)
            ->exists();

        if ($yaInscripto) {
            return response()->json([
                'success' => false,
                'message' => 'Ya estás inscripto en este turno.',
            ], 400);
        }

        // Crear nueva inscripción
        $inscripcion = Inscripcion::create([
            'alumno_id' => $cliente->id,
            'turno_id' => $turnoId,
            'pase_libre' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Inscripción realizada correctamente.',
            'data' => $inscripcion,
        ]);
    }

    /**
     * Obtener inscripciones del cliente autenticado
     */
    public function misInscripciones(Request $request)
    {
        $cliente = $request->user();
        
        \Log::info('Usuario solicitando inscripciones:', ['user_id' => $cliente->id]);
        
        $inscripciones = \App\Models\Inscripcion::where('alumno_id', $cliente->id)
            ->with(['turno.nivel', 'turno.profesor'])
            ->orderBy('created_at', 'desc')
            ->get();
        
        \Log::info('Inscripciones encontradas:', ['count' => $inscripciones->count()]);
        
        return response()->json([
            'success' => true,
            'data' => $inscripciones->map(function ($inscripcion) {
                return [
                    'id' => $inscripcion->id,
                    'turno' => [
                        'id' => $inscripcion->turno->id,
                        'dia_semana' => $inscripcion->turno->dia_semana,
                        'hora_inicio' => $inscripcion->turno->hora_inicio,
                        'hora_fin' => $inscripcion->turno->hora_fin,
                        'nivel' => $inscripcion->turno->nivel ? $inscripcion->turno->nivel->nombre : 'Sin nivel',
                        'profesor' => $inscripcion->turno->profesor ? $inscripcion->turno->profesor->nombre_completo : 'Sin profesor',
                    ],
                    'pase_libre' => $inscripcion->pase_libre ?? false,
                    'fecha_inscripcion' => $inscripcion->created_at->format('d/m/Y'),
                ];
            }),
        ]);
    }

    /**
     * Obtener estadísticas de asistencias
     */
    private function calcularEstadisticas($asistencias)
    {
        $total = $asistencias->count();
        $presentes = $asistencias->where('estado', 'presente')->count();
        $ausentes = $asistencias->where('estado', 'ausente')->count();
        $justificados = $asistencias->where('estado', 'justificado')->count();

        return [
            'total' => $total,
            'presentes' => $presentes,
            'ausentes' => $ausentes,
            'justificados' => $justificados,
            'porcentaje_asistencia' => $total > 0 ? round(($presentes / $total) * 100, 1) : 0,
        ];
    }

    /**
     * Obtener perfil del cliente
     */
    public function miPerfil(Request $request)
    {
        $cliente = $request->user();

        // Contar inscripciones activas
        $inscripcionesActivas = Inscripcion::where('alumno_id', $cliente->id)
            ->whereHas('turno', function ($query) {
                $query->where('activo', true);
            })
            ->count();

        // Contar total de asistencias
        $totalAsistencias = Asistencia::where('alumno_id', $cliente->id)->count();

        // Última asistencia
        $ultimaAsistencia = Asistencia::where('alumno_id', $cliente->id)
            ->orderBy('fecha', 'desc')
            ->first();

        return response()->json([
            'success' => true,
            'data' => [
                'usuario' => [
                    'nombre_completo' => $cliente->nombre_completo,
                    'nombre' => $cliente->nombre,
                    'apellido' => $cliente->apellido,
                    'dni' => $cliente->dni,
                    'telefono' => $cliente->telefono,
                    'email' => $cliente->email,
                    'tipo_cliente' => $cliente->tipo_cliente,
                ],
                'estadisticas' => [
                    'inscripciones_activas' => $inscripcionesActivas,
                    'total_asistencias' => $totalAsistencias,
                    'ultima_asistencia' => $ultimaAsistencia ? $ultimaAsistencia->fecha->format('d/m/Y') : null,
                    'miembro_desde' => $cliente->created_at->format('d/m/Y'),
                ],
            ],
        ]);
    }

    /**
     * Actualizar perfil del cliente
     */
    public function actualizarPerfil(Request $request)
    {
        $cliente = $request->user();

        $validated = $request->validate([
            'telefono' => 'sometimes|string',
            'email' => 'sometimes|email|unique:users,email,' . $cliente->id,
        ]);

        $cliente->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Perfil actualizado correctamente',
            'data' => $cliente,
        ]);
    }
}
