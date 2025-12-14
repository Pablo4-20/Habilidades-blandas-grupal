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
    Schema::table('asignaturas', function (Blueprint $table) {
        // Agregamos la columna para: Unidad Básica, Profesional, Integración
        $table->string('unidad_curricular')->default('Unidad Básica')->after('ciclo');
    });
}

public function down(): void
{
    Schema::table('asignaturas', function (Blueprint $table) {
        $table->dropColumn('unidad_curricular');
    });
}
};
