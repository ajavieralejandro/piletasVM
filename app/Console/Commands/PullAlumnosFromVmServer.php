<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class PullAlumnosFromVmServer extends Command
{
    protected $signature = 'vmserver:pull-alumnos
        {--chunk=1000}
        {--dry-run : No escribe, solo muestra conteos}
        {--solo-con-estado=0 : Filtra solo si estado_socio NO es null/vacio (opcional)}';

    protected $description = 'Trae usuarios desde vmserver_db.users hacia vmpiletas_db.users (upsert por dni).';

    public function handle(): int
    {
        $chunk = (int) $this->option('chunk') ?: 1000;
        $dryRun = (bool) $this->option('dry-run');
        $soloConEstado = (string) $this->option('solo-con-estado') === '1';

        $this->info("Pull desde vmserver_db -> piletas. chunk={$chunk}, soloConEstado=" . ($soloConEstado ? 'SI' : 'NO') . ", dryRun=" . ($dryRun ? 'SI' : 'NO'));

        // ✅ ORIGEN: vmserver_db.users (conexion 'usuarios')
        // No existe tipo_usuario ni activo en origen, así que NO filtramos por eso.
        $q = DB::connection('usuarios')->table('users')
            ->select([
                'id',
                'dni',
                'nombre',
                'apellido',
                'telefono',
                'email',
                'socio_id',
                'barcode',
                'estado_socio',
            ])
            ->whereNotNull('dni')
            ->where('dni', '<>', '');

        if ($soloConEstado) {
            $q->whereNotNull('estado_socio')->where('estado_socio', '<>', '');
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

                $nombre = trim((string)($r->nombre ?? ''));
                $apellido = trim((string)($r->apellido ?? ''));

                // fallback por si vienen vacíos
                if ($nombre === '' && $apellido === '') {
                    $nombre = 'Socio';
                    $apellido = $dni;
                }

                $payload[] = [
                    // clave
                    'dni' => $dni,

                    // datos básicos
                    'nombre' => $nombre,
                    'apellido' => $apellido,
                    'telefono' => $r->telefono ?? '',
                    'email' => $r->email ?? null,

                    // ✅ DESTINO (piletas) define "alumno"
                    'tipo_usuario' => 'cliente',
                    'tipo_cliente' => 'normal',
                    'activo' => true,

                    // ✅ puente para tus campos padron en piletas (ya los tenés)
                    'socio_sid' => $r->socio_id !== null ? (string)$r->socio_id : null,
                    'socio_barcode' => $r->barcode !== null ? (string)$r->barcode : null,

                    // opcional: si querés guardar algo del estado (no lo estamos usando)
                    // 'socio_hab_controles' => null,

                    // password local (no copiamos la del origen)
                    'password' => bcrypt($dni),

                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            if (!empty($payload)) {
                $upserts += count($payload);

                if (!$dryRun) {
                    // ✅ OJO: acá escribimos en la DB local (vmpiletas_db) porque es la conexión default
                    DB::table('users')->upsert(
                        $payload,
                        ['dni'],
                        [
                            'nombre','apellido','telefono','email',
                            'tipo_usuario','tipo_cliente','activo',
                            'socio_sid','socio_barcode',
                            'updated_at'
                        ]
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
