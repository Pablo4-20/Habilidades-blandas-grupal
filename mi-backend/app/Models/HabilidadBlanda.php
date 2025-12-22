<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HabilidadBlanda extends Model
{
    use HasFactory;

    protected $fillable = [
        'asignatura_id', 
        'catalogo_habilidad_id', // 👈 Nuevo FK
        'actividades'
    ];

    // Relación con la Asignatura
    public function asignatura() {
        return $this->belongsTo(Asignatura::class);
    }

    // 👇 Relación con el Catálogo (Para obtener el nombre y definición)
    public function catalogo() {
        return $this->belongsTo(CatalogoHabilidad::class, 'catalogo_habilidad_id');
    }
}