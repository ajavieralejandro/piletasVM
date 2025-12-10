<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inscripcion;
use Illuminate\Http\Request;

class InscripcionController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'turno_id' => 'required|exists:turnos,id',
            'alumno_id' => 'required|exists:users,id',
            'fecha_inscripcion' => 'required|date',
        ]);

        $validated['estado'] = 'activo';
        $validated['pase_libre'] = false;

        $inscripcion = Inscripcion::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Inscripción creada exitosamente',
            'data' => $inscripcion,
        ], 201);
    }

    public function destroy($id)
    {
        $inscripcion = Inscripcion::findOrFail($id);
        $inscripcion->delete();

        return response()->json([
            'success' => true,
            'message' => 'Inscripción eliminada exitosamente',
        ]);
    }

    public function getPorTurno($turnoId)
    {
        $inscripciones = Inscripcion::where('turno_id', $turnoId)
            ->with('alumno')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $inscripciones,
        ]);
    }
}
