<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Evaluacion extends Model
{
    use HasFactory;

    // 1. ESPECIFICAR LA TABLA CORRECTA (Para corregir el error 500)
    protected $table = 'evaluaciones';

    // 2. CAMPOS PERMITIDOS (Para que deje guardar las notas después)
    protected $fillable = [
        'planificacion_id',
        'estudiante_id',
        'parcial',
        'nivel'
    ];

    // Relaciones (Opcionales por ahora, pero buenas para futuro)
    public function estudiante()
    {
        return $this->belongsTo(Estudiante::class);
    }

    public function planificacion()
    {
        return $this->belongsTo(Planificacion::class);
    }
}