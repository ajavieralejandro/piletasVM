<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaseLibreDiario extends Model
{
    protected $table = 'pases_libre_diarios';

    protected $fillable = [
        'alumno_id',
        'turno_id',
        'fecha',
        'estado',
    ];

    protected $casts = [
        'fecha' => 'date',
    ];

    // Relaciones
    public function alumno()
    {
        return $this->belongsTo(User::class, 'alumno_id');
    }

    public function turno()
    {
        return $this->belongsTo(Turno::class);
    }

    // Scopes
    public function scopeReservados($query)
    {
        return $query->where('estado', 'reservado');
    }

    public function scopeAsistio($query)
    {
        return $query->where('estado', 'asistio');
    }

    public function scopeNoAsistio($query)
    {
        return $query->where('estado', 'no_asistio');
    }

    public function scopeCancelados($query)
    {
        return $query->where('estado', 'cancelado');
    }

    public function scopePorAlumno($query, $alumnoId)
    {
        return $query->where('alumno_id', $alumnoId);
    }

    public function scopePorFecha($query, $fecha)
    {
        return $query->where('fecha', $fecha);
    }

    public function scopePorTurno($query, $turnoId)
    {
        return $query->where('turno_id', $turnoId);
    }

    // Métodos
    public function cancelar()
    {
        $this->estado = 'cancelado';
        $this->save();
    }

    public function confirmarAsistencia()
    {
        $this->estado = 'asistio';
        $this->save();
    }

    public function marcarInasistencia()
    {
        $this->estado = 'no_asistio';
        $this->save();
    }
}
