<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Planificacion;
use App\Models\Asignatura;
use App\Models\HabilidadBlanda;
use Illuminate\Http\Request;

class PlanificacionController extends Controller
{
    // 1. Obtener datos para llenar los selectores en el Frontend
    public function datosIniciales()
    {
        return response()->json([
            'asignaturas' => Asignatura::all(),
            'habilidades' => HabilidadBlanda::all(),
        ]);
    }

    // 2. Ver las planificaciones creadas por un docente específico
    public function index(Request $request)
    {
        // En el futuro tomaremos el ID del usuario logueado. 
        // Por ahora, recibimos 'docente_id' como filtro para probar.
        $docenteId = $request->query('docente_id');

        $planificaciones = Planificacion::with(['asignatura', 'habilidad'])
            ->where('docente_id', $docenteId)
            ->get();

        return response()->json($planificaciones);
    }

    // 3. Guardar una nueva planificación
    public function store(Request $request)
    {
        $request->validate([
            'docente_id' => 'required|exists:users,id',
            'asignatura_id' => 'required|exists:asignaturas,id',
            'habilidad_blanda_id' => 'required|exists:habilidades_blandas,id',
            'periodo_academico' => 'required|string',
            'parcial' => 'required|in:1,2' // <--- Validamos que llegue el parcial
        ]);

        // VERIFICACIÓN MANUAL PARA MENSAJE PERSONALIZADO
        $existe = Planificacion::where('asignatura_id', $request->asignatura_id)
            ->where('parcial', $request->parcial)
            ->where('periodo_academico', $request->periodo_academico)
            ->exists();

        if ($existe) {
            return response()->json([
                'message' => 'Error: Ya existe una habilidad planificada para este Parcial en esta materia.'
            ], 422);
        }

        $nuevaPlanificacion = Planificacion::create($request->all());

        return response()->json([
            'message' => 'Planificación creada exitosamente',
            'data' => $nuevaPlanificacion
        ], 201);
    }
}