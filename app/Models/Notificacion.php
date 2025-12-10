<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notificacion extends Model
{
    protected $table = 'notificaciones';

    protected $fillable = [
        'usuario_id',
        'tipo',
        'titulo',
        'mensaje',
        'data',
        'url',
        'leida',
        'fecha_leida',
    ];

    protected $casts = [
        'data' => 'array',
        'leida' => 'boolean',
        'fecha_leida' => 'datetime',
    ];

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeNoLeidas($query)
    {
        return $query->where('leida', false);
    }

    public function scopeRecientes($query, $dias = 7)
    {
        return $query->where('created_at', '>=', now()->subDays($dias));
    }

    public function scopePorTipo($query, $tipo)
    {
        return $query->where('tipo', $tipo);
    }

    // Métodos auxiliares
    public function marcarComoLeida()
    {
        $this->update([
            'leida' => true,
            'fecha_leida' => now(),
        ]);
    }

    // Métodos estáticos para crear notificaciones
    public static function crearInscripcion($profesorId, $alumno, $turno)
    {
        return self::create([
            'usuario_id' => $profesorId,
            'tipo' => 'inscripcion',
            'titulo' => 'Nueva inscripción',
            'mensaje' => "{$alumno->nombre_completo} se inscribió en tu turno {$turno->dia_semana} {$turno->hora_inicio}",
            'data' => [
                'alumno_id' => $alumno->id,
                'turno_id' => $turno->id,
            ],
            'url' => '/profesor/turnos',
        ]);
    }

    public static function crearBaja($profesorId, $alumno, $turno)
    {
        return self::create([
            'usuario_id' => $profesorId,
            'tipo' => 'baja',
            'titulo' => 'Baja de turno',
            'mensaje' => "{$alumno->nombre_completo} se dio de baja del turno {$turno->dia_semana} {$turno->hora_inicio}",
            'data' => [
                'alumno_id' => $alumno->id,
                'turno_id' => $turno->id,
            ],
            'url' => '/profesor/turnos',
        ]);
    }

    public static function crearMensaje($destinatarioId, $remitente)
    {
        return self::create([
            'usuario_id' => $destinatarioId,
            'tipo' => 'mensaje',
            'titulo' => 'Nuevo mensaje',
            'mensaje' => "Tienes un nuevo mensaje de {$remitente->nombre_completo}",
            'data' => [
                'remitente_id' => $remitente->id,
            ],
            'url' => '/mensajes',
        ]);
    }
}
