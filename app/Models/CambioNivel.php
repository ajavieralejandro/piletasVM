<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CambioNivel extends Model
{
    protected $table = 'cambios_nivel';

    protected $fillable = [
        'alumno_id',
        'nivel_anterior_id',
        'nivel_nuevo_id',
        'sugerido_por',
        'estado',
        'observaciones',
        'fecha_cambio',
    ];

    protected $casts = [
        'fecha_cambio' => 'datetime',
    ];

    // Relaciones
    public function alumno()
    {
        return $this->belongsTo(User::class, 'alumno_id');
    }

    public function nivelAnterior()
    {
        return $this->belongsTo(Nivel::class, 'nivel_anterior_id');
    }

    public function nivelNuevo()
    {
        return $this->belongsTo(Nivel::class, 'nivel_nuevo_id');
    }

    public function sugeridoPor()
    {
        return $this->belongsTo(User::class, 'sugerido_por');
    }

    // Scopes
    public function scopePendientes($query)
    {
        return $query->where('estado', 'pendiente');
    }

    public function scopeAprobados($query)
    {
        return $query->where('estado', 'aprobado');
    }

    public function scopeRechazados($query)
    {
        return $query->where('estado', 'rechazado');
    }

    public function scopePorAlumno($query, $alumnoId)
    {
        return $query->where('alumno_id', $alumnoId);
    }

    // Métodos
    public function aprobar()
    {
        $this->estado = 'aprobado';
        $this->fecha_cambio = now();
        $this->save();
    }

    public function rechazar()
    {
        $this->estado = 'rechazado';
        $this->save();
    }
}
