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
    Schema::create('asignaciones', function (Blueprint $table) {
        $table->id();
        $table->foreignId('docente_id')->constrained('users')->onDelete('cascade'); // El profesor
        $table->foreignId('asignatura_id')->constrained('asignaturas')->onDelete('cascade'); // La materia
        $table->string('periodo'); // Ej: Agosto - Diciembre 2025
        $table->string('paralelo')->default('A'); // Ej: A, B
        $table->timestamps();

        // Evitar duplicados (Mismo profe, misma materia, mismo periodo y paralelo)
        $table->unique(['asignatura_id', 'periodo', 'paralelo'], 'asignacion_unica_materia');
    });
}
};
