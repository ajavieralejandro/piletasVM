<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Eliminar tabla vieja y recrear con estructura correcta
        Schema::dropIfExists('asistencias');
        
        Schema::create('asistencias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('turno_id')->constrained('turnos')->onDelete('cascade');
            $table->foreignId('alumno_id')->constrained('users')->onDelete('cascade');
            $table->date('fecha');
            $table->enum('estado', ['presente', 'ausente', 'justificado'])->default('presente');
            $table->text('observaciones')->nullable();
            $table->timestamps();
            
            // Índices
            $table->index(['turno_id', 'fecha']);
            $table->index('alumno_id');
            $table->unique(['turno_id', 'alumno_id', 'fecha']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asistencias');
    }
};
