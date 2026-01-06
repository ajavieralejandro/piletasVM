<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class PullAlumnosFromVmServer extends Command
{
    protected $signature = 'vmserver:pull-alumnos
        {--chunk=1000}
        {--dry-run : No escribe, solo muestra conteos}';

    protected $description = 'Copia vmserver_db.socios_padron -> vmpiletas_db.socios_padron (upsert por dni).';

    public function handle(): int
    {
        $chunk = (int) $this->option('chunk') ?: 1000;
        $dryRun = (bool) $this->option('dry-run');

        $this->info("Pull padrón (socios_padron) desde vmserver_db -> piletas. chunk={$chunk}, dryRun=" . ($dryRun ? 'SI' : 'NO'));

        // ✅ ORIGEN: vmserver_db.socios_padron (conexion 'usuarios')
        $q = DB::connection('usuarios')->table('socios_padron')
            ->select([
                'id',
                'dni',
                'sid',
                'apynom',
                'barcode',
                'saldo',
                'semaforo',
                'ult_impago',
                'acceso_full',
                'hab_controles',
                'raw',
                'created_at',
                'updated_at',
            ])
            ->orderBy('id');

        $total = (clone $q)->count();
        $this->line("Total origen socios_padron: {$total}");

        $lastId = 0;
        $upserts = 0;

        while (true) {
            $rows = (clone $q)
                ->where('id', '>', $lastId)
                ->limit($chunk)
                ->get();

            if ($rows->isEmpty()) break;

            $payload = [];

            foreach ($rows as $r) {
                $lastId = $r->id;

                $dni = trim((string)($r->dni ?? ''));
                if ($dni === '') continue;

                $payload[] = [
                    'dni' => (string) $r->dni,
                    'sid' => $r->sid !== null ? (string) $r->sid : null,
                    'apynom' => $r->apynom,
                    'barcode' => $r->barcode,
                    'saldo' => $r->saldo ?? 0,
                    'semaforo' => $r->semaforo,
                    'ult_impago' => $r->ult_impago,
                    'acceso_full' => (int)($r->acceso_full ?? 0) ? 1 : 0,
                    'hab_controles' => $r->hab_controles,
                    'raw' => $r->raw,

                    // no hace falta respetar created_at original, pero no molesta
                    'created_at' => $r->created_at ?? now(),
                    'updated_at' => now(),
                ];
            }

            if (!empty($payload)) {
                $upserts += count($payload);

                if (!$dryRun) {
                    // ✅ DESTINO: tabla local socios_padron (DB piletas)
                    DB::table('socios_padron')->upsert(
                        $payload,
                        ['dni'],
                        ['sid','apynom','barcode','saldo','semaforo','ult_impago','acceso_full','hab_controles','raw','updated_at']
                    );
                }
            }

            $this->line("Avance: lastId={$lastId} | upserts={$upserts}");
        }

        $this->newLine();
        $this->info("Listo.");
        $this->line("Upserts realizados: {$upserts}");

        return self::SUCCESS;
    }
}
