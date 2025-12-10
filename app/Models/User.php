<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Database\Eloquent\SoftDeletes;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens, HasRoles, SoftDeletes;

    protected $fillable = [
        'nombre',
        'apellido',
        'dni',
        'telefono',
        'email',
        'password',
        'tipo_usuario',
        'tipo_cliente',
        'activo',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];


    protected $appends = ['nombre_completo'];  // ← ESTA ES LA LÍNEA NUEVA

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'activo' => 'boolean',
        ];
    }

    // Accessor para nombre completo
    public function getNombreCompletoAttribute()
    {
        return "{$this->nombre} {$this->apellido}";
    }

    // Relaciones
    public function turnosComoProfesor()
    {
        return $this->hasMany(Turno::class, 'profesor_id');
    }

    public function inscripciones()
    {
        return $this->hasMany(Inscripcion::class, 'alumno_id');
    }

    public function asistencias()
    {
        return $this->hasMany(Asistencia::class, 'alumno_id');
    }

    public function estadoCuenta()
    {
        return $this->hasOne(EstadoCuenta::class, 'alumno_id');
    }

    public function cambiosNivel()
    {
        return $this->hasMany(CambioNivel::class, 'alumno_id');
    }

    public function notificaciones()
    {
        return $this->hasMany(Notificacion::class, 'usuario_id');
    }

    public function pasesLibreDiarios()
    {
        return $this->hasMany(PaseLibreDiario::class, 'alumno_id');
    }

    // Scopes
    public function scopeActivos($query)
    {
        return $query->where('activo', true);
    }

    public function scopeProfesores($query)
    {
        return $query->where('tipo_usuario', 'profesor');
    }

    public function scopeAlumnos($query)
    {
        return $query->where('tipo_usuario', 'cliente');
    }

    public function scopeConPaseLibre($query)
    {
        return $query->where('tipo_cliente', 'pase_libre');
    }

    // Métodos de verificación
    public function esProfesor()
    {
        return $this->tipo_usuario === 'profesor';
    }

    public function esAlumno()
    {
        return $this->tipo_usuario === 'cliente';
    }

    public function esCoordinador()
    {
        return $this->tipo_usuario === 'coordinador';
    }

    public function esSecretaria()
    {
        return $this->tipo_usuario === 'secretaria';
    }

    public function tienePaseLibre()
    {
        return $this->tipo_cliente === 'pase_libre';
    }
}