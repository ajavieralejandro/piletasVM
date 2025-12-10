<?php


namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Nivel;

class NivelesSeeder extends Seeder
{
    public function run(): void
    {
        $niveles = [
            [
                'nombre' => 'Iniciación',
                'descripcion' => 'Nivel para alumnos que recién comienzan',
                'orden' => 1,
                'activo' => true,
            ],
            [
                'nombre' => 'Principiante',
                'descripcion' => 'Nivel básico de natación',
                'orden' => 2,
                'activo' => true,
            ],
            [
                'nombre' => 'Intermedio',
                'descripcion' => 'Nivel medio de natación',
                'orden' => 3,
                'activo' => true,
            ],
            [
                'nombre' => 'Avanzado',
                'descripcion' => 'Nivel avanzado de natación',
                'orden' => 4,
                'activo' => true,
            ],
            [
                'nombre' => 'Competición',
                'descripcion' => 'Nivel de competencia',
                'orden' => 5,
                'activo' => true,
            ],
        ];

        foreach ($niveles as $nivel) {
            Nivel::create($nivel);
        }

        echo "✅ Niveles creados exitosamente\n";
    }
}

