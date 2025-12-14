<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HabilidadBlanda extends Model
{
    protected $table = 'habilidades_blandas'; // Especificamos la tabla porque Laravel buscaría "habilidad_blandas"
    protected $fillable = ['nombre', 'definicion', 'actividades'];

    public function planificaciones()
    {
        return $this->hasMany(Planificacion::class);
    }
}