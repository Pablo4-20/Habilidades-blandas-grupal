<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Evaluacion;
use App\Models\Reporte; // Asegúrate de tener este modelo (lo creamos al inicio)
use App\Models\Planificacion;
use Illuminate\Support\Facades\DB;

class ReporteController extends Controller
{
    // Generar estadísticas (Soporta Parcial 1, 2 o Ambos)
    public function generar(Request $request)
    {
        $request->validate([
            'planificacion_id' => 'required|exists:planificaciones,id',
            'parcial' => 'required' // Puede ser '1', '2' o 'final'
        ]);

        // Iniciar consulta base
        $query = Evaluacion::select('nivel', DB::raw('count(*) as total'))
            ->where('planificacion_id', $request->planificacion_id);

        // Si NO es reporte final, filtramos por el parcial específico
        if ($request->parcial !== 'final') {
            $query->where('parcial', $request->parcial);
        }

        // Ejecutar consulta agrupada
        $estadisticas = $query->groupBy('nivel')
            ->pluck('total', 'nivel');

        // Formatear (Rellenar con 0 si no hay nadie en ese nivel)
        $datos = [
            1 => $estadisticas[1] ?? 0,
            2 => $estadisticas[2] ?? 0,
            3 => $estadisticas[3] ?? 0,
            4 => $estadisticas[4] ?? 0,
            5 => $estadisticas[5] ?? 0,
        ];

        // Buscar conclusión guardada (solo hay una por planificación)
        $reporte = Reporte::where('planificacion_id', $request->planificacion_id)->first();

        return response()->json([
            'estadisticas' => $datos,
            'conclusion' => $reporte ? $reporte->conclusion_progreso : '',
            'total_evaluados' => array_sum($datos)
        ]);
    }

    // Guardar la conclusión del docente
    public function guardar(Request $request)
    {
        $request->validate([
            'planificacion_id' => 'required|exists:planificaciones,id',
            'conclusion' => 'required|string|max:1000'
        ]);

        Reporte::updateOrCreate(
            ['planificacion_id' => $request->planificacion_id],
            [
                'conclusion_progreso' => $request->conclusion,
                'fecha_generacion' => now()
            ]
        );

        return response()->json(['message' => 'Reporte guardado correctamente.']);
    }
    // Obtener TODA la info para el PDF (Resumen + Listas detalladas)
    public function datosParaPdf(Request $request)
    {
        $request->validate(['asignatura_id' => 'required']);
        $user = $request->user();

        // 1. Buscar TODAS las planificaciones
        $planes = Planificacion::with(['asignatura', 'docente', 'habilidad'])
            ->where('asignatura_id', $request->asignatura_id)
            ->where('docente_id', $user->id)
            ->get();

        if ($planes->isEmpty()) {
            return response()->json(['message' => 'No hay habilidades planificadas'], 404);
        }

        $infoGeneral = [
            'facultad' => 'CIENCIAS ADMINISTRATIVAS, GESTIÓN EMPRESARIAL E INFORMÁTICA',
            'carrera' => $planes[0]->asignatura->carrera,
            'docente' => $planes[0]->docente->name,
            'asignatura' => $planes[0]->asignatura->nombre,
            'ciclo' => $planes[0]->asignatura->ciclo,
            'periodo' => $planes[0]->periodo_academico,
        ];

        $reportes = [];

        foreach ($planes as $plan) {
            // Estudiantes
            $estudiantes = \App\Models\Estudiante::where('carrera', $plan->asignatura->carrera)
                ->where('ciclo_actual', $plan->asignatura->ciclo)
                ->orderBy('apellidos')
                ->get();

            // Notas P1 y P2
            $notasP1 = Evaluacion::where('planificacion_id', $plan->id)->where('parcial', '1')->get()->keyBy('estudiante_id');
            $notasP2 = Evaluacion::where('planificacion_id', $plan->id)->where('parcial', '2')->get()->keyBy('estudiante_id');

            // Listas visuales con X
            $listaP1 = $this->formatearLista($estudiantes, $notasP1);
            $listaP2 = $this->formatearLista($estudiantes, $notasP2);

            // --- CORRECCIÓN AQUÍ ---
            // Determinar qué notas sumar para la gráfica según el parcial asignado a la habilidad
            $notasParaEstadistica = ($plan->parcial === '1') ? $notasP1 : $notasP2;

            $conteos = [1=>0, 2=>0, 3=>0, 4=>0, 5=>0];
            foreach ($notasParaEstadistica as $nota) { 
                if ($nota->nivel) $conteos[$nota->nivel]++; 
            }
            // -----------------------

            $reporteDB = Reporte::where('planificacion_id', $plan->id)->first();

            $reportes[] = [
                'planificacion_id' => $plan->id,
                'habilidad' => $plan->habilidad->nombre,
                'parcial_asignado' => $plan->parcial,
                'estadisticas' => $conteos, // Ahora sí enviamos el conteo correcto
                'detalle_p1' => $listaP1,
                'detalle_p2' => $listaP2,
                'conclusion' => $reporteDB ? $reporteDB->conclusion_progreso : ''
            ];
        }

        return response()->json([
            'info' => $infoGeneral,
            'reportes' => $reportes
        ]);
    }

