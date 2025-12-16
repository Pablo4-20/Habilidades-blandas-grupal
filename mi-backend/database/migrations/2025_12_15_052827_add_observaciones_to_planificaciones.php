<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up() {
    Schema::table('planificaciones', function (Blueprint $table) {
        $table->text('observaciones')->nullable();
    });
}
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('planificaciones', function (Blueprint $table) {
            //
        });
    }
};
