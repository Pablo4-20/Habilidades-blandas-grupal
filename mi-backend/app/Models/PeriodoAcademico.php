<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PeriodoAcademico extends Model
{
    use HasFactory;

    protected $table = 'periodos_academicos';

    protected $fillable = [
        'nombre',
        'fecha_inicio',
        'fecha_fin',
        'activo'
    ];

    protected $casts = [
        'activo' => 'boolean',
        'fecha_inicio' => 'date',
        'fecha_fin' => 'date',
    ];
}