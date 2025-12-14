<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Estudiante extends Model
{
    use HasFactory;

    // ESTA ES LA PARTE QUE FALTA: Definir qué campos se pueden guardar
    protected $fillable = [
        'nombres',
        'apellidos',
        'email', // <--- AGREGA ESTO
        'carrera',
        'ciclo_actual',
    ];
}