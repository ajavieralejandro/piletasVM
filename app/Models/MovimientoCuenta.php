<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MovimientoCuenta extends Model
{
    protected $table = 'movimientos_cuenta';

    protected $fillable = [
        'estado_cuenta_id',
        'tipo',
        'monto',
        'concepto',
        'observaciones',
    ];

    protected $casts = [
        'monto' => 'decimal:2',
    ];

    // Relaciones
    public function estadoCuenta()
    {
        return $this->belongsTo(EstadoCuenta::class);
    }

    // Scopes
    public function scopePagos($query)
    {
        return $query->where('tipo', 'pago');
    }

    public function scopeCargos($query)
    {
        return $query->where('tipo', 'cargo');
    }

    public function scopeAjustes($query)
    {
        return $query->where('tipo', 'ajuste');
    }

    public function scopePorPeriodo($query, $fechaInicio, $fechaFin)
    {
        return $query->whereBetween('created_at', [$fechaInicio, $fechaFin]);
    }
}
