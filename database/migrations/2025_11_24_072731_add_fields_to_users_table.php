<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Modificar campos existentes
            $table->string('name')->nullable()->change();
            
            // Agregar nuevos campos después de 'name'
            $table->string('nombre')->after('id');
            $table->string('apellido')->after('nombre');
            $table->string('dni')->unique()->after('apellido');
            $table->string('telefono')->after('dni');
            
            // Hacer email opcional
            $table->string('email')->nullable()->change();
            
            // Agregar campos de tipo de usuario
            $table->enum('tipo_usuario', ['coordinador', 'secretaria', 'profesor', 'cliente'])
                ->after('password')
                ->default('cliente');
            
            $table->enum('tipo_cliente', ['normal', 'pase_libre'])
                ->nullable()
                ->after('tipo_usuario');
            
            $table->boolean('activo')
                ->default(true)
                ->after('tipo_cliente');
            
            // Agregar soft deletes
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'nombre',
                'apellido',
                'dni',
                'telefono',
                'tipo_usuario',
                'tipo_cliente',
                'activo'
            ]);
            $table->dropSoftDeletes();
        });
    }
};