    // Función auxiliar para no repetir código
    private function formatearLista($estudiantes, $notas) {
        return $estudiantes->map(function($est) use ($notas) {
            $nivel = $notas[$est->id]->nivel ?? null;
            return [
                'nombre' => $est->apellidos . ' ' . $est->nombres,
                'n1' => $nivel == 1 ? 'X' : '',
                'n2' => $nivel == 2 ? 'X' : '',
                'n3' => $nivel == 3 ? 'X' : '',
                'n4' => $nivel == 4 ? 'X' : '',
                'n5' => $nivel == 5 ? 'X' : '',
            ];
        });
    }
    // Reporte General para el Coordinador
    public function reporteGeneral(Request $request)
    {
        // Filtro opcional por carrera
        $carrera = $request->query('carrera');

        // 1. Traer todas las asignaciones (Materia + Docente)
        $query = \App\Models\Asignacion::with(['asignatura', 'docente']);

        if ($carrera && $carrera !== 'Todas') {
            $query->whereHas('asignatura', function($q) use ($carrera) {
                $q->where('carrera', $carrera);
            });
        }

        $asignaciones = $query->get();

        // 2. Procesar datos para el reporte
        $reporte = $asignaciones->map(function($asig) {
            // Buscar si hay planificación para esta asignación
            // (Buscamos por docente y asignatura)
            $plan = Planificacion::with('habilidad')
                ->where('docente_id', $asig->docente_id)
                ->where('asignatura_id', $asig->asignatura_id)
                ->latest() // Si hay varias (p1, p2), tomamos la última para ver estado general
                ->first();

            $estado = 'Sin Planificar';
            $progreso = 0;
            $habilidad = '---';

            if ($plan) {
                $habilidad = $plan->habilidad->nombre;
                $estado = 'Planificado';

                // Contar estudiantes de esa materia
                $totalEstudiantes = \App\Models\Estudiante::where('carrera', $asig->asignatura->carrera)
                    ->where('ciclo_actual', $asig->asignatura->ciclo)
                    ->count();

                // Contar evaluaciones reales
                $evaluados = Evaluacion::where('planificacion_id', $plan->id)->count();

                if ($totalEstudiantes > 0 && $evaluados > 0) {
                    $progreso = round(($evaluados / $totalEstudiantes) * 100);
                    $estado = ($progreso >= 100) ? 'Completado' : 'En Proceso';
                }
            }

            return [
                'id' => $asig->id,
                'carrera' => $asig->asignatura->carrera,
                'ciclo' => $asig->asignatura->ciclo,
                'asignatura' => $asig->asignatura->nombre,
                'docente' => $asig->docente->name,
                'habilidad' => $habilidad,
                'estado' => $estado,
                'progreso' => $progreso
            ];
        });

        return response()->json($reporte);
    }
}