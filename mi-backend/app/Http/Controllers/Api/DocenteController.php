<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Asignacion;
use App\Models\Estudiante;
use App\Models\Planificacion;
use App\Models\Evaluacion;
use App\Models\Asignatura;
use Illuminate\Support\Facades\DB;

class DocenteController extends Controller
{
    

    // 1. Obtener las materias asignadas al docente logueado
    public function misAsignaturas(Request $request)
    {
        $user = $request->user();
        
        $asignaciones = Asignacion::with('asignatura')
            ->where('docente_id', $user->id)
            ->get();

        return $asignaciones->map(function ($asignacion) use ($user) {
            if (!$asignacion->asignatura) return null; 

            // Verificar si ya existe planificación para el parcial 1 y parcial 2
            $planificacion_p1 = \App\Models\Planificacion::where('asignatura_id', $asignacion->asignatura->id)
                                    ->where('docente_id', $user->id)
                                    ->where('periodo_academico', $asignacion->periodo) // CRUCIAL: Mismo Periodo
                                    ->where('parcial', '1')
                                    ->exists();

            $planificacion_p2 = \App\Models\Planificacion::where('asignatura_id', $asignacion->asignatura->id)
                                    ->where('docente_id', $user->id)
                                    ->where('periodo_academico', $asignacion->periodo) // CRUCIAL: Mismo Periodo
                                    ->where('parcial', '2')
                                    ->exists();
            
            return [
                'id' => $asignacion->asignatura->id,
                'nombre' => $asignacion->asignatura->nombre,
                'carrera' => $asignacion->asignatura->carrera,
                'ciclo' => $asignacion->asignatura->ciclo,
                'paralelo' => $asignacion->paralelo,
                'asignacion_id' => $asignacion->id,
                'periodo' => $asignacion->periodo,
                'planificacion_p1' => $planificacion_p1, // Nuevo: Estado P1
                'planificacion_p2' => $planificacion_p2  // Nuevo: Estado P2
            ];
        })->filter()->values();
    }
    // 2. Obtener habilidades planificadas (usado en los filtros)
    public function misHabilidades($asignatura_id, Request $request)
    {
        $user = $request->user();
        
        $planes = Planificacion::with('habilidad')
            ->where('docente_id', $user->id)
            ->where('asignatura_id', $asignatura_id)
            ->get();

        return $planes->map(function ($plan) {
            if (!$plan->habilidad) return null;

            return [
                'planificacion_id' => $plan->id,
                'habilidad_nombre' => $plan->habilidad->nombre,
                'periodo' => $plan->periodo_academico,
                'parcial' => $plan->parcial 
            ];
        })->filter()->values();
    }
    
    // 3. Ver estudiantes (Solo lista simple)
    public function verEstudiantes($asignatura_id, Request $request)
    {
        $user = $request->user();
        $esMia = Asignacion::where('docente_id', $user->id)->where('asignatura_id', $asignatura_id)->exists();

        if (!$esMia) return response()->json([], 403);

        $asignatura = Asignatura::findOrFail($asignatura_id);
        $estudiantes = Estudiante::where('carrera', $asignatura->carrera)
            ->where('ciclo_actual', $asignatura->ciclo)
            ->orderBy('apellidos')
            ->get();

        return response()->json($estudiantes);
    }

    // 4. Obtener Rúbrica (Estudiantes + Notas existentes)
    public function obtenerRubrica(Request $request)
    {
        $request->validate([
            'asignatura_id' => 'required',
            'planificacion_id' => 'required', 
            'parcial' => 'required|in:1,2'
        ]);

        $asignatura = Asignatura::findOrFail($request->asignatura_id);

        $estudiantes = Estudiante::where('carrera', $asignatura->carrera)
            ->where('ciclo_actual', $asignatura->ciclo)
            ->orderBy('apellidos')
            ->get();

        $notasExistentes = Evaluacion::where('planificacion_id', $request->planificacion_id)
            ->where('parcial', $request->parcial)
            ->get()
            ->keyBy('estudiante_id');

        $lista = $estudiantes->map(function ($est) use ($notasExistentes) {
            return [
                'estudiante_id' => $est->id,
                'nombres' => $est->apellidos . ' ' . $est->nombres,
                'nivel' => $notasExistentes->get($est->id)->nivel ?? null
            ];
        });

        return response()->json($lista);
    }

    // 5. Guardar calificaciones
    public function guardarNotas(Request $request)
    {
        $request->validate([
            'planificacion_id' => 'required|exists:planificaciones,id',
            'parcial' => 'required|in:1,2',
            'notas' => 'required|array' 
        ]);

        DB::transaction(function () use ($request) {
            foreach ($request->notas as $nota) {
                if (!empty($nota['nivel'])) { 
                    Evaluacion::updateOrCreate(
                        [
                            'planificacion_id' => $request->planificacion_id,
                            'estudiante_id' => $nota['estudiante_id'],
                            'parcial' => $request->parcial
                        ],
                        ['nivel' => $nota['nivel']]
                    );
                }
            }
        });

        return response()->json(['message' => 'Notas guardadas correctamente']);
    }
    
}