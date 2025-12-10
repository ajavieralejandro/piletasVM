<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EstadoCuenta extends Model
{
    protected $table = 'estados_cuenta';

    protected $fillable = [
        'alumno_id',
        'saldo',
        'ultimo_pago',
        'fecha_ultimo_pago',
        'proxima_fecha_pago',
    ];

    protected $casts = [
        'saldo' => 'decimal:2',
        'ultimo_pago' => 'decimal:2',
        'fecha_ultimo_pago' => 'date',
        'proxima_fecha_pago' => 'date',
    ];

    // Relaciones
    public function alumno()
    {
        return $this->belongsTo(User::class, 'alumno_id');
    }

    public function movimientos()
    {
        return $this->hasMany(MovimientoCuenta::class);
    }

    // Accessors
    public function getDebeAttribute()
    {
        return $this->saldo < 0;
    }

    public function getMontoAdeudadoAttribute()
    {
        return $this->saldo < 0 ? abs($this->saldo) : 0;
    }

    public function getSaldoFavorAttribute()
    {
        return $this->saldo > 0 ? $this->saldo : 0;
    }

    // Métodos de negocio
    public function registrarPago($monto, $concepto = 'Pago recibido', $observaciones = null)
    {
        // Actualizar saldo
        $this->saldo += $monto;
        $this->ultimo_pago = $monto;
        $this->fecha_ultimo_pago = now();
        $this->save();

        // Registrar movimiento
        return $this->movimientos()->create([
            'tipo' => 'pago',
            'monto' => $monto,
            'concepto' => $concepto,
            'observaciones' => $observaciones,
        ]);
    }

    public function registrarCargo($monto, $concepto, $observaciones = null)
    {
        // Actualizar saldo (negativo porque es un cargo)
        $this->saldo -= $monto;
        $this->save();

        // Registrar movimiento
        return $this->movimientos()->create([
            'tipo' => 'cargo',
            'monto' => $monto,
            'concepto' => $concepto,
            'observaciones' => $observaciones,
        ]);
    }

    public function registrarAjuste($monto, $concepto, $observaciones = null)
    {
        // Actualizar saldo
        $this->saldo += $monto;
        $this->save();

        // Registrar movimiento
        return $this->movimientos()->create([
            'tipo' => 'ajuste',
            'monto' => $monto,
            'concepto' => $concepto,
            'observaciones' => $observaciones,
        ]);
    }
}
