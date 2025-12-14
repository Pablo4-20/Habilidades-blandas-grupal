<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EstudianteSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('estudiantes')->insert([
            ['nombres' => 'Miguel', 'apellidos' => 'Andrade', 'carrera' => 'Software', 'ciclo_actual' => 'V'],
            ['nombres' => 'Lorena', 'apellidos' => 'Benavidez', 'carrera' => 'Software', 'ciclo_actual' => 'V'],
            ['nombres' => 'Joel', 'apellidos' => 'Diaz', 'carrera' => 'Software', 'ciclo_actual' => 'V'],
        ]);
    }
}