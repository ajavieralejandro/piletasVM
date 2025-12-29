<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pileta;
use Illuminate\Http\Request;

class PiletaController extends Controller
{
    public function index()
    {
        return Pileta::orderBy('id')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre' => ['required', 'string', 'max:255'],
            'descripcion' => ['nullable', 'string'],
            'activa' => ['sometimes', 'boolean'],
        ]);

        return Pileta::create($data);
    }

    public function show(Pileta $pileta)
    {
        return $pileta;
    }

    public function update(Request $request, Pileta $pileta)
    {
        $data = $request->validate([
            'nombre' => ['sometimes', 'required', 'string', 'max:255'],
            'descripcion' => ['nullable', 'string'],
            'activa' => ['sometimes', 'boolean'],
        ]);

        $pileta->update($data);
        return $pileta;
    }

    public function destroy(Pileta $pileta)
    {
        // baja lógica (mejor que borrar)
        $pileta->update(['activa' => false]);
        return response()->json(['ok' => true]);
    }
}
