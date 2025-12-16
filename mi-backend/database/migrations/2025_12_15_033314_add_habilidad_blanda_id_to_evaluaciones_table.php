<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('evaluaciones', function (Blueprint $table) {
            // Solo la agregamos si no existe
            if (!Schema::hasColumn('evaluaciones', 'habilidad_blanda_id')) {
                $table->foreignId('habilidad_blanda_id')
                      ->nullable() // Importante: nullable para no romper datos viejos
                      ->constrained('habilidades_blandas')
                      ->onDelete('cascade');
            }
        });
    }

    public function down()
    {
        Schema::table('evaluaciones', function (Blueprint $table) {
            $table->dropForeign(['habilidad_blanda_id']);
            $table->dropColumn('habilidad_blanda_id');
        });
    }
};