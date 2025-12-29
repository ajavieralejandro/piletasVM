<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Turno;
use App\Models\Clase;
use Carbon\Carbon;
use Illuminate\Http\Request;

class TurnoController extends Controller
{
    public function index(Request $request)
    {
        $query = Turno::with(['profesor', 'nivel', 'pileta']);

        if ($request->has('dia_semana')) {
            $query->where('dia_semana', $request->dia_semana);
        }

        if ($request->has('dias')) {
            $dias = explode(',', $request->dias);
            $query->whereIn('dia_semana', $dias);
        }

        if ($request->has('profesor_id')) {
            $query->where('profesor_id', $request->profesor_id);
        }

        if ($request->has('nivel_id')) {
            $query->where('nivel_id', $request->nivel_id);
        }

        if ($request->has('pileta_id')) {
            $query->where('pileta_id', $request->pileta_id);
        }

        $turnos = $query->get();

        return response()->json([
            'success' => true,
            'data' => $turnos->map(function ($turno) {
                return [
                    'id' => $turno->id,

                    'profesor' => [
                        'id' => $turno->profesor->id,
                        'nombre_completo' => $turno->profesor->nombre_completo,
                    ],

                    'nivel' => $turno->nivel ? [
                        'id' => $turno->nivel->id,
                        'nombre' => $turno->nivel->nombre,
                    ] : null,

                    'pileta' => $turno->pileta ? [
                        'id' => $turno->pileta->id,
                        'nombre' => $turno->pileta->nombre,
                        'activa' => $turno->pileta->activa,
                    ] : null,

                    'dia_semana' => $turno->dia_semana,
                    'hora_inicio' => $turno->hora_inicio->format('H:i'),
                    'hora_fin' => $turno->hora_fin->format('H:i'),
                    'cupo_maximo' => $turno->cupo_maximo,
                    'cupo_disponible' => $turno->cupo_disponible,
                    'esta_completo' => $turno->esta_completo,
                    'activo' => $turno->activo,
                ];
            }),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'profesor_id' => 'required|exists:users,id',
            'nivel_id' => 'nullable|exists:niveles,id',
            'pileta_id' => 'required|exists:piletas,id',
            'hora_inicio' => 'required|date_format:H:i',
            'hora_fin' => 'required|date_format:H:i|after:hora_inicio',
            'cupo_maximo' => 'required|integer|min:1|max:50',
            'dia_semana' => 'required|in:lunes,martes,miercoles,jueves,viernes,sabado,domingo',
        ]);

        // Validación anti-solapamiento (misma pileta + mismo día)
        $solapa = Turno::where('dia_semana', $validated['dia_semana'])
            ->where('pileta_id', $validated['pileta_id'])
            ->whereNull('deleted_at')
            ->where(function ($q) use ($validated) {
                $q->where('hora_inicio', '<', $validated['hora_fin'])
                  ->where('hora_fin', '>', $validated['hora_inicio']);
            })
            ->exists();

        if ($solapa) {
            return response()->json([
                'success' => false,
                'message' => 'Ese horario se superpone con otro turno en la misma pileta.',
            ], 422);
        }

        $validated['activo'] = true;

        $turno = Turno::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Turno creado exitosamente',
            'data' => $turno->load(['profesor', 'nivel', 'pileta']),
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $turno = Turno::findOrFail($id);

        $validated = $request->validate([
            'profesor_id' => 'sometimes|exists:users,id',
            'nivel_id' => 'nullable|exists:niveles,id',
            'pileta_id' => 'sometimes|exists:piletas,id',
            'hora_inicio' => 'sometimes|date_format:H:i',
            'hora_fin' => 'sometimes|date_format:H:i',
            'cupo_maximo' => 'sometimes|integer|min:1|max:50',
            'dia_semana' => 'sometimes|in:lunes,martes,miercoles,jueves,viernes,sabado,domingo',
            'activo' => 'sometimes|boolean',
        ]);

        $dia = $validated['dia_semana'] ?? $turno->dia_semana;
        $piletaId = $validated['pileta_id'] ?? $turno->pileta_id;
        $inicio = $validated['hora_inicio'] ?? $turno->hora_inicio->format('H:i');
        $fin = $validated['hora_fin'] ?? $turno->hora_fin->format('H:i');

        if (isset($validated['hora_inicio']) || isset($validated['hora_fin']) || isset($validated['dia_semana']) || isset($validated['pileta_id'])) {

            if ($inicio >= $fin) {
                return response()->json([
                    'success' => false,
                    'message' => 'La hora_fin debe ser posterior a hora_inicio.',
                ], 422);
            }

            $solapa = Turno::where('id', '!=', $turno->id)
                ->where('dia_semana', $dia)
                ->where('pileta_id', $piletaId)
                ->whereNull('deleted_at')
                ->where(function ($q) use ($inicio, $fin) {
                    $q->where('hora_inicio', '<', $fin)
                      ->where('hora_fin', '>', $inicio);
                })
                ->exists();

            if ($solapa) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ese horario se superpone con otro turno en la misma pileta.',
                ], 422);
            }
        }

        $turno->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Turno actualizado exitosamente',
            'data' => $turno->load(['profesor', 'nivel', 'pileta']),
        ]);
    }

    public function destroy($id)
    {
        $turno = Turno::findOrFail($id);
        $turno->delete();

        return response()->json([
            'success' => true,
            'message' => 'Turno eliminado exitosamente',
        ]);
    }

    public function inscripciones($id)
    {
        $turno = Turno::with(['inscripciones.alumno', 'pileta', 'nivel', 'profesor'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'turno' => [
                    'id' => $turno->id,
                    'dia_semana' => $turno->dia_semana,
                    'hora_inicio' => $turno->hora_inicio->format('H:i'),
                    'hora_fin' => $turno->hora_fin->format('H:i'),
                    'activo' => $turno->activo,
                    'pileta' => $turno->pileta ? [
                        'id' => $turno->pileta->id,
                        'nombre' => $turno->pileta->nombre,
                    ] : null,
                    'nivel' => $turno->nivel ? [
                        'id' => $turno->nivel->id,
                        'nombre' => $turno->nivel->nombre,
                    ] : null,
                    'profesor' => [
                        'id' => $turno->profesor->id,
                        'nombre_completo' => $turno->profesor->nombre_completo,
                    ],
                ],
                'inscripciones' => $turno->inscripciones->map(function ($inscripcion) {
                    return [
                        'id' => $inscripcion->id,
                        'alumno' => [
                            'id' => $inscripcion->alumno->id,
                            'nombre_completo' => $inscripcion->alumno->nombre_completo,
                            'dni' => $inscripcion->alumno->dni,
                            'telefono' => $inscripcion->alumno->telefono,
                        ],
                        'estado' => $inscripcion->estado,
                        'pase_libre' => $inscripcion->pase_libre,
                        'fecha_inscripcion' => $inscripcion->fecha_inscripcion,
                    ];
                }),
            ],
        ]);
    }

    // ============================
    // CLASES (Modelo A)
    // ============================

    public function clases($id)
    {
        $turno = Turno::with(['clases' => function ($q) {
            $q->orderBy('fecha', 'asc');
        }])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $turno->clases->map(function ($clase) {
                return [
                    'id' => $clase->id,
                    'fecha' => $clase->fecha->format('Y-m-d'),
                    'estado' => $clase->estado,
                    'observaciones' => $clase->observaciones,
                ];
            }),
        ]);
    }

    public function generarClases(Request $request, $id)
    {
        $turno = Turno::findOrFail($id);

        $validated = $request->validate([
            'fecha_desde' => 'required|date_format:Y-m-d',
            'fecha_hasta' => 'required|date_format:Y-m-d|after_or_equal:fecha_desde',
        ]);

        $mapDia = [
            'lunes' => Carbon::MONDAY,
            'martes' => Carbon::TUESDAY,
            'miercoles' => Carbon::WEDNESDAY,
            'jueves' => Carbon::THURSDAY,
            'viernes' => Carbon::FRIDAY,
            'sabado' => Carbon::SATURDAY,
            'domingo' => Carbon::SUNDAY,
        ];

        $desde = Carbon::createFromFormat('Y-m-d', $validated['fecha_desde'])->startOfDay();
        $hasta = Carbon::createFromFormat('Y-m-d', $validated['fecha_hasta'])->startOfDay();
        $weekday = $mapDia[$turno->dia_semana];

        $cursor = $desde->copy();
        while ($cursor->dayOfWeek !== $weekday) {
            $cursor->addDay();
            if ($cursor->gt($hasta)) break;
        }

        $rows = [];
        while ($cursor->lte($hasta)) {
            $rows[] = [
                'turno_id' => $turno->id,
                'fecha' => $cursor->format('Y-m-d'),
                'estado' => 'programada',
                'observaciones' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ];
            $cursor->addWeek();
        }

        Clase::upsert(
            $rows,
            ['turno_id', 'fecha'],
            ['estado', 'observaciones', 'updated_at']
        );

        return response()->json([
            'success' => true,
            'message' => 'Clases generadas correctamente',
            'data' => [
                'turno_id' => $turno->id,
                'desde' => $validated['fecha_desde'],
                'hasta' => $validated['fecha_hasta'],
                'cantidad' => count($rows),
            ],
        ]);
    }
}
