<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Planificacion extends Model
{
    use HasFactory;

    protected $table = 'planificaciones';

    protected $fillable = [
        'asignatura_id',
        'docente_id',
        'habilidad_id',
        'parcial',
        'periodo_academico',
        'fecha_inicio',
        'fecha_fin',
        'habilidad_blanda_id'
    ];

    // ✅ RELACIÓN CON ASIGNATURA
    public function asignatura()
    {
        return $this->belongsTo(Asignatura::class, 'asignatura_id');
    }

    // ✅ RELACIÓN CON DOCENTE (Usuario)
    public function docente()
    {
        return $this->belongsTo(User::class, 'docente_id');
    }

    // ✅ RELACIÓN CON HABILIDAD (con manejo de nulls)
    public function habilidad()
    {
        return $this->belongsTo(HabilidadBlanda::class, 'habilidad_id')->withDefault([
            'nombre' => 'Sin habilidad asignada',
            'descripcion' => ''
        ]);
    }

    // ✅ RELACIÓN CON DETALLES (hasMany - ESTA FALTABA)
    public function detalles()
    {
        return $this->hasMany(DetallePlanificacion::class, 'planificacion_id');
    }

    // ✅ RELACIÓN CON EVALUACIONES
    public function evaluaciones()
    {
        return $this->hasMany(Evaluacion::class, 'planificacion_id');
    }

    // ✅ RELACIÓN CON REPORTE (si existe)
    public function reporte()
    {
        return $this->hasOne(Reporte::class, 'planificacion_id');
    }
}