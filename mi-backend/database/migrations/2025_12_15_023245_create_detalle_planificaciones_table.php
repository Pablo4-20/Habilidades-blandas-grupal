<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('detalle_planificaciones', function (Blueprint $table) {
            $table->id();
            
            // Relación con la planificación padre
            // onDelete('cascade') es VITAL: si borras la planificación, se borran sus detalles
            $table->foreignId('planificacion_id')
                  ->constrained('planificaciones')
                  ->onDelete('cascade'); 
            
            // Relación con la habilidad
            $table->foreignId('habilidad_blanda_id')
                  ->constrained('habilidad_blandas'); // Asegúrate que tu tabla de habilidades se llame así
            
            // Aquí se guardará el texto largo con las actividades seleccionadas
            $table->text('actividades'); 
            
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('detalle_planificaciones');
    }
};