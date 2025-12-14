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
    Schema::table('habilidades_blandas', function (Blueprint $table) {
        $table->text('actividades')->nullable()->after('definicion'); // Campo nuevo
    });
}

public function down(): void
{
    Schema::table('habilidades_blandas', function (Blueprint $table) {
        $table->dropColumn('actividades');
    });
}
};
