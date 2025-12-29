<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        // Esta migración era un workaround viejo.
        // En MySQL (y con base nueva) NO recreamos users.
    }

    public function down(): void
    {
        //
    }
};
