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
        Schema::create('planificaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('docente_id')->constrained('users');
            $table->foreignId('asignatura_id')->constrained('asignaturas');
            $table->foreignId('habilidad_blanda_id')->constrained('habilidades_blandas');
            $table->string('periodo_academico');
            
            // --- CAMBIO: Agregamos el Parcial ---
            $table->enum('parcial', ['1', '2']); 

            $table->timestamps();

            // --- REGLA DE ORO: Una materia no puede repetir parcial ---
            // Esto impedirá a nivel de base de datos que se guarde duplicado
            $table->unique(['asignatura_id', 'parcial', 'periodo_academico'], 'unica_plan_parcial');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('planificacions');
    }
};
