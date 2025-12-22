<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Planificacion;
use App\Models\HabilidadBlanda;
use App\Models\Asignacion; 
use Illuminate\Support\Facades\DB;

class PlanificacionController extends Controller
{
    // Verificar habilidades y si ya existe planificación previa (EDICIÓN)
    public function verificar(Request $request, $asignatura_id)
    {
        try {
            $user = $request->user();
            $periodo = $request->query('periodo');
            $parcialSolicitado = $request->query('parcial');

            // 1. Obtener Asignación
            $queryAsignacion = Asignacion::where('asignatura_id', $asignatura_id)
                ->where('docente_id', $user->id);

            if ($periodo) {
                $queryAsignacion->where('periodo', $periodo);
            }

            $asignacion = $queryAsignacion->first();

            if (!$asignacion) {
                return response()->json([
                    'tiene_asignacion' => false, 
                    'message' => 'No tienes asignada esta materia en el periodo indicado.'
                ]);
            }

            // 2. OBTENER HABILIDADES (CORREGIDO)
            // Usamos 'with' para traer el nombre del catálogo y mapeamos para que el frontend lo entienda
            $habilidades = HabilidadBlanda::with('catalogo')
                ->where('asignatura_id', $asignatura_id)
                ->get()
                ->map(function($habilidad) {
                    return [
                        'id' => $habilidad->id, // ID de la asignación (importante para guardar)
                        // 👇 AQUÍ RESCATAMOS EL NOMBRE Y DEFINICIÓN DEL CATÁLOGO
                        'nombre' => $habilidad->catalogo ? $habilidad->catalogo->nombre : 'Sin Nombre',
                        'definicion' => $habilidad->catalogo ? $habilidad->catalogo->definicion : '',
                        'asignatura_id' => $habilidad->asignatura_id
                    ];
                });

            if ($habilidades->isEmpty()) {
                return response()->json(['tiene_asignacion' => false, 'message' => 'Sin habilidades asignadas.']);
            }

            // 3. BUSCAR PLANIFICACIÓN
            $query = Planificacion::with('detalles')
                ->where('asignatura_id', $asignatura_id)
                ->where('docente_id', $user->id)
                ->where('periodo_academico', $asignacion->periodo);

            if ($parcialSolicitado) {
                $query->where('parcial', $parcialSolicitado);
            } else {
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
                    // Guardamos las actividades seleccionadas
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

    // Guardar o Actualizar (Se mantiene igual, solo asegúrate de tener los imports correctos)
   public function store(Request $request)
    {
        $request->validate([
            'asignatura_id' => 'required',
            'docente_id' => 'required',
            'parcial' => 'required',
            'periodo_academico' => 'required',
            'detalles' => 'required|array', 
        ]);

        return DB::transaction(function () use ($request) {
            $planificacion = Planificacion::updateOrCreate(
                [
                    'asignatura_id' => $request->asignatura_id,
                    'parcial' => $request->parcial,
                    'periodo_academico' => $request->periodo_academico
                ],
                [
                    'docente_id' => $request->docente_id 
                ]
            );

            // Reiniciamos detalles para evitar duplicados
            $planificacion->detalles()->delete();

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