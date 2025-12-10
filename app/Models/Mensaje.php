<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Mensaje extends Model
{
    protected $table = 'mensajes';

    protected $fillable = [
        'remitente_id',
        'destinatario_id',
        'turno_id',
        'asunto',
        'contenido',
        'prioridad',
        'es_grupal',
        'leido',
        'fecha_leido',
    ];

    protected $casts = [
        'es_grupal' => 'boolean',
        'leido' => 'boolean',
        'fecha_leido' => 'datetime',
    ];

    // Relaciones
    public function remitente(): BelongsTo
    {
        return $this->belongsTo(User::class, 'remitente_id');
    }

    public function destinatario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'destinatario_id');
    }

    public function turno(): BelongsTo
    {
        return $this->belongsTo(Turno::class);
    }

    public function destinatarios(): HasMany
    {
        return $this->hasMany(MensajeDestinatario::class);
    }

    // Scopes
    public function scopeNoLeidos($query)
    {
        return $query->where('leido', false);
    }

    public function scopeParaUsuario($query, $usuarioId)
    {
        return $query->where(function($q) use ($usuarioId) {
            $q->where('destinatario_id', $usuarioId)
              ->orWhereHas('destinatarios', function($subq) use ($usuarioId) {
                  $subq->where('destinatario_id', $usuarioId);
              });
        });
    }

    public function scopeDeUsuario($query, $usuarioId)
    {
        return $query->where('remitente_id', $usuarioId);
    }

    // Métodos auxiliares
    public function marcarComoLeido()
    {
        $this->update([
            'leido' => true,
            'fecha_leido' => now(),
        ]);
    }

    public function getEsUrgente()
    {
        return $this->prioridad === 'urgente';
    }
}
