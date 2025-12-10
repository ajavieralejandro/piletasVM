<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('estados_cuenta', function (Blueprint $table) {
            $table->id();
            
            // Relación con alumno (1 a 1)
            $table->foreignId('alumno_id')
                ->constrained('users')
                ->onDelete('cascade');
            
            // Saldo actual (negativo = debe, positivo = a favor)
            $table->decimal('saldo', 10, 2)->default(0);
            
            // Información del último pago
            $table->decimal('ultimo_pago', 10, 2)->nullable();
            $table->date('fecha_ultimo_pago')->nullable();
            $table->date('proxima_fecha_pago')->nullable();
            
            $table->timestamps();
            
            // Un alumno solo puede tener un estado de cuenta
            $table->unique('alumno_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('estados_cuenta');
    }
};

