<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Asignacion extends Model
{
    use HasFactory;

    protected $table = 'asignaciones';

    protected $fillable = [
        'docente_id',
        'asignatura_id',
        'paralelo',
        'periodo'
    ];

    // Relaciones
    public function docente()
    {
        return $this->belongsTo(User::class, 'docente_id');
    }

    public function asignatura()
    {
        return $this->belongsTo(Asignatura::class, 'asignatura_id');
    }
}