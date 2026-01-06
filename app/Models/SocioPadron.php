<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SocioPadron extends Model
{
    protected $table = 'socios_padron';

    protected $fillable = [
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
    ];

    protected $casts = [
        'raw' => 'array',
        'saldo' => 'decimal:2',
        'semaforo' => 'integer',
        'ult_impago' => 'integer',
        'acceso_full' => 'boolean',

        // viene como string o null
        'hab_controles' => 'string',
    ];

    public function controlesCodes(): array
    {
        $s = trim((string) ($this->hab_controles ?? ''));
        if ($s === '') return [];

        // normaliza: quita comillas tipo "201,202"
        $s = str_replace('"', '', $s);

        return array_values(array_filter(array_map('trim', explode(',', $s))));
    }

    public function tieneControl(string|int $code): bool
    {
        return in_array((string)$code, $this->controlesCodes(), true);
    }

    public function tienePileta(): bool
    {
        return $this->tieneControl(201);
    }

    public function tieneGym(): bool
    {
        return $this->tieneControl(202);
    }
}
