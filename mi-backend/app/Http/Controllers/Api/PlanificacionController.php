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
            
            // Recibimos el periodo desde el frontend
            $periodo = $request->query('periodo');
            $parcialSolicitado = $request->query('parcial');

            // 1. Obtener Asignación (FILTRADA POR PERIODO SI EXISTE)
            $queryAsignacion = Asignacion::where('asignatura_id', $asignatura_id)
                ->where('docente_id', $user->id);

            // CORRECCIÓN CLAVE: Si enviamos periodo, filtramos por él
            if ($periodo) {
                $queryAsignacion->where('periodo', $periodo);
            }

            $asignacion = $queryAsignacion->first();

            if (!$asignacion) {
                return response()->json([
                    'tiene_asignacion' => false, 
                    'message' => 'No tienes asignada esta materia en el periodo: ' . ($periodo ?? 'actual')
                ]);
            }

            // 2. Obtener Habilidades Requeridas
            $habilidades = HabilidadBlanda::where('asignatura_id', $asignatura_id)->get();

            if ($habilidades->isEmpty()) {
                return response()->json(['tiene_asignacion' => false, 'message' => 'Sin habilidades asignadas.']);
            }

            // 3. BUSCAR PLANIFICACIÓN
            $query = Planificacion::with('detalles')
                ->where('asignatura_id', $asignatura_id)
                ->where('docente_id', $user->id)
                ->where('periodo_academico', $asignacion->periodo); // Usamos el periodo de la asignación encontrada

            if ($parcialSolicitado) {
                $query->where('parcial', $parcialSolicitado);
            } else {
                $query->latest();
            }

            $planDocente = $query->first();

            // ... (resto del código igual) ...
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
                'habilidades' => $habilidades,
                'es_edicion' => $esEdicion,
                'actividades_guardadas' => $actividadesGuardadas,
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
            'detalles' => 'required|array', 
        ]);

        return DB::transaction(function () use ($request) {
            // 2. Guardar o Actualizar Padre (Planificación)
            // Buscamos por la clave única compuesta (asignatura + parcial + periodo)
            $planificacion = Planificacion::updateOrCreate(
                [
                    'asignatura_id' => $request->asignatura_id,
                    'parcial' => $request->parcial,
                    'periodo_academico' => $request->periodo_academico
                ],
                [
                    'docente_id' => $request->docente_id // Actualizamos el docente si fuera necesario
                ]
            );

            // 3. Actualizar Hijos (Detalles)
            // Primero eliminamos los detalles previos de esta planificación para evitar duplicados
            $planificacion->detalles()->delete();

            // Recorremos el array que envió React e insertamos los nuevos
            foreach ($request->detalles as $detalle) {
                $planificacion->detalles()->create([
                    'habilidad_blanda_id' => $detalle['habilidad_blanda_id'],
                    'actividades' => $detalle['actividades']
                ]);
            }

            return response()->json(['message' => 'Guardado exitosamente'], 200);
        });
    }
}