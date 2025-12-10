<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('turnos', function (Blueprint $table) {
            $table->id();
            
            // Relación con profesor
            $table->foreignId('profesor_id')
                ->constrained('users')
                ->onDelete('cascade');
            
            // Relación con nivel (puede ser null para clases generales)
            $table->foreignId('nivel_id')
                ->nullable()
                ->constrained('niveles')
                ->onDelete('set null');
            
            // Horarios
            $table->time('hora_inicio');
            $table->time('hora_fin');
            
            // Cupo
            $table->integer('cupo_maximo');
            
            // Día de la semana
            $table->enum('dia_semana', [
                'lunes', 
                'martes', 
                'miercoles', 
                'jueves', 
                'viernes', 
                'sabado', 
                'domingo'
            ]);
            
            $table->boolean('activo')->default(true);
            $table->timestamps();
            $table->softDeletes();
            
            // Índices para búsquedas rápidas
            $table->index(['dia_semana', 'hora_inicio']);
            $table->index('profesor_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('turnos');
    }
};

