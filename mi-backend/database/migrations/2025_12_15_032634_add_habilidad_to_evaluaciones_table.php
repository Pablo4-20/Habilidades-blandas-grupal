<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('evaluaciones', function (Blueprint $table) {
            // Agregamos la columna habilidad_blanda_id si no existe
            if (!Schema::hasColumn('evaluaciones', 'habilidad_blanda_id')) {
                $table->foreignId('habilidad_blanda_id')
                      ->nullable() // Nullable por si tienes datos viejos
                      ->constrained('habilidades_blandas'); 
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