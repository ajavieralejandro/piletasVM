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
        $table->string('external_provider')->nullable()->index();
        $table->string('external_user_id')->nullable()->index();
        $table->unique(['external_provider', 'external_user_id']);
    });
}


    /**
     * Reverse the migrations.
     */
  public function down(): void
{
    Schema::table('users', function (Blueprint $table) {
        $table->dropUnique(['external_provider', 'external_user_id']);
        $table->dropColumn(['external_provider', 'external_user_id']);
    });
}
};