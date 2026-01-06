<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\SocioPadron;
use App\Models\User;

class SyncAlumnosDesdePadron extends Command
{
    protected $signature = 'padron:sync-alumnos
        {--chunk=500 : Cantidad de filas por lote}
        {--solo-existentes : Solo actualiza alumnos existentes (default)}
        {--crear : Crea el alumno si no existe (usa apynom)}
    ';

    protected $description = 'Sincroniza datos de socios_padron hacia users (alumnos) y calcula flags de pileta/gym.';

    public function handle(): int
    {
        $chunk = (int) $this->option('chunk') ?: 500;

        $soloExistentes = true;
        if ($this->option('crear')) {
            $soloExistentes = false;
        }
        if ($this->option('solo-existentes')) {
            $soloExistentes = true;
        }

        $creados = 0;
        $actualizados = 0;
        $conPileta = 0;
        $conGym = 0;

        $this->info("Sync alumnos desde padrón (chunk={$chunk})...");
        $this->info($soloExistentes ? "Modo: SOLO actualizar existentes" : "Modo: crear si no existe");

        SocioPadron::query()
            ->orderBy('id')
            ->chunk($chunk, function ($socios) use (&$creados, &$actualizados, &$conPileta, &$conGym, $soloExistentes) {

                foreach ($socios as $socio) {

                    $dni = (string) $socio->dni;

                    // normalizar hab_controles: puede venir NULL, "201", "201,202"
                    $hab = $socio->hab_controles;
                    $hab = $hab === null ? null : str_replace('"', '', (string) $hab);
                    $codes = $hab ? array_values(array_filter(array_map('trim', explode(',', $hab)))) : [];

                    $tiene201 = in_array('201', $codes, true);
                    $tiene202 = in_array('202', $codes, true);

                    // buscar alumno existente por DNI
                    $user = User::query()
                        ->where('tipo_usuario', 'cliente')
                        ->where('dni', $dni)
                        ->first();

                    if (!$user) {
                        if ($soloExistentes) {
                            continue;
                        }

                        // Crear alumno a partir de apynom "APELLIDO NOMBRE ..."
                        $apynom = trim((string) $socio->apynom);
                        [$apellido, $nombre] = $this->splitApellidoNombre($apynom);

                        $user = User::create([
                            'nombre' => $nombre ?: $apynom,
                            'apellido' => $apellido ?: '',
                            'dni' => $dni,
                            'telefono' => '',
                            'email' => null,
                            'password' => $dni, // casteado a hashed en tu modelo
                            'tipo_usuario' => 'cliente',
                            'tipo_cliente' => 'normal',
                            'activo' => true,
                        ]);

                        $creados++;
                    }

                    $user->fill([
                        'socio_sid' => (string) $socio->sid,
                        'socio_barcode' => (string) $socio->barcode,
                        'socio_hab_controles' => $hab,
                        'tiene_pileta' => $tiene201,
                        'tiene_gym' => $tiene202,
                        'padron_synced_at' => now(),
                    ]);

                    $dirty = $user->isDirty();
                    $user->save();

                    if ($dirty) $actualizados++;

                    if ($tiene201) $conPileta++;
                    if ($tiene202) $conGym++;
                }
            });

        $this->newLine();
        $this->info("Listo.");
        $this->line("Creados: {$creados}");
        $this->line("Actualizados: {$actualizados}");
        $this->line("Con pileta (201): {$conPileta}");
        $this->line("Con gym (202): {$conGym}");

        return self::SUCCESS;
    }

    private function splitApellidoNombre(string $apynom): array
    {
        // Heurística simple: primer token = apellido, resto = nombre
        // Si querés, lo refinamos después.
        $parts = preg_split('/\s+/', trim($apynom)) ?: [];
        if (count($parts) === 0) return ['', ''];
        if (count($parts) === 1) return [$parts[0], ''];
        $apellido = array_shift($parts);
        $nombre = implode(' ', $parts);
        return [$apellido, $nombre];
    }
}
