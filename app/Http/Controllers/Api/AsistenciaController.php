<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Asistencia;
use App\Models\Inscripcion;
use App\Models\Turno;
use App\Models\User;
use Illuminate\Http\Request;

class AsistenciaController extends Controller
{
    // POST /api/asistencias  (registrar/actualizar asistencia)
    public function store(Request $request)
    {
        $data = $request->validate([
            'turno_id' => ['required', 'exists:turnos,id'],
            'alumno_id' => ['required', 'exists:users,id'],
            'fecha' => ['required', 'date_format:Y-m-d'],
            'estado' => ['required', 'in:presente,ausente'],
            'observaciones' => ['nullable', 'string', 'max:255'],
        ]);

        // Validar que el alumno tenga inscripción activa en ese turno
        $tiene = Inscripcion::query()
            ->where('turno_id', $data['turno_id'])
            ->where('alumno_id', $data['alumno_id'])
            ->where('estado', 'activo')
            ->exists();

        if (!$tiene) {
            return response()->json([
                'success' => false,
                'message' => 'El alumno no tiene una inscripción activa en este turno.',
            ], 422);
        }

        // Upsert lógico: un registro por alumno/turno/fecha
        $asistencia = Asistencia::updateOrCreate(
            [
                'turno_id' => $data['turno_id'],
                'alumno_id' => $data['alumno_id'],
                'fecha' => $data['fecha'],
            ],
            [
                'estado' => $data['estado'],
                'observaciones' => $data['observaciones'] ?? null,
            ]
        );

        // TODO: notificación al alumno (push/email/in-app)
        // $alumno = User::find($data['alumno_id']);
        // $alumno->notify(new AsistenciaRegistradaNotification($asistencia));

        return response()->json([
            'success' => true,
            'message' => 'Asistencia registrada',
            'data' => $asistencia->load(['alumno', 'turno']),
        ]);
    }

    // GET /api/alumnos/{alumno}/asistencias?turno_id=&desde=&hasta=
    public function historialAlumno(Request $request, User $alumno)
    {
        $q = Asistencia::query()
            ->where('alumno_id', $alumno->id)
            ->with(['turno.nivel', 'turno.profesor', 'turno.pileta'])
            ->orderByDesc('fecha');

        if ($request->filled('turno_id')) {
            $q->where('turno_id', $request->turno_id);
        }
        if ($request->filled('desde')) {
            $q->whereDate('fecha', '>=', $request->desde);
        }
        if ($request->filled('hasta')) {
            $q->whereDate('fecha', '<=', $request->hasta);
        }

        return response()->json([
            'success' => true,
            'data' => $q->paginate(30),
        ]);
    }

    // GET /api/turnos/{turno}/asistencias?fecha=YYYY-MM-DD
    public function asistenciasPorTurno(Request $request, Turno $turno)
    {
        $request->validate([
            'fecha' => ['required', 'date_format:Y-m-d'],
        ]);

        $items = Asistencia::query()
            ->where('turno_id', $turno->id)
            ->whereDate('fecha', $request->fecha)
            ->with('alumno')
            ->orderBy('alumno_id')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'turno_id' => $turno->id,
                'fecha' => $request->fecha,
                'items' => $items->map(fn($a) => [
                    'id' => $a->id,
                    'alumno' => [
                        'id' => $a->alumno->id,
                        'nombre_completo' => $a->alumno->nombre_completo,
                        'dni' => $a->alumno->dni,
                        'telefono' => $a->alumno->telefono,
                    ],
                    'estado' => $a->estado,
                    'observaciones' => $a->observaciones,
                ]),
            ],
        ]);
    }
}
