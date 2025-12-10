<?php


use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pases_libre_diarios', function (Blueprint $table) {
            $table->id();
            
            // Alumno que reserva
            $table->foreignId('alumno_id')
                ->constrained('users')
                ->onDelete('cascade');
            
            // Turno al que se anota
            $table->foreignId('turno_id')
                ->constrained('turnos')
                ->onDelete('cascade');
            
            // Fecha de la reserva
            $table->date('fecha');
            
            // Estado de la reserva
            $table->enum('estado', ['reservado', 'asistio', 'no_asistio', 'cancelado'])
                ->default('reservado');
            
            $table->timestamps();
            
            // Un alumno solo puede reservar un turno por día
            $table->unique(['alumno_id', 'fecha', 'turno_id']);
            $table->index(['turno_id', 'fecha', 'estado']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pases_libre_diarios');
    }
};

