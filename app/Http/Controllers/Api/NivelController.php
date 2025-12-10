<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Nivel;
use Illuminate\Http\Request;

class NivelController extends Controller
{
    public function index()
    {
        $niveles = Nivel::orderBy('orden')->get();
        return response()->json(['success' => true, 'data' => $niveles]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'orden' => 'nullable|integer',
        ]);

        if (!isset($validated['orden'])) {
            $validated['orden'] = Nivel::max('orden') + 1;
        }

        $validated['activo'] = true;
        $nivel = Nivel::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Nivel creado exitosamente',
            'data' => $nivel,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $nivel = Nivel::findOrFail($id);

        $validated = $request->validate([
            'nombre' => 'sometimes|string|max:255',
            'descripcion' => 'nullable|string',
            'orden' => 'nullable|integer',
            'activo' => 'sometimes|boolean',
        ]);

        $nivel->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Nivel actualizado exitosamente',
            'data' => $nivel,
        ]);
    }

    public function destroy($id)
    {
        $nivel = Nivel::findOrFail($id);
        $nivel->delete();

        return response()->json([
            'success' => true,
            'message' => 'Nivel eliminado exitosamente',
        ]);
    }
}
