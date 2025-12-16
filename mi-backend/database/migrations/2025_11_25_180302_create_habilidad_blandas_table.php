<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('habilidades_blandas', function (Blueprint $table) {
            $table->id();
            
            // ESTA ES LA COLUMNA QUE FALTABA
            $table->foreignId('asignatura_id')->constrained('asignaturas')->onDelete('cascade');
            
            $table->string('nombre');
            $table->text('definicion');
            $table->text('actividades')->nullable();
            $table->timestamps();

            // Evitamos duplicados
            $table->unique(['asignatura_id', 'nombre']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('habilidades_blandas');
    }
};