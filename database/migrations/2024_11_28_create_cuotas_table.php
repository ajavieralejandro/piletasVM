<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cuotas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('alumno_id')->constrained('users')->onDelete('cascade');
            $table->decimal('monto', 10, 2);
            $table->date('fecha_vencimiento');
            $table->enum('estado', ['pendiente', 'pagada', 'vencida'])->default('pendiente');
            $table->date('fecha_pago')->nullable();
            $table->text('observaciones')->nullable();
            $table->boolean('recordatorio_enviado')->default(false);
            $table->timestamps();

            // Índices para búsquedas rápidas
            $table->index('fecha_vencimiento');
            $table->index('estado');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cuotas');
    }
};
