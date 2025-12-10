<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class RecuperacionController extends Controller
{
    /**
     * Verificar usuario por DNI y datos personales
     */
    public function verificarUsuario(Request $request)
    {
        $validated = $request->validate([
            'dni' => 'required|string',
            'telefono' => 'required|string',
        ]);

        $user = User::where('dni', $validated['dni'])
            ->where('telefono', $validated['telefono'])
            ->where('activo', true)
            ->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'No se encontró un usuario con esos datos',
            ], 404);
        }

        // Generar token temporal (en producción usar tokens reales)
        $token = base64_encode($user->id . ':' . time());

        return response()->json([
            'success' => true,
            'message' => 'Usuario verificado correctamente',
            'data' => [
                'token' => $token,
                'nombre_completo' => $user->nombre_completo,
            ],
        ]);
    }

    /**
     * Cambiar contraseña con token
     */
    public function cambiarPassword(Request $request)
    {
        $validated = $request->validate([
            'token' => 'required|string',
            'password' => ['required', 'confirmed', Password::min(6)],
        ]);

        // Decodificar token (simplificado - en producción usar sistema más seguro)
        $decoded = base64_decode($validated['token']);
        $parts = explode(':', $decoded);
        
        if (count($parts) !== 2) {
            return response()->json([
                'success' => false,
                'message' => 'Token inválido',
            ], 400);
        }

        $userId = $parts[0];
        $timestamp = $parts[1];

        // Verificar que el token no tenga más de 1 hora
        if (time() - $timestamp > 3600) {
            return response()->json([
                'success' => false,
                'message' => 'Token expirado',
            ], 400);
        }

        $user = User::findOrFail($userId);
        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Contraseña cambiada exitosamente',
        ]);
    }

    /**
     * Cambiar contraseña estando autenticado
     */
    public function cambiarPasswordAutenticado(Request $request)
    {
        $validated = $request->validate([
            'password_actual' => 'required|string',
            'password' => ['required', 'confirmed', Password::min(6)],
        ]);

        $user = $request->user();

        // Verificar contraseña actual
        if (!Hash::check($validated['password_actual'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'La contraseña actual es incorrecta',
            ], 400);
        }

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Contraseña cambiada exitosamente',
        ]);
    }
}
