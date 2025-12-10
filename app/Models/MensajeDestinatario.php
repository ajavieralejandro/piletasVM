<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MensajeDestinatario extends Model
{
    protected $table = 'mensaje_destinatarios';

    protected $fillable = [
        'mensaje_id',
        'destinatario_id',
        'leido',
        'fecha_leido',
    ];

    protected $casts = [
        'leido' => 'boolean',
        'fecha_leido' => 'datetime',
    ];

    public function mensaje(): BelongsTo
    {
        return $this->belongsTo(Mensaje::class);
    }

    public function destinatario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'destinatario_id');
    }

    public function marcarComoLeido()
    {
        $this->update([
            'leido' => true,
            'fecha_leido' => now(),
        ]);
    }
}
