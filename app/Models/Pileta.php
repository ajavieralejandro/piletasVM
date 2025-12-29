<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pileta extends Model
{
    protected $fillable = ['nombre', 'descripcion', 'activa'];

    public function turnos()
    {
        return $this->hasMany(Turno::class);
    }
}
