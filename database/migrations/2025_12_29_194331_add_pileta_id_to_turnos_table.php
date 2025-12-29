<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('turnos', function (Blueprint $table) {
            $table->foreignId('pileta_id')
                ->nullable()               // por ahora nullable para no romper datos existentes
                ->after('nivel_id')
                ->constrained('piletas')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('turnos', function (Blueprint $table) {
            $table->dropConstrainedForeignId('pileta_id');
        });
    }
};
