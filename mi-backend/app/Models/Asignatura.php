<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Asignatura extends Model
{
    // Permitimos asignar estos datos masivamente
    protected $fillable = ['nombre', 'carrera', 'ciclo', 'unidad_curricular'];

    // Una asignatura puede tener muchas planificaciones (una por cada habilidad que se quiera evaluar)
    public function planificaciones()
    {
        return $this->hasMany(Planificacion::class);
    }
}