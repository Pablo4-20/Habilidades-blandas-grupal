<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
// --- IMPORTACIONES OBLIGATORIAS ---
use App\Models\Planificacion;
use App\Models\HabilidadBlanda;
use App\Models\Asignacion; 
use App\Models\DetallePlanificacion; 
use Illuminate\Support\Facades\DB;

class PlanificacionController extends Controller
{
    // Verificar habilidades y si ya existe planificación previa (EDICIÓN)
public function verificar(Request $request, $asignatura_id)
    {
        try {
            $user = $request->user();
            
            // 1. Obtener Asignación y Periodo
            $asignacion = Asignacion::where('asignatura_id', $asignatura_id)
                ->where('docente_id', $user->id)
                ->first();

            if (!$asignacion) {
                return response()->json(['tiene_asignacion' => false, 'message' => 'No tienes asignada esta materia.']);
            }

            // 2. Obtener Habilidades Requeridas
            $habilidades = HabilidadBlanda::where('asignatura_id', $asignatura_id)->get();

            if ($habilidades->isEmpty()) {
                return response()->json(['tiene_asignacion' => false, 'message' => 'Sin habilidades asignadas.']);
            }

            // 3. BUSCAR PLANIFICACIÓN ESPECÍFICA (Materia + Docente + Periodo + PARCIAL)
            
            // Capturamos el parcial que viene en la URL (?parcial=1)
            $parcialSolicitado = $request->query('parcial'); 

            $query = Planificacion::with('detalles')
                ->where('asignatura_id', $asignatura_id)
                ->where('docente_id', $user->id)
                ->where('periodo_academico', $asignacion->periodo);

            // Si el frontend nos dice qué parcial quiere ver, filtramos por él.
            if ($parcialSolicitado) {
                $query->where('parcial', $parcialSolicitado);
            } else {
                // Si no, traemos el último modificado (comportamiento por defecto)
                $query->latest();
            }

            $planDocente = $query->first();

            $actividadesGuardadas = [];
            $esEdicion = false;
            $parcialGuardado = null;

            if ($planDocente) {
                $esEdicion = true;
                $parcialGuardado = $planDocente->parcial;
                foreach ($planDocente->detalles as $detalle) {
                    $actividadesGuardadas[$detalle->habilidad_blanda_id] = explode("\n", $detalle->actividades);
                }
            }

            return response()->json([
                'tiene_asignacion' => true,
                'habilidades' => $habilidades, // Siempre devolvemos las habilidades base
                'es_edicion' => $esEdicion,
                'actividades_guardadas' => $actividadesGuardadas, // Solo si existen para este parcial
                'parcial_guardado' => $parcialGuardado,
                'periodo_detectado' => $asignacion->periodo
            ]);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }
    // Guardar o Actualizar la planificación
   public function store(Request $request)
    {
        // 1. Validación
        $request->validate([
            'asignatura_id' => 'required',
            'docente_id' => 'required',
            'parcial' => 'required',
            'periodo_academico' => 'required',
            'detalles' => 'required|array', // React envía un array 'detalles'
        ]);

        return DB::transaction(function () use ($request) {
            // 2. Guardar Padre (Planificación)
            $planificacion = Planificacion::create([
                'asignatura_id' => $request->asignatura_id,
                'docente_id' => $request->docente_id,
                'parcial' => $request->parcial,
                'periodo_academico' => $request->periodo_academico
            ]);

            // 3. Guardar Hijos (Detalles)
            // Recorremos el array que envió React
            foreach ($request->detalles as $detalle) {
                $planificacion->detalles()->create([
                    'habilidad_blanda_id' => $detalle['habilidad_blanda_id'],
                    'actividades' => $detalle['actividades']
                ]);
            }

            return response()->json(['message' => 'Guardado exitosamente'], 201);
        });
    }
}