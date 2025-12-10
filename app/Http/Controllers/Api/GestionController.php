<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Cuota;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class GestionController extends Controller
{
    /**
     * Cambiar estado de usuario (activar/desactivar)
     */
    public function cambiarEstadoUsuario(Request $request, $id)
    {
        $validated = $request->validate([
            'activo' => 'required|boolean',
        ]);

        $user = User::findOrFail($id);
        $user->update(['activo' => $validated['activo']]);

        return response()->json([
            'success' => true,
            'message' => $validated['activo'] ? 'Usuario activado' : 'Usuario desactivado',
            'data' => $user,
        ]);
    }

    /**
     * Cambiar tipo de cliente
     */
    public function cambiarTipoCliente(Request $request, $id)
    {
        $validated = $request->validate([
            'tipo_cliente' => 'required|in:socio,no_socio,pase_libre',
            'monto_cuota' => 'nullable|numeric|min:0',
        ]);

        $user = User::findOrFail($id);
        
        $user->update([
            'tipo_cliente' => $validated['tipo_cliente'],
            'monto_cuota' => $validated['monto_cuota'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tipo de cliente actualizado',
            'data' => $user,
        ]);
    }

    /**
     * Crear cuota para un cliente
     */
    public function crearCuota(Request $request)
    {
        $validated = $request->validate([
            'alumno_id' => 'required|exists:users,id',
            'monto' => 'required|numeric|min:0',
            'fecha_vencimiento' => 'required|date',
            'observaciones' => 'nullable|string',
        ]);

        $cuota = Cuota::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Cuota creada correctamente',
            'data' => $cuota->load('alumno'),
        ], 201);
    }

    /**
     * Listar cuotas (todas o filtradas)
     */
    public function listarCuotas(Request $request)
    {
        $query = Cuota::with('alumno');

        // Filtros
        if ($request->has('estado')) {
            $query->where('estado', $request->estado);
        }

        if ($request->has('alumno_id')) {
            $query->where('alumno_id', $request->alumno_id);
        }

        if ($request->has('vencidas')) {
            $query->vencidas();
        }

        if ($request->has('proximas_vencer')) {
            $dias = $request->input('dias', 7);
            $query->proximasVencer($dias);
        }

        $cuotas = $query->orderBy('fecha_vencimiento', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $cuotas->map(function ($cuota) {
                return [
                    'id' => $cuota->id,
                    'alumno' => [
                        'id' => $cuota->alumno->id,
                        'nombre_completo' => $cuota->alumno->nombre_completo,
                        'dni' => $cuota->alumno->dni,
                        'email' => $cuota->alumno->email,
                    ],
                    'monto' => $cuota->monto,
                    'fecha_vencimiento' => $cuota->fecha_vencimiento->format('Y-m-d'),
                    'fecha_vencimiento_formatted' => $cuota->fecha_vencimiento->format('d/m/Y'),
                    'estado' => $cuota->estado,
                    'fecha_pago' => $cuota->fecha_pago ? $cuota->fecha_pago->format('d/m/Y') : null,
                    'observaciones' => $cuota->observaciones,
                    'dias_para_vencer' => $cuota->fecha_vencimiento->diffInDays(Carbon::now(), false),
                ];
            }),
        ]);
    }

    /**
     * Marcar cuota como pagada
     */
    public function marcarCuotaPagada(Request $request, $id)
    {
        $validated = $request->validate([
            'fecha_pago' => 'nullable|date',
        ]);

        $cuota = Cuota::findOrFail($id);
        $cuota->marcarComoPagada($validated['fecha_pago'] ?? null);

        return response()->json([
            'success' => true,
            'message' => 'Cuota marcada como pagada',
            'data' => $cuota,
        ]);
    }

    /**
     * Enviar recordatorio manual
     */
    public function enviarRecordatorio($id)
    {
        $cuota = Cuota::with('alumno')->findOrFail($id);

        if (!$cuota->alumno->email) {
            return response()->json([
                'success' => false,
                'message' => 'El alumno no tiene email registrado',
            ], 400);
        }

        // Enviar email
        try {
            Mail::send('emails.recordatorio-cuota', ['cuota' => $cuota], function ($message) use ($cuota) {
                $message->to($cuota->alumno->email)
                        ->subject('Recordatorio: Vencimiento de Cuota - Club Villa Mitre');
            });

            $cuota->update(['recordatorio_enviado' => true]);

            return response()->json([
                'success' => true,
                'message' => 'Recordatorio enviado correctamente',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al enviar recordatorio: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Estadísticas de cuotas
     */
    public function estadisticasCuotas()
    {
        $pendientes = Cuota::where('estado', 'pendiente')->count();
        $vencidas = Cuota::vencidas()->count();
        $pagadas = Cuota::where('estado', 'pagada')->count();
        $proximasVencer = Cuota::proximasVencer(7)->count();

        $montoPendiente = Cuota::where('estado', 'pendiente')->sum('monto');
        $montoVencido = Cuota::vencidas()->sum('monto');
        $montoPagado = Cuota::where('estado', 'pagada')
                            ->whereMonth('fecha_pago', Carbon::now()->month)
                            ->sum('monto');

        return response()->json([
            'success' => true,
            'data' => [
                'cantidad' => [
                    'pendientes' => $pendientes,
                    'vencidas' => $vencidas,
                    'pagadas' => $pagadas,
                    'proximas_vencer' => $proximasVencer,
                ],
                'montos' => [
                    'pendiente' => $montoPendiente,
                    'vencido' => $montoVencido,
                    'pagado_mes_actual' => $montoPagado,
                ],
            ],
        ]);
    }
}
