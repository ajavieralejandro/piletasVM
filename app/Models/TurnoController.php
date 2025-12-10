<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Turno;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TurnoController extends Controller
{
    /**
     * Listar todos los turnos
     */
    public function index(Request $request)
    {
        $query = Turno::with(['profesor', 'nivel']);

        // Filtros opcionales
        if ($request->has('dia_semana')) {
            $query->where('dia_semana', $request->dia_semana);
        }

        if ($request->has('profesor_id')) {
            $query->where('profesor_id', $request->profesor_id);
        }

        if ($request->has('nivel_id')) {
            $query->where('nivel_id', $request->nivel_id);
        }

        if ($request->has('activo')) {
            $query->where('activo', $request->activo);
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

    /**
     * Crear un nuevo turno
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'profesor_id' => 'required|exists:users,id',
            'nivel_id' => 'nullable|exists:niveles,id',
            'hora_inicio' => 'required|date_format:H:i',
            'hora_fin' => 'required|date_format:H:i|after:hora_inicio',
            'cupo_maximo' => 'required|integer|min:1|max:50',
            'dia_semana' => 'required|in:lunes,martes,miercoles,jueves,viernes,sabado,domingo',
            'activo' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $turno = Turno::create($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'Turno creado exitosamente',
            'data' => $turno->load(['profesor', 'nivel']),
        ], 201);
    }

    /**
     * Mostrar un turno específico
     */
    public function show($id)
    {
        $turno = Turno::with(['profesor', 'nivel', 'inscripciones.alumno'])->find($id);

        if (!$turno) {
            return response()->json([
                'success' => false,
                'message' => 'Turno no encontrado',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $turno->id,
                'profesor' => [
                    'id' => $turno->profesor->id,
                    'nombre_completo' => $turno->profesor->nombre_completo,
                ],
                'nivel' => $turno->nivel ? [
                    'id' => $turno->nivel->id,
                    'nombre' => $turno->nivel->nombre,
                ] : null,
                'dia_semana' => $turno->dia_semana,
                'hora_inicio' => $turno->hora_inicio->format('H:i'),
                'hora_fin' => $turno->hora_fin->format('H:i'),
                'cupo_maximo' => $turno->cupo_maximo,
                'cupo_disponible' => $turno->cupo_disponible,
                'esta_completo' => $turno->esta_completo,
                'activo' => $turno->activo,
                'inscriptos' => $turno->inscripciones->where('estado', 'activo')->map(function ($inscripcion) {
                    return [
                        'id' => $inscripcion->alumno->id,
                        'nombre_completo' => $inscripcion->alumno->nombre_completo,
                        'dni' => $inscripcion->alumno->dni,
                    ];
                }),
            ],
        ]);
    }

    /**
     * Actualizar un turno
     */
    public function update(Request $request, $id)
    {
        $turno = Turno::find($id);

        if (!$turno) {
            return response()->json([
                'success' => false,
                'message' => 'Turno no encontrado',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'profesor_id' => 'sometimes|required|exists:users,id',
            'nivel_id' => 'nullable|exists:niveles,id',
            'hora_inicio' => 'sometimes|required|date_format:H:i',
            'hora_fin' => 'sometimes|required|date_format:H:i|after:hora_inicio',
            'cupo_maximo' => 'sometimes|required|integer|min:1|max:50',
            'dia_semana' => 'sometimes|required|in:lunes,martes,miercoles,jueves,viernes,sabado,domingo',
            'activo' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $turno->update($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'Turno actualizado exitosamente',
            'data' => $turno->load(['profesor', 'nivel']),
        ]);
    }

    /**
     * Eliminar un turno (soft delete)
     */
    public function destroy($id)
    {
        $turno = Turno::find($id);

        if (!$turno) {
            return response()->json([
                'success' => false,
                'message' => 'Turno no encontrado',
            ], 404);
        }

        $turno->delete();

        return response()->json([
            'success' => true,
            'message' => 'Turno eliminado exitosamente',
        ]);
    }

    /**
     * Activar/Desactivar turno
     */
    public function toggleActivo($id)
    {
        $turno = Turno::find($id);

        if (!$turno) {
            return response()->json([
                'success' => false,
                'message' => 'Turno no encontrado',
            ], 404);
        }

        $turno->activo = !$turno->activo;
        $turno->save();

        return response()->json([
            'success' => true,
            'message' => $turno->activo ? 'Turno activado' : 'Turno desactivado',
            'data' => $turno,
        ]);
    }
}
