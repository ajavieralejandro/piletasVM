<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notificacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificacionesController extends Controller
{
    /**
     * Obtener notificaciones del usuario autenticado
     */
    public function misNotificaciones()
    {
        $notificaciones = Notificacion::where('usuario_id', Auth::id())
                                      ->orderBy('created_at', 'desc')
                                      ->limit(50)
                                      ->get()
                                      ->map(function($notif) {
                                          return [
                                              'id' => $notif->id,
                                              'tipo' => $notif->tipo,
                                              'titulo' => $notif->titulo,
                                              'mensaje' => $notif->mensaje,
                                              'leida' => $notif->leida,
                                              'url' => $notif->url,
                                              'fecha' => $notif->created_at->diffForHumans(),
                                              'fecha_completa' => $notif->created_at->format('d/m/Y H:i'),
                                          ];
                                      });

        return response()->json([
            'success' => true,
            'data' => $notificaciones,
        ]);
    }

    /**
     * Obtener contador de notificaciones no leídas
     */
    public function contarNoLeidas()
    {
        $noLeidas = Notificacion::where('usuario_id', Auth::id())
                                ->where('leida', false)
                                ->count();

        return response()->json([
            'success' => true,
            'data' => ['no_leidas' => $noLeidas],
        ]);
    }

    /**
     * Marcar notificación como leída
     */
    public function marcarComoLeida($id)
    {
        $notificacion = Notificacion::where('usuario_id', Auth::id())
                                    ->findOrFail($id);
        
        $notificacion->marcarComoLeida();

        return response()->json([
            'success' => true,
            'message' => 'Notificación marcada como leída',
        ]);
    }

    /**
     * Marcar todas las notificaciones como leídas
     */
    public function marcarTodasLeidas()
    {
        Notificacion::where('usuario_id', Auth::id())
                    ->where('leida', false)
                    ->update([
                        'leida' => true,
                        'fecha_leida' => now(),
                    ]);

        return response()->json([
            'success' => true,
            'message' => 'Todas las notificaciones marcadas como leídas',
        ]);
    }

    /**
     * Eliminar notificación
     */
    public function eliminar($id)
    {
        $notificacion = Notificacion::where('usuario_id', Auth::id())
                                    ->findOrFail($id);
        
        $notificacion->delete();

        return response()->json([
            'success' => true,
            'message' => 'Notificación eliminada',
        ]);
    }

    /**
     * Eliminar todas las notificaciones leídas
     */
    public function limpiarLeidas()
    {
        Notificacion::where('usuario_id', Auth::id())
                    ->where('leida', true)
                    ->delete();

        return response()->json([
            'success' => true,
            'message' => 'Notificaciones leídas eliminadas',
        ]);
    }
}
