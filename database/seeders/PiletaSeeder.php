<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Pileta;

class PiletaSeeder extends Seeder
{
    public function run(): void
    {
        foreach (['Pileta 1', 'Pileta 2', 'Pileta 3'] as $nombre) {
            Pileta::firstOrCreate(['nombre' => $nombre], ['activa' => true]);
        }
    }
}
