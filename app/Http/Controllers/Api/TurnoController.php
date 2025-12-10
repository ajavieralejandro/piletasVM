<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Turno;
use Illuminate\Http\Request;

class TurnoController extends Controller
{
    public function index(Request $request)
    {
        $query = Turno::with(['profesor', 'nivel']);

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

    public function store(Request $request)
    {
        $validated = $request->validate([
            'profesor_id' => 'required|exists:users,id',
            'nivel_id' => 'nullable|exists:niveles,id',
            'hora_inicio' => 'required|date_format:H:i',
            'hora_fin' => 'required|date_format:H:i|after:hora_inicio',
            'cupo_maximo' => 'required|integer|min:1|max:50',
            'dia_semana' => 'required|in:lunes,martes,miercoles,jueves,viernes,sabado,domingo',
        ]);

        $validated['activo'] = true;
        $turno = Turno::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Turno creado exitosamente',
            'data' => $turno->load(['profesor', 'nivel']),
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $turno = Turno::findOrFail($id);

        $validated = $request->validate([
            'profesor_id' => 'sometimes|exists:users,id',
            'nivel_id' => 'nullable|exists:niveles,id',
            'hora_inicio' => 'sometimes|date_format:H:i',
            'hora_fin' => 'sometimes|date_format:H:i',
            'cupo_maximo' => 'sometimes|integer|min:1|max:50',
            'dia_semana' => 'sometimes|in:lunes,martes,miercoles,jueves,viernes,sabado,domingo',
            'activo' => 'sometimes|boolean',
        ]);

        $turno->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Turno actualizado exitosamente',
            'data' => $turno->load(['profesor', 'nivel']),
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
        $turno = Turno::with(['inscripciones.alumno'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $turno->inscripciones->map(function ($inscripcion) {
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
        ]);
    }
}
