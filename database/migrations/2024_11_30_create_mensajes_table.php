<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mensajes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('remitente_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('destinatario_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->foreignId('turno_id')->nullable()->constrained('turnos')->onDelete('cascade');
            $table->string('asunto')->nullable();
            $table->text('contenido');
            $table->enum('prioridad', ['normal', 'importante', 'urgente'])->default('normal');
            $table->boolean('es_grupal')->default(false);
            $table->boolean('leido')->default(false);
            $table->timestamp('fecha_leido')->nullable();
            $table->timestamps();

            $table->index('remitente_id');
            $table->index('destinatario_id');
            $table->index('turno_id');
            $table->index('leido');
        });

        Schema::create('mensaje_destinatarios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mensaje_id')->constrained('mensajes')->onDelete('cascade');
            $table->foreignId('destinatario_id')->constrained('users')->onDelete('cascade');
            $table->boolean('leido')->default(false);
            $table->timestamp('fecha_leido')->nullable();
            $table->timestamps();

            $table->index('mensaje_id');
            $table->index('destinatario_id');
            $table->index('leido');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mensaje_destinatarios');
        Schema::dropIfExists('mensajes');
    }
};
