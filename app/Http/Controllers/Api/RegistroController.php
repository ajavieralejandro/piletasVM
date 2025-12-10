<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class RegistroController extends Controller
{
    /**
     * Registrar nuevo usuario
     */
    public function registrar(Request $request)
    {
        $validated = $request->validate([
            'nombre' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/', // Solo letras y espacios
            ],
            'apellido' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/', // Solo letras y espacios
            ],
            'dni' => [
                'required',
                'string',
                'unique:users,dni',
                'regex:/^[0-9]+$/', // Solo números
                'min:7',
                'max:8',
            ],
            'telefono' => [
                'required',
                'string',
                'regex:/^[0-9]+$/', // Solo números
                'min:10',
                'max:15',
            ],
            'email' => 'required|email|unique:users,email',
            'password' => ['required', 'confirmed', Password::min(6)],
            'tipo_registro' => 'required|in:cliente,profesor',
        ], [
            // Mensajes personalizados
            'nombre.regex' => 'El nombre solo puede contener letras',
            'apellido.regex' => 'El apellido solo puede contener letras',
            'dni.regex' => 'El DNI solo puede contener números',
            'dni.min' => 'El DNI debe tener al menos 7 dígitos',
            'dni.max' => 'El DNI no puede tener más de 8 dígitos',
            'telefono.regex' => 'El teléfono solo puede contener números',
            'telefono.min' => 'El teléfono debe tener al menos 10 dígitos',
            'telefono.max' => 'El teléfono no puede tener más de 15 dígitos',
        ]);

        // Crear usuario con estado pendiente
        $user = User::create([
            'nombre' => $validated['nombre'],
            'apellido' => $validated['apellido'],
            'dni' => $validated['dni'],
            'telefono' => $validated['telefono'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'tipo_usuario' => $validated['tipo_registro'],
            'tipo_cliente' => $validated['tipo_registro'] === 'cliente' ? 'socio' : null,
            'activo' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Registro exitoso. Tu cuenta debe ser aprobada por un administrador.',
            'data' => [
                'id' => $user->id,
                'nombre_completo' => $user->nombre_completo,
                'dni' => $user->dni,
            ],
        ], 201);
    }

    /**
     * Listar usuarios pendientes de aprobación
     */
    public function usuariosPendientes()
    {
        $pendientes = User::where('activo', false)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $pendientes->map(function ($user) {
                return [
                    'id' => $user->id,
                    'nombre_completo' => $user->nombre_completo,
                    'dni' => $user->dni,
                    'telefono' => $user->telefono,
                    'email' => $user->email,
                    'tipo_usuario' => $user->tipo_usuario,
                    'fecha_registro' => $user->created_at->format('d/m/Y H:i'),
                ];
            }),
        ]);
    }

    /**
     * Aprobar usuario
     */
    public function aprobarUsuario($id)
    {
        $user = User::findOrFail($id);
        $user->update(['activo' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Usuario aprobado exitosamente',
            'data' => $user,
        ]);
    }

    /**
     * Rechazar usuario
     */
    public function rechazarUsuario($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Usuario rechazado',
        ]);
    }
}
