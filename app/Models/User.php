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

        // ✅ Padron Socios (bridge)
        'socio_sid',
        'socio_barcode',
        'socio_hab_controles',
        'tiene_pileta',
        'tiene_gym',
        'padron_synced_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $appends = [
        'nombre_completo',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'activo' => 'boolean',

            // ✅ Padron Socios
            'tiene_pileta' => 'boolean',
            'tiene_gym' => 'boolean',
            'padron_synced_at' => 'datetime',
        ];
    }

    // Accessor para nombre completo
    public function getNombreCompletoAttribute()
    {
        return "{$this->nombre} {$this->apellido}";
    }

    // ======================
    // Relaciones como Profesor
    // ======================
    public function turnosComoProfesor()
    {
        return $this->hasMany(Turno::class, 'profesor_id');
    }

    public function cambiosNivelSugeridos()
    {
        return $this->hasMany(CambioNivel::class, 'sugerido_por');
    }

    // ======================
    // Relaciones como Alumno
    // ======================
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

    // ======================
    // Scopes
    // ======================
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

    public function scopeNormales($query)
    {
        return $query->where('tipo_cliente', 'normal');
    }

    // ======================
    // Métodos de verificación
    // ======================
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

    // ======================
    // Padron helpers (opcional pero útil)
    // ======================
    public function padronControlesCodes(): array
    {
        $s = trim((string) ($this->socio_hab_controles ?? ''));

        if ($s === '') return [];

        // viene con comillas tipo: "201,202"
        $s = str_replace('"', '', $s);

        return array_values(array_filter(array_map('trim', explode(',', $s))));
    }

    public function padronTieneControl(string|int $code): bool
    {
        $code = (string) $code;
        return in_array($code, $this->padronControlesCodes(), true);
    }

    // ======================
    // Booted
    // ======================
    protected static function booted()
    {
        static::created(function ($user) {
            // Si es un cliente, crear su estado de cuenta
            if ($user->tipo_usuario === 'cliente') {
                // Evitar duplicados por si algo raro ocurre
                if (!$user->estadoCuenta()->exists()) {
                    $user->estadoCuenta()->create([
                        'saldo' => 0,
                    ]);
                }
            }
        });
    }
}
