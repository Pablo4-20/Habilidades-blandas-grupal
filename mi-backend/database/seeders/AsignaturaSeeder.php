<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AsignaturaSeeder extends Seeder
{
    public function run(): void
    {
        $asignaturas = [
            // --- Carrera de Software ---
            ['nombre' => 'Programación Orientada a Objetos', 'carrera' => 'Software', 'ciclo' => 'II'],
            ['nombre' => 'Estructura de Datos', 'carrera' => 'Software', 'ciclo' => 'III'],
            ['nombre' => 'Programación Web I', 'carrera' => 'Software', 'ciclo' => 'IV'],
            ['nombre' => 'Programación Web II', 'carrera' => 'Software', 'ciclo' => 'V'], // [cite: 46]
            ['nombre' => 'Programación Móvil', 'carrera' => 'Software', 'ciclo' => 'VI'],
            ['nombre' => 'Inteligencia Artificial', 'carrera' => 'Software', 'ciclo' => 'VII'],
            
            // --- Carrera de TI ---
            ['nombre' => 'Fundamentos de Programación', 'carrera' => 'TI', 'ciclo' => 'I'],
            ['nombre' => 'Redes de Datos', 'carrera' => 'TI', 'ciclo' => 'V'], // [cite: 57]
            ['nombre' => 'Seguridad de Base de Datos', 'carrera' => 'TI', 'ciclo' => 'VI'],
            ['nombre' => 'Cloud Computing', 'carrera' => 'TI', 'ciclo' => 'VIII'],
        ];

        DB::table('asignaturas')->insert($asignaturas);
    }
}