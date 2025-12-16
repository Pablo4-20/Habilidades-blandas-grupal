<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            UsuarioSeeder::class,        // 1. Usuarios
            AsignaturaSeeder::class,     // 2. Asignaturas (CRUCIAL: Debe ir antes de habilidades)
            HabilidadBlandaSeeder::class,// 3. Habilidades (Usa asignaturas)
            EstudianteSeeder::class,     // 4. Estudiantes
        ]);
    }
}