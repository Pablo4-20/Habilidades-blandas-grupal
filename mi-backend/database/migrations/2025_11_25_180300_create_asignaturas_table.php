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
    Schema::create('asignaturas', function (Blueprint $table) {
        $table->id();
        $table->string('nombre');   // Ej: Programación Web II [cite: 46]
        $table->string('carrera');  // Software [cite: 47]
        $table->string('ciclo');    // IV, V, VI [cite: 40]
        $table->timestamps();

        $table->unique(['nombre', 'carrera']);
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asignaturas');
    }
};
