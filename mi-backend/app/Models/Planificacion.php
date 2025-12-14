<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Planificacion extends Model
{
    use HasFactory;

    // Nombre exacto de la tabla en la base de datos
    protected $table = 'planificaciones';

    protected $fillable = [
        'docente_id',
        'asignatura_id',
        'habilidad_blanda_id',
        'periodo_academico',
        'parcial'
    ];

    // --- RELACIONES (Esto es lo que faltaba o estaba mal) ---

    public function docente()
    {
        return $this->belongsTo(User::class, 'docente_id');
    }

    public function asignatura()
    {
        return $this->belongsTo(Asignatura::class, 'asignatura_id');
    }

    // Esta es la clave para que aparezca en el combo de Calificar
    public function habilidad()
    {
        return $this->belongsTo(HabilidadBlanda::class, 'habilidad_blanda_id');
    }
}