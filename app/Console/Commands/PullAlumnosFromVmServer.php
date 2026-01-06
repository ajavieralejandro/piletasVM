<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class PullAlumnosFromVmServer extends Command
{
    protected $signature = 'vmserver:pull-alumnos
        {--chunk=1000}
        {--solo-activos=1}
        {--dry-run : No escribe, solo muestra conteos}';

    protected $description = 'Trae users tipo cliente desde vmserver_db hacia vmpiletas_db (upsert por dni).';

    public function handle(): int
    {
        $chunk = (int) $this->option('chunk') ?: 1000;
        $soloActivos = (string) $this->option('solo-activos') === '1';
        $dryRun = (bool) $this->option('dry-run');

        $this->info("Pull alumnos desde vmserver_db -> piletas. chunk={$chunk}, soloActivos=" . ($soloActivos ? 'SI' : 'NO') . ", dryRun=" . ($dryRun ? 'SI' : 'NO'));

        $q = DB::connection('usuarios')->table('users')
            ->where('tipo_usuario', 'cliente');

        if ($soloActivos) {
            $q->where('activo', 1);
        }

        $total = (clone $q)->count();
        $this->line("Total candidatos en origen: {$total}");

        $lastId = 0;
        $upserts = 0;
        $saltadosSinDni = 0;

        while (true) {
            $rows = (clone $q)
                ->where('id', '>', $lastId)
                ->orderBy('id')
                ->limit($chunk)
                ->get();

            if ($rows->isEmpty()) break;

            $payload = [];

            foreach ($rows as $r) {
                $lastId = $r->id;

                $dni = trim((string)($r->dni ?? ''));
                if ($dni === '') {
                    $saltadosSinDni++;
                    continue;
                }

                $payload[] = [
                    'dni' => $dni,
                    'nombre' => $r->nombre ?? '',
                    'apellido' => $r->apellido ?? '',
                    'telefono' => $r->telefono ?? '',
                    'email' => $r->email ?? null,
                    'tipo_usuario' => 'cliente',
                    'tipo_cliente' => $r->tipo_cliente ?? 'normal',
                    'activo' => (bool)($r->activo ?? 1),

                    // En piletas NO necesitamos la password real.
                    // Si querés login en piletas, definimos otra estrategia.
                    'password' => bcrypt($dni),

                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            if (!empty($payload)) {
                $upserts += count($payload);

                if (!$dryRun) {
                    DB::table('users')->upsert(
                        $payload,
                        ['dni'],
                        ['nombre','apellido','telefono','email','tipo_usuario','tipo_cliente','activo','updated_at']
                    );
                }
            }

            $this->line("Avance: lastId={$lastId} | upserts={$upserts} | sinDni={$saltadosSinDni}");
        }

        $this->newLine();
        $this->info("Listo.");
        $this->line("Upserts: {$upserts}");
        $this->line("Saltados sin DNI: {$saltadosSinDni}");

        return self::SUCCESS;
    }
}
