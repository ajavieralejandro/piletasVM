<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notificaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('users')->onDelete('cascade');
            $table->string('tipo'); // 'inscripcion', 'baja', 'mensaje', 'recordatorio'
            $table->string('titulo');
            $table->text('mensaje');
            $table->json('data')->nullable(); // Datos adicionales (turno_id, alumno_id, etc)
            $table->string('url')->nullable(); // Link a donde ir al hacer click
            $table->boolean('leida')->default(false);
            $table->timestamp('fecha_leida')->nullable();
            $table->timestamps();

            $table->index('usuario_id');
            $table->index('tipo');
            $table->index('leida');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notificaciones');
    }
};
