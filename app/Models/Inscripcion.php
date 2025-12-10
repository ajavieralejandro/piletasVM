<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Inscripcion extends Model
{
    use SoftDeletes;

    protected $table = 'inscripciones';

    protected $fillable = [
        'turno_id',
        'alumno_id',
        'fecha_inscripcion',
        'estado',
        'pase_libre',
    ];

    protected $casts = [
        'fecha_inscripcion' => 'date',
        'pase_libre' => 'boolean',
    ];

    // Relaciones
    public function turno()
    {
        return $this->belongsTo(Turno::class);
    }

    public function alumno()
    {
        return $this->belongsTo(User::class, 'alumno_id');
    }

    // Scopes
    public function scopeActivas($query)
    {
        return $query->where('estado', 'activo');
    }

    public function scopePorAlumno($query, $alumnoId)
    {
        return $query->where('alumno_id', $alumnoId);
    }

    public function scopePorTurno($query, $turnoId)
    {
        return $query->where('turno_id', $turnoId);
    }

    public function scopePaseLibre($query)
    {
        return $query->where('pase_libre', true);
    }
}
