<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('socios_padron', function (Blueprint $table) {
            $table->id();

            $table->string('dni', 50)->index();
            $table->string('sid', 50)->nullable()->index();

            $table->string('apynom', 255)->nullable();

            $table->string('barcode', 120)->nullable()->index();

            $table->decimal('saldo', 12, 2)->default(0);

            $table->integer('semaforo')->nullable()->index();
            $table->integer('ult_impago')->nullable()->index();

            $table->boolean('acceso_full')->default(false)->index();

            // OJO: en tu data real viene como string con comas y comillas:
            // NULL, "201", "202", "201,202"
            $table->string('hab_controles', 50)->nullable()->index();

            // Raw JSON completo (por auditoría)
            $table->json('raw')->nullable();

            $table->timestamps();

            // Evitar duplicados por DNI (si tu padrón lo garantiza)
            $table->unique('dni');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('socios_padron');
    }
};
