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
    Schema::create('estudiantes', function (Blueprint $table) {
        $table->id();
        $table->string('nombres');      // Ej: Miguel
        $table->string('apellidos');    // Ej: Andrade
        $table->string('email')->unique()->nullable(); 
        $table->string('carrera');      // Software o TI 
        $table->string('ciclo_actual'); // Ej: Quinto
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('estudiantes');
    }
};
