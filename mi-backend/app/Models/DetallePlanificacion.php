<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DetallePlanificacion extends Model
{
    use HasFactory;

    protected $table = 'detalle_planificaciones'; 

    protected $fillable = [
        'planificacion_id',
        'habilidad_blanda_id',
        'actividades'
    ];

    // ✅ RELACIÓN INVERSA CON PLANIFICACIÓN
    public function planificacion()
    {
        return $this->belongsTo(Planificacion::class, 'planificacion_id');
    }

    // ✅ RELACIÓN ORIGINAL (No la borres por si otro reporte la usa)
    public function habilidadBlanda()
    {
        return $this->belongsTo(HabilidadBlanda::class, 'habilidad_blanda_id');
    }

    // ✅ SOLUCIÓN: AGREGA ESTA FUNCIÓN (Es un alias)
    // Esto hace que cuando el controlador llame a ->with('habilidad'), funcione.
    public function habilidad()
    {
        return $this->belongsTo(HabilidadBlanda::class, 'habilidad_blanda_id');
    }
}