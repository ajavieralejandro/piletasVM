<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AlumnoController extends Controller
{
    public function index(Request $request)
    {
        $query = User::where('tipo_usuario', 'cliente');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
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
            'nombre' => 'required|string|max:255',
            'apellido' => 'required|string|max:255',
            'dni' => 'required|string|unique:users,dni',
            'telefono' => 'required|string',
            'email' => 'nullable|email|unique:users,email',
            'tipo_cliente' => 'nullable|in:normal,pase_libre',
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

    public function inasistentes()
    {
        return response()->json(['success' => true, 'data' => []]);
    }
}
