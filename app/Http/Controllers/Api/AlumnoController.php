<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AlumnoController extends Controller
{
    public function index(Request $request)
    {
        $query = User::where('tipo_usuario', 'cliente');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nombre', 'like', "%{$search}%")
                  ->orWhere('apellido', 'like', "%{$search}%")
                  ->orWhere('dni', 'like', "%{$search}%");
            });
        }

        $alumnos = $query->orderBy('apellido')->orderBy('nombre')->get();

        return response()->json(['success' => true, 'data' => $alumnos]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => ['required','string','max:255'],
            'apellido' => ['required','string','max:255'],
            'dni' => ['required','string','max:50','unique:users,dni'],
            'telefono' => ['required','string','max:50'],
            'email' => ['nullable','email','max:255','unique:users,email'],
            'tipo_cliente' => ['nullable', Rule::in(['normal','pase_libre'])],
        ]);

        $alumno = User::create([
            'nombre' => $validated['nombre'],
            'apellido' => $validated['apellido'],
            'dni' => $validated['dni'],
            'telefono' => $validated['telefono'],
            'email' => $validated['email'] ?? null,
            'password' => Hash::make($validated['dni']),
            'tipo_usuario' => 'cliente',
            'tipo_cliente' => $validated['tipo_cliente'] ?? 'normal',
            'activo' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Alumno creado exitosamente',
            'data' => $alumno,
        ], 201);
    }

    // ✅ NECESARIO por Route::apiResource('alumnos', ...)
    public function show($id)
    {
        $alumno = User::where('tipo_usuario', 'cliente')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $alumno,
        ]);
    }

    // ✅ NECESARIO por Route::apiResource('alumnos', ...)
    public function update(Request $request, $id)
    {
        $alumno = User::where('tipo_usuario', 'cliente')->findOrFail($id);

        $validated = $request->validate([
            'nombre' => ['sometimes','string','max:255'],
            'apellido' => ['sometimes','string','max:255'],
            'dni' => [
                'sometimes','string','max:50',
                Rule::unique('users', 'dni')->ignore($alumno->id),
            ],
            'telefono' => ['sometimes','string','max:50'],
            'email' => [
                'nullable','email','max:255',
                Rule::unique('users', 'email')->ignore($alumno->id),
            ],
            'tipo_cliente' => ['sometimes', Rule::in(['normal','pase_libre'])],
            'activo' => ['sometimes','boolean'],
        ]);

        $alumno->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Alumno actualizado exitosamente',
            'data' => $alumno,
        ]);
    }

    // ✅ NECESARIO por Route::apiResource('alumnos', ...)
    public function destroy($id)
    {
        $alumno = User::where('tipo_usuario', 'cliente')->findOrFail($id);
        $alumno->delete();

        return response()->json([
            'success' => true,
            'message' => 'Alumno eliminado exitosamente',
        ]);
    }

    public function inasistentes()
    {
        // Por ahora vacío como lo tenías.
        return response()->json(['success' => true, 'data' => []]);
    }
}
