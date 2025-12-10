<?php


use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cambios_nivel', function (Blueprint $table) {
            $table->id();
            
            // Alumno que cambia de nivel
            $table->foreignId('alumno_id')
                ->constrained('users')
                ->onDelete('cascade');
            
            // Niveles
            $table->foreignId('nivel_anterior_id')
                ->nullable()
                ->constrained('niveles')
                ->onDelete('set null');
            
            $table->foreignId('nivel_nuevo_id')
                ->constrained('niveles')
                ->onDelete('cascade');
            
            // Quién sugirió el cambio (profesor)
            $table->foreignId('sugerido_por')
                ->nullable()
                ->constrained('users')
                ->onDelete('set null');
            
            // Estado del cambio
            $table->enum('estado', ['pendiente', 'aprobado', 'rechazado'])
                ->default('pendiente');
            
            $table->text('observaciones')->nullable();
            $table->timestamp('fecha_cambio')->nullable();
            
            $table->timestamps();
            
            // Índice para buscar cambios pendientes
            $table->index(['alumno_id', 'estado']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cambios_nivel');
    }
};

