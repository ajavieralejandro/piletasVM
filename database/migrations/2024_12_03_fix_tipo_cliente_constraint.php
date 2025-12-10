<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 🛑 Si estamos usando SQLite, NO ejecutamos esta migración
        // porque recrear la tabla + copiar datos con SELECT * rompe por diferencia de columnas
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        // SQLite no permite modificar CHECK constraints directamente
        // Necesitamos recrear la tabla
        
        // 1. Crear tabla temporal con estructura correcta
        Schema::create('users_new', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('email')->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();
            $table->timestamps();
            $table->string('nombre');
            $table->string('apellido');
            $table->string('dni')->unique();
            $table->string('telefono');
            $table->enum('tipo_usuario', ['coordinador', 'secretaria', 'profesor', 'cliente'])->default('cliente');
            $table->enum('tipo_cliente', ['socio', 'no_socio', 'pase_libre'])->nullable();
            $table->boolean('activo')->default(true);
            $table->softDeletes();
        });
        
        // 2. Copiar datos existentes
        DB::statement("INSERT INTO users_new SELECT * FROM users");
        
        // 3. Eliminar tabla vieja
        Schema::drop('users');
        
        // 4. Renombrar nueva tabla
        Schema::rename('users_new', 'users');
    }

    public function down(): void
    {
        // En SQLite también nos salteamos el rollback
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        // No hay rollback porque cambiaríamos el constraint de vuelta
    }
};
