<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Cuota extends Model
{
    use HasFactory;

    protected $fillable = [
        'alumno_id',
        'monto',
        'fecha_vencimiento',
        'estado',
        'fecha_pago',
        'observaciones',
        'recordatorio_enviado',
    ];

    protected $casts = [
        'fecha_vencimiento' => 'date',
        'fecha_pago' => 'date',
        'recordatorio_enviado' => 'boolean',
    ];

    // Relaciones
    public function alumno()
    {
        return $this->belongsTo(User::class, 'alumno_id');
    }

    // Scopes
    public function scopePendientes($query)
    {
        return $query->where('estado', 'pendiente');
    }

    public function scopeVencidas($query)
    {
        return $query->where('estado', 'vencida')
                     ->orWhere(function ($q) {
                         $q->where('estado', 'pendiente')
                           ->where('fecha_vencimiento', '<', Carbon::now());
                     });
    }

    public function scopeProximasVencer($query, $dias = 7)
    {
        return $query->where('estado', 'pendiente')
                     ->whereBetween('fecha_vencimiento', [
                         Carbon::now(),
                         Carbon::now()->addDays($dias)
                     ]);
    }

    // Métodos
    public function marcarComoPagada($fechaPago = null)
    {
        $this->update([
            'estado' => 'pagada',
            'fecha_pago' => $fechaPago ?? Carbon::now(),
        ]);
    }

    public function actualizarEstado()
    {
        if ($this->estado === 'pendiente' && $this->fecha_vencimiento->isPast()) {
            $this->update(['estado' => 'vencida']);
        }
    }
}
