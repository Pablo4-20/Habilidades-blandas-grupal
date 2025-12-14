<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UsuarioSeeder extends Seeder
{
    public function run(): void
    {
        // 1. ADMIN (Busca por email, si no existe, lo crea)
        DB::table('users')->updateOrInsert(
            ['email' => 'admin@ueb.edu.ec'], // Condición de búsqueda
            [
                'name' => 'Administrador Sistema',
                'password' => Hash::make('password'),
                'rol' => 'admin',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        // 2. COORDINADOR
        DB::table('users')->updateOrInsert(
            ['email' => 'coordinador@ueb.edu.ec'],
            [
                'name' => 'Ing. Galuth García',
                'password' => Hash::make('password'),
                'rol' => 'coordinador',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        // 3. DOCENTE
        DB::table('users')->updateOrInsert(
            ['email' => 'docente@ueb.edu.ec'],
            [
                'name' => 'Docente Prueba',
                'password' => Hash::make('password'),
                'rol' => 'docente',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );
    }
}