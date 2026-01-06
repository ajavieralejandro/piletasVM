<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('socio_sid', 50)->nullable()->index();
            $table->string('socio_barcode', 100)->nullable()->index();
            $table->string('socio_hab_controles', 50)->nullable()->index();

            $table->boolean('tiene_pileta')->default(false)->index();
            $table->boolean('tiene_gym')->default(false)->index();

            $table->timestamp('padron_synced_at')->nullable()->index();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'socio_sid',
                'socio_barcode',
                'socio_hab_controles',
                'tiene_pileta',
                'tiene_gym',
                'padron_synced_at',
            ]);
        });
    }
};
