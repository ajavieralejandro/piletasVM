<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Turno;
use App\Models\Inscripcion;
use App\Models\Asistencia;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ProfesorDashboardController extends Controller
{
    /**
     * Obtener turnos del profesor autenticado
     */
    public function misTurnos(Request $request)
    {
        $profesor = $request->user();

        $turnos = Turno::where('profesor_id', $profesor->id)
            ->where('activo', true)
            ->with(['nivel', 'inscripciones'])
            ->orderBy('dia_semana')
            ->orderBy('hora_inicio')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $turnos->map(function ($turno) {
                return [
                    'id' => $turno->id,
                    'dia_semana' => $turno->dia_semana,
                    'hora_inicio' => $turno->hora_inicio,
                    'hora_fin' => $turno->hora_fin,
                    'nivel' => $turno->nivel ? $turno->nivel->nombre : 'Sin nivel',
                    'cupo_maximo' => $turno->cupo_maximo,
                    'inscriptos' => $turno->inscripciones->count(),
                    'cupo_disponible' => $turno->cupo_disponible,
                ];
            }),
        ]);
    }

    /**
     * Obtener alumnos de un turno específico
     */
    public function alumnosTurno($turnoId)
    {
        $turno = Turno::with(['inscripciones.alumno'])->findOrFail($turnoId);

        $alumnos = $turno->inscripciones->map(function ($inscripcion) {
            return [
                'id' => $inscripcion->alumno->id,
                'nombre_completo' => $inscripcion->alumno->nombre_completo,
                'dni' => $inscripcion->alumno->dni,
                'telefono' => $inscripcion->alumno->telefono,
                'tipo_cliente' => $inscripcion->alumno->tipo_cliente,
                'pase_libre' => $inscripcion->pase_libre,
                'fecha_inscripcion' => $inscripcion->created_at->format('d/m/Y'),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'turno' => [
                    'id' => $turno->id,
                    'dia_semana' => $turno->dia_semana,
                    'hora_inicio' => $turno->hora_inicio,
                    'hora_fin' => $turno->hora_fin,
                    'nivel' => $turno->nivel ? $turno->nivel->nombre : 'Sin nivel',
                ],
                'alumnos' => $alumnos,
            ],
        ]);
    }

    /**
     * Obtener asistencias de un turno para una fecha
     */
    public function asistenciasTurno(Request $request, $turnoId)
    {
        $fecha = $request->input('fecha', Carbon::today()->format('Y-m-d'));
        
        $turno = Turno::with(['inscripciones.alumno'])->findOrFail($turnoId);

        // Obtener asistencias ya registradas
        $asistenciasRegistradas = Asistencia::where('turno_id', $turnoId)
            ->where('fecha', $fecha)
            ->get()
            ->keyBy('alumno_id');

        $alumnos = $turno->inscripciones->map(function ($inscripcion) use ($asistenciasRegistradas) {
            $asistencia = $asistenciasRegistradas->get($inscripcion->alumno_id);

            return [
                'id' => $inscripcion->alumno->id,
                'nombre_completo' => $inscripcion->alumno->nombre_completo,
                'dni' => $inscripcion->alumno->dni,
                'asistencia_id' => $asistencia ? $asistencia->id : null,
                'estado' => $asistencia ? $asistencia->estado : null,
                'observaciones' => $asistencia ? $asistencia->observaciones : null,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'turno' => [
                    'id' => $turno->id,
                    'dia_semana' => $turno->dia_semana,
                    'hora_inicio' => $turno->hora_inicio,
                    'hora_fin' => $turno->hora_fin,
                    'nivel' => $turno->nivel ? $turno->nivel->nombre : 'Sin nivel',
                ],
                'fecha' => $fecha,
                'alumnos' => $alumnos,
            ],
        ]);
    }

    /**
     * Registrar o actualizar asistencia
     */
    public function registrarAsistencia(Request $request)
    {
        $validated = $request->validate([
            'turno_id' => 'required|exists:turnos,id',
            'alumno_id' => 'required|exists:users,id',
            'fecha' => 'required|date',
            'estado' => 'required|in:presente,ausente,justificado',
            'observaciones' => 'nullable|string',
        ]);

        $asistencia = Asistencia::updateOrCreate(
            [
                'turno_id' => $validated['turno_id'],
                'alumno_id' => $validated['alumno_id'],
                'fecha' => $validated['fecha'],
            ],
            [
                'estado' => $validated['estado'],
                'observaciones' => $validated['observaciones'] ?? null,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Asistencia registrada',
            'data' => $asistencia,
        ]);
    }

    /**
     * Registrar múltiples asistencias
     */
    public function registrarAsistenciasMasivas(Request $request)
    {
        $validated = $request->validate([
            'turno_id' => 'required|exists:turnos,id',
            'fecha' => 'required|date',
            'asistencias' => 'required|array',
            'asistencias.*.alumno_id' => 'required|exists:users,id',
            'asistencias.*.estado' => 'required|in:presente,ausente,justificado',
            'asistencias.*.observaciones' => 'nullable|string',
        ]);

        foreach ($validated['asistencias'] as $asistenciaData) {
            Asistencia::updateOrCreate(
                [
                    'turno_id' => $validated['turno_id'],
                    'alumno_id' => $asistenciaData['alumno_id'],
                    'fecha' => $validated['fecha'],
                ],
                [
                    'estado' => $asistenciaData['estado'],
                    'observaciones' => $asistenciaData['observaciones'] ?? null,
                ]
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Asistencias registradas correctamente',
        ]);
    }
}
