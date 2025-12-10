<?php


use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clases', function (Blueprint $table) {
            $table->id();
            
            // Relación con turno
            $table->foreignId('turno_id')
                ->constrained('turnos')
                ->onDelete('cascade');
            
            // Fecha específica de la clase
            $table->date('fecha');
            
            // Estado de la clase
            $table->enum('estado', ['programada', 'realizada', 'cancelada'])
                ->default('programada');
            
            $table->text('observaciones')->nullable();
            $table->timestamps();
            
            // Índices
            $table->unique(['turno_id', 'fecha']); // No puede haber 2 clases del mismo turno el mismo día
            $table->index('fecha');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clases');
    }
};

