<?php


use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('movimientos_cuenta', function (Blueprint $table) {
            $table->id();
            
            // Relación con estado de cuenta
            $table->foreignId('estado_cuenta_id')
                ->constrained('estados_cuenta')
                ->onDelete('cascade');
            
            // Tipo de movimiento
            $table->enum('tipo', ['cargo', 'pago', 'ajuste']);
            
            // Monto del movimiento
            $table->decimal('monto', 10, 2);
            
            // Descripción
            $table->string('concepto');
            $table->text('observaciones')->nullable();
            
            $table->timestamps();
            
            // Índice para búsquedas por fecha
            $table->index(['estado_cuenta_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('movimientos_cuenta');
    }
};

