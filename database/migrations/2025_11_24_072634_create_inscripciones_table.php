<?php


use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inscripciones', function (Blueprint $table) {
            $table->id();
            
            // Relaciones
            $table->foreignId('turno_id')
                ->constrained('turnos')
                ->onDelete('cascade');
            
            $table->foreignId('alumno_id')
                ->constrained('users')
                ->onDelete('cascade');
            
            // Datos de la inscripción
            $table->date('fecha_inscripcion');
            
            $table->enum('estado', ['activo', 'inactivo', 'suspendido'])
                ->default('activo');
            
            $table->boolean('pase_libre')->default(false);
            
            $table->timestamps();
            $table->softDeletes();
            
            // Índices
            $table->index(['alumno_id', 'estado']);
            $table->index('turno_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inscripciones');
    }
};

