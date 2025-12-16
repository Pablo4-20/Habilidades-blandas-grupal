<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UsuarioSeeder extends Seeder
{
    public function run(): void
{
    // 1. ADMIN
    DB::table('users')->updateOrInsert(
        ['email' => 'admin@ueb.edu.ec'],
        [
            'cedula' => '0200000001',
            'nombres' => 'Administrador', // Separado
            'apellidos' => 'Sistema',     // Separado
            'password' => Hash::make('password'),
            'rol' => 'admin',
            'created_at' => now(), 'updated_at' => now(),
        ]
    );

    // 2. COORDINADOR
    DB::table('users')->updateOrInsert(
        ['email' => 'coordinador@ueb.edu.ec'],
        [
            'cedula' => '0200000002',
            'nombres' => 'Galuth',
            'apellidos' => 'García',
            'password' => Hash::make('password'),
            'rol' => 'coordinador',
            'created_at' => now(), 'updated_at' => now(),
        ]
    );

    // 3. DOCENTE
    DB::table('users')->updateOrInsert(
        ['email' => 'docente@ueb.edu.ec'],
        [
            'cedula' => '0200000003',
            'nombres' => 'Docente',
            'apellidos' => 'Prueba',
            'password' => Hash::make('password'),
            'rol' => 'docente',
            'created_at' => now(), 'updated_at' => now(),
        ]
    );
}
}