<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Asignacion extends Model
{
    use HasFactory;
    
    protected $table = 'asignaciones';

    protected $fillable = ['docente_id', 'asignatura_id', 'periodo', 'paralelo'];

    // --- ESTAS RELACIONES SON LAS QUE FALTAN Y CAUSAN EL ERROR 500 ---
    
    public function docente() {
        return $this->belongsTo(User::class, 'docente_id');
    }

    public function asignatura() { // <--- ¡ESTA ES LA CRÍTICA!
        return $this->belongsTo(Asignatura::class, 'asignatura_id');
    }
}