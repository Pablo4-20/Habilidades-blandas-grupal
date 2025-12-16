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
    Schema::create('evaluaciones', function (Blueprint $table) {
        $table->id();
        
        // Contexto: ¿A qué planificación pertenece esta nota?
        $table->foreignId('planificacion_id')->constrained('planificaciones')->onDelete('cascade');
        
        // Sujeto: ¿A quién evaluamos?
        $table->foreignId('estudiante_id')->constrained('estudiantes')->onDelete('cascade');
        
        // Datos de la evaluación
        $table->enum('parcial', ['1', '2']); // Primer o Segundo Parcial [cite: 293]
        $table->integer('nivel'); // Nivel 1 al 5 según rúbrica [cite: 296]
        $table->text('observacion')->nullable(); // Feedback opcional
        
        $table->timestamps();
        
        // Restricción Única: Un estudiante no puede tener dos notas para el mismo parcial en la misma planificación
        $table->unique(['planificacion_id', 'estudiante_id', 'parcial'], 'unica_evaluacion_parcial');
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evaluaciones');
    }
};
