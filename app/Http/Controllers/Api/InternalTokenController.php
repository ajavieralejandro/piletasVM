<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class InternalTokenController extends Controller
{
    public function issue(Request $request)
    {
        $data = $request->validate([
            'external_provider' => 'required|string',
            'external_user_id'  => 'required',
            'email'             => 'nullable|email',
            'dni'               => 'nullable|string',
            'nombre'            => 'nullable|string',
            'apellido'          => 'nullable|string',
        ]);

        $user = User::firstOrCreate(
            [
                'external_provider' => $data['external_provider'],
                'external_user_id'  => (string) $data['external_user_id'],
            ],
            [
                'email'    => $data['email'] ?? null,
                'password' => bcrypt(str()->random(32)),
            ]
        );

        // Actualizaciones “seguras”: solo si esas columnas existen en tu users
        $updates = [];
        if (array_key_exists('email', $data) && $data['email']) $updates['email'] = $data['email'];

        // Si tu tabla users tiene estas columnas, se actualizan; si no, las ignoramos
        foreach (['dni','nombre','apellido'] as $field) {
            if (isset($data[$field])) $updates[$field] = $data[$field];
        }

        if (!empty($updates)) {
            try {
                $user->fill($updates)->save();
            } catch (\Throwable $e) {
                // Si tu schema no tiene dni/nombre/apellido, no rompemos el token exchange
            }
        }

        $token = $user->createToken('piletas-bridge')->plainTextToken;

        return response()->json(['token' => $token]);
    }
}
