<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;

class PerfilController extends Controller
{
    /**
     * Obtener perfil del usuario autenticado
     */
    public function show(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'nombre' => $user->nombre,
                'apellido' => $user->apellido,
                'nombre_completo' => $user->nombre_completo,
                'dni' => $user->dni,
                'telefono' => $user->telefono,
                'email' => $user->email,
                'tipo_usuario' => $user->tipo_usuario,
                'tipo_cliente' => $user->tipo_cliente,
                'foto_perfil' => $user->foto_perfil ? asset('storage/' . $user->foto_perfil) : null,
                'activo' => $user->activo,
            ],
        ]);
    }

    /**
     * Actualizar perfil
     */
    public function update(Request $request)
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'nombre' => 'nullable|string|max:255',
            'apellido' => 'nullable|string|max:255',
            'telefono' => 'nullable|string|max:15',
            'email' => 'nullable|email|unique:users,email,' . $user->id,
            'password' => ['nullable', 'confirmed', Password::min(6)],
        ]);

        // Actualizar solo los campos enviados
        if (isset($validated['nombre'])) {
            $user->nombre = $validated['nombre'];
        }
        
        if (isset($validated['apellido'])) {
            $user->apellido = $validated['apellido'];
        }
        
        if (isset($validated['telefono'])) {
            $user->telefono = $validated['telefono'];
        }
        
        if (isset($validated['email'])) {
            $user->email = $validated['email'];
        }
        
        if (isset($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }
        
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Perfil actualizado correctamente',
            'data' => [
                'id' => $user->id,
                'nombre_completo' => $user->nombre_completo,
                'email' => $user->email,
                'telefono' => $user->telefono,
            ],
        ]);
    }

    /**
     * Subir foto de perfil
     */
    public function subirFoto(Request $request)
    {
        $request->validate([
            'foto' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $user = $request->user();

        // Eliminar foto anterior si existe
        if ($user->foto_perfil) {
            Storage::disk('public')->delete($user->foto_perfil);
        }

        // Guardar nueva foto
        $path = $request->file('foto')->store('avatars', 'public');
        
        $user->foto_perfil = $path;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Foto actualizada correctamente',
            'data' => [
                'foto_perfil' => asset('storage/' . $path),
            ],
        ]);
    }

    /**
     * Eliminar foto de perfil
     */
    public function eliminarFoto(Request $request)
    {
        $user = $request->user();

        if ($user->foto_perfil) {
            Storage::disk('public')->delete($user->foto_perfil);
            $user->foto_perfil = null;
            $user->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'Foto eliminada correctamente',
        ]);
    }
}
