<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Clase extends Model
{
    protected $table = 'clases';

    protected $fillable = [
        'turno_id',
        'fecha',
        'estado',
        'observaciones',
    ];

    protected $casts = [
        'fecha' => 'date',
    ];

    // Relaciones
    public function turno()
    {
        return $this->belongsTo(Turno::class);
    }

    public function asistencias()
    {
        return $this->hasMany(Asistencia::class);
    }

    // Scopes
    public function scopeProgramadas($query)
    {
        return $query->where('estado', 'programada');
    }

    public function scopeRealizadas($query)
    {
        return $query->where('estado', 'realizada');
    }

    public function scopeCanceladas($query)
    {
        return $query->where('estado', 'cancelada');
    }

    public function scopePorFecha($query, $fecha)
    {
        return $query->where('fecha', $fecha);
    }

    public function scopePorTurno($query, $turnoId)
    {
        return $query->where('turno_id', $turnoId);
    }
}
