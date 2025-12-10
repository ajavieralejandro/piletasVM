<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ProfesorController extends Controller
{
    /**
     * Listar todos los profesores activos
     */
    public function index()
    {
        $profesores = User::where('tipo_usuario', 'profesor')
            ->where('activo', true)
            ->orderBy('apellido')
            ->orderBy('nombre')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $profesores,
        ]);
    }

    /**
     * Crear nuevo profesor
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'apellido' => 'required|string|max:255',
            'dni' => 'required|string|unique:users,dni',
            'telefono' => 'required|string',
            'email' => 'nullable|email|unique:users,email',
        ]);

        $profesor = User::create([
            'nombre' => $validated['nombre'],
            'apellido' => $validated['apellido'],
            'dni' => $validated['dni'],
            'telefono' => $validated['telefono'],
            'email' => $validated['email'] ?? null,
            'password' => Hash::make($validated['dni']),
            'tipo_usuario' => 'profesor',
            'activo' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Profesor creado exitosamente',
            'data' => $profesor,
        ], 201);
    }

    /**
     * Mostrar un profesor específico
     */
    public function show($id)
    {
        $profesor = User::where('tipo_usuario', 'profesor')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $profesor,
        ]);
    }

    /**
     * Actualizar profesor
     */
    public function update(Request $request, $id)
    {
        $profesor = User::where('tipo_usuario', 'profesor')->findOrFail($id);

        $validated = $request->validate([
            'nombre' => 'sometimes|required|string|max:255',
            'apellido' => 'sometimes|required|string|max:255',
            'dni' => 'sometimes|required|string|unique:users,dni,' . $id,
            'telefono' => 'sometimes|required|string',
            'email' => 'nullable|email|unique:users,email,' . $id,
            'activo' => 'sometimes|boolean',
        ]);

        $profesor->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Profesor actualizado exitosamente',
            'data' => $profesor,
        ]);
    }

    /**
     * Eliminar profesor
     */
    public function destroy($id)
    {
        $profesor = User::where('tipo_usuario', 'profesor')->findOrFail($id);
        $profesor->delete();

        return response()->json([
            'success' => true,
            'message' => 'Profesor eliminado exitosamente',
        ]);
    }
}
