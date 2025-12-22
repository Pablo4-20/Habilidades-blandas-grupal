<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CatalogoHabilidad extends Model
{
    use HasFactory;

    protected $table = 'catalogo_habilidades';

    protected $fillable = ['nombre', 'definicion'];
}