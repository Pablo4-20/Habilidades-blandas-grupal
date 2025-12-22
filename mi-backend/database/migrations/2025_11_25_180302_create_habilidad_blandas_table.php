<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
{
    Schema::create('habilidad_blandas', function (Blueprint $table) {
        $table->id();
        
        // Relación con la Materia
        $table->foreignId('asignatura_id')->constrained('asignaturas')->onDelete('cascade');
        
        // Relación con el Catálogo de Habilidades
        $table->foreignId('catalogo_habilidad_id')->constrained('catalogo_habilidades')->onDelete('cascade');

        // Las actividades siguen siendo específicas de cada materia
        $table->text('actividades')->nullable(); 
        
        $table->timestamps();

        $table->unique(['asignatura_id', 'catalogo_habilidad_id'], 'unique_asignatura_habilidad');
        
    });
}

    public function down(): void
    {
        Schema::dropIfExists('habilidades_blandas');
    }
};