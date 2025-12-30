<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Turno;
use App\Models\Clase;
use App\Models\Nivel;
use Carbon\Carbon;
use Illuminate\Http\Request;

class TurnoController extends Controller
{
    // ============================
    // LISTADO DE TURNOS (PLANO)
    // ============================
    public function index(Request $request)
    {
        $query = Turno::with(['profesor', 'nivel', 'pileta']);

        if ($request->filled('dia_semana')) {
            $query->where('dia_semana', $request->dia_semana);
        }

        if ($request->filled('dias')) {
            $dias = explode(',', $request->dias);
            $query->whereIn('dia_semana', $dias);
        }

        if ($request->filled('profesor_id')) {
            $query->where('profesor_id', $request->profesor_id);
        }

        if ($request->filled('nivel_id')) {
            $query->where('nivel_id', $request->nivel_id);
        }

        if ($request->filled('pileta_id')) {
            $query->where('pileta_id', $request->pileta_id);
        }

        if ($request->filled('solo_activos')) {
            $soloActivos = filter_var($request->solo_activos, FILTER_VALIDATE_BOOLEAN);
            $query->where('activo', $soloActivos);
        }

        $turnos = $query->get();

        return response()->json([
            'success' => true,
            'data' => $turnos->map(function ($turno) {
                return [
                    'id' => $turno->id,

                    'profesor' => $turno->profesor ? [
                        'id' => $turno->profesor->id,
                        'nombre_completo' => $turno->profesor->nombre_completo,
                    ] : null,

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
                    'hora_inicio' => optional($turno->hora_inicio)->format('H:i'),
                    'hora_fin' => optional($turno->hora_fin)->format('H:i'),
                    'cupo_maximo' => $turno->cupo_maximo,
                    'cupo_disponible' => $turno->cupo_disponible,
                    'esta_completo' => $turno->esta_completo,
                    'activo' => $turno->activo,
                ];
            }),
        ]);
    }

    // ============================
    // LISTADO AGRUPADO POR NIVELES ✅
    // ============================
    public function porNiveles(Request $request)
    {
        $niveles = Nivel::query()
            ->with(['turnos' => function ($q) use ($request) {
                $q->with(['profesor', 'nivel', 'pileta'])
                  ->withCount(['inscripciones as inscriptos_activos_count' => function ($qq) {
                      $qq->where('estado', 'activo');
                  }])
                  ->orderBy('dia_semana')
                  ->orderBy('hora_inicio');

                if ($request->filled('pileta_id')) {
                    $q->where('pileta_id', $request->pileta_id);
                }
                if ($request->filled('profesor_id')) {
                    $q->where('profesor_id', $request->profesor_id);
                }
                if ($request->filled('dias')) {
                    $dias = explode(',', $request->dias);
                    $q->whereIn('dia_semana', $dias);
                }
                if ($request->filled('solo_activos')) {
                    $soloActivos = filter_var($request->solo_activos, FILTER_VALIDATE_BOOLEAN);
                    $q->where('activo', $soloActivos);
                }
            }])
            ->orderBy('id') // si tenés campo "orden" en niveles, poné ->orderBy('orden')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $niveles->map(function ($nivel) {
                return [
                    'id' => $nivel->id,
                    'nombre' => $nivel->nombre,
                    'turnos' => $nivel->turnos->map(function ($turno) {
                        $insc = (int)($turno->inscriptos_activos_count ?? 0);
                        $cupoDisp = (int)$turno->cupo_maximo - $insc;

                        return [
                            'id' => $turno->id,
                            'dia_semana' => $turno->dia_semana,
                            'hora_inicio' => optional($turno->hora_inicio)->format('H:i'),
                            'hora_fin' => optional($turno->hora_fin)->format('H:i'),
                            'cupo_maximo' => $turno->cupo_maximo,
                            'inscriptos_activos' => $insc,
                            'cupo_disponible' => $cupoDisp,
                            'esta_completo' => $cupoDisp <= 0,
                            'activo' => $turno->activo,

                            'profesor' => $turno->profesor ? [
                                'id' => $turno->profesor->id,
                                'nombre_completo' => $turno->profesor->nombre_completo,
                            ] : null,

                            'nivel' => $turno->nivel ? [
                                'id' => $turno->nivel->id,
                                'nombre' => $turno->nivel->nombre,
                            ] : null,

                            'pileta' => $turno->pileta ? [
                                'id' => $turno->pileta->id,
                                'nombre' => $turno->pileta->nombre,
                                'activa' => $turno->pileta->activa,
                            ] : null,
                        ];
                    }),
                ];
            }),
        ]);
    }

    // ============================
    // CREAR TURNO
    // ============================
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

    // ============================
    // ACTUALIZAR TURNO (incluye activo/inactivo)
    // ============================
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

        // Validación de cupo: no bajar por debajo de inscriptos activos
        if (array_key_exists('cupo_maximo', $validated)) {
            $inscriptos = $turno->inscripciones()->where('estado', 'activo')->count();
            if ((int)$validated['cupo_maximo'] < (int)$inscriptos) {
                return response()->json([
                    'success' => false,
                    'message' => 'No podés bajar el cupo por debajo de los inscriptos activos.',
                    'data' => ['inscriptos_activos' => $inscriptos],
                ], 422);
            }
        }

        $dia = $validated['dia_semana'] ?? $turno->dia_semana;
        $piletaId = $validated['pileta_id'] ?? $turno->pileta_id;
        $inicio = $validated['hora_inicio'] ?? optional($turno->hora_inicio)->format('H:i');
        $fin = $validated['hora_fin'] ?? optional($turno->hora_fin)->format('H:i');

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

    // Toggle dedicado (opcional)
    public function toggleActivo($id)
    {
        $turno = Turno::findOrFail($id);
        $turno->activo = !$turno->activo;
        $turno->save();

        return response()->json([
            'success' => true,
            'message' => 'Estado del turno actualizado',
            'data' => [
                'id' => $turno->id,
                'activo' => $turno->activo,
            ],
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
                    'hora_inicio' => optional($turno->hora_inicio)->format('H:i'),
                    'hora_fin' => optional($turno->hora_fin)->format('H:i'),
                    'activo' => $turno->activo,
                    'pileta' => $turno->pileta ? [
                        'id' => $turno->pileta->id,
                        'nombre' => $turno->pileta->nombre,
                    ] : null,
                    'nivel' => $turno->nivel ? [
                        'id' => $turno->nivel->id,
                        'nombre' => $turno->nivel->nombre,
                    ] : null,
                    'profesor' => $turno->profesor ? [
                        'id' => $turno->profesor->id,
                        'nombre_completo' => $turno->profesor->nombre_completo,
                    ] : null,
                ],
                'inscripciones' => $turno->inscripciones->map(function ($inscripcion) {
                    return [
                        'id' => $inscripcion->id,
                        'alumno' => $inscripcion->alumno ? [
                            'id' => $inscripcion->alumno->id,
                            'nombre_completo' => $inscripcion->alumno->nombre_completo,
                            'dni' => $inscripcion->alumno->dni,
                            'telefono' => $inscripcion->alumno->telefono,
                        ] : null,
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
