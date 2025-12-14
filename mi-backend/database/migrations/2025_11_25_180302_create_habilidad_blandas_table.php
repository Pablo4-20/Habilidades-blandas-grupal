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
    Schema::create('habilidades_blandas', function (Blueprint $table) {
        $table->id();
        $table->string('nombre');      // Ej: Trabajo en Equipo [cite: 46]
        $table->text('definicion');    // Definición de la sección 3 [cite: 67]
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('habilidad_blandas');
    }
};
