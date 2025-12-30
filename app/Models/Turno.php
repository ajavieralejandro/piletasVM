<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Turno extends Model
{
    use SoftDeletes;

    protected $table = 'turnos';

    protected $fillable = [
        'profesor_id',
            'pileta_id',   // ✅ FALTA
        'nivel_id',
        'hora_inicio',
        'hora_fin',
        'cupo_maximo',
        'dia_semana',
        'activo',
    ];

    protected $casts = [
        'hora_inicio' => 'datetime:H:i',
        'hora_fin' => 'datetime:H:i',
        'activo' => 'boolean',
    ];

    // Relaciones
    public function profesor()
    {
        return $this->belongsTo(User::class, 'profesor_id');
    }

    public function nivel()
    {
        return $this->belongsTo(Nivel::class);
    }

    public function inscripciones()
    {
        return $this->hasMany(Inscripcion::class);
    }

    public function clases()
    {
        return $this->hasMany(Clase::class);
    }

    public function pasesLibreDiarios()
    {
        return $this->hasMany(PaseLibreDiario::class);
    }

    // Accessors
    public function getCupoDisponibleAttribute()
    {
        $inscriptos = $this->inscripciones()->where('estado', 'activo')->count();
        return $this->cupo_maximo - $inscriptos;
    }

    public function getEstaCompletoAttribute()
    {
        return $this->cupo_disponible <= 0;
    }

    // Scopes
    public function scopeActivos($query)
    {
        return $query->where('activo', true);
    }

    public function scopePorDia($query, $dia)
    {
        return $query->where('dia_semana', $dia);
    }

    public function scopePorProfesor($query, $profesorId)
    {
        return $query->where('profesor_id', $profesorId);
    }

    public function pileta()
{
    return $this->belongsTo(\App\Models\Pileta::class);
}

}
