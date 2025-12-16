<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('periodos_academicos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre'); // Ej: "Octubre 2025 - Febrero 2026"
            $table->date('fecha_inicio');
            $table->date('fecha_fin');
            $table->boolean('activo')->default(true); // Para ocultar periodos antiguos
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('periodos_academicos');
    }
};