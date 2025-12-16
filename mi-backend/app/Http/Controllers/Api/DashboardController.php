<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Estudiante;
use App\Models\Asignatura;
use App\Models\Asignacion;
use App\Models\Planificacion;
use App\Models\Evaluacion;
use App\Models\HabilidadBlanda; // Agregué el use explícito para limpieza
use App\Models\Reporte;         // Agregué el use explícito para limpieza

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $rol = $user->rol;
        $data = [];

        if ($rol === 'admin') {
            $data = [
                'usuarios' => User::count(),
                'estudiantes' => Estudiante::count(),
                'asignaturas' => Asignatura::count(),
                'habilidades' => HabilidadBlanda::count(),
            ];
        } 
        elseif ($rol === 'coordinador') {
            // Progreso de la carrera
            $totalAsignaciones = Asignacion::count();
            
            // --- CORRECCIÓN AQUÍ ---
            // En lugar de contar todas las filas (que duplica por parciales),
            // contamos cuántas asignaturas ÚNICAS tienen al menos una planificación.
            $materiasPlanificadas = Planificacion::distinct('asignatura_id')->count('asignatura_id');

            // Calcular porcentaje (Máximo será 100%)
            $cumplimiento = $totalAsignaciones > 0 ? round(($materiasPlanificadas / $totalAsignaciones) * 100) : 0;
            
            // Seguro extra por si acaso la BD tiene datos sucios antiguos
            if ($cumplimiento > 100) $cumplimiento = 100;

            $data = [
                'asignaciones' => $totalAsignaciones,
                'planificaciones' => $materiasPlanificadas, // Mostramos materias cubiertas, no filas totales
                'cumplimiento' => $cumplimiento,
                'reportes' => Reporte::count()
            ];
        } 
        elseif ($rol === 'docente') {
            // Mis datos personales
            $misMaterias = Asignacion::where('docente_id', $user->id)->count();
            
            // Aquí también podrías aplicar distinct si quieres que cuente materias y no parciales
            $misPlanes = Planificacion::where('docente_id', $user->id)
                            ->distinct('asignatura_id')
                            ->count('asignatura_id');
            
            // Total estudiantes a mi cargo (aprox)
            $misAsignacionesIDs = Asignacion::where('docente_id', $user->id)->pluck('asignatura_id');
            $carreras = Asignatura::whereIn('id', $misAsignacionesIDs)->pluck('carrera');
            $misAlumnos = Estudiante::whereIn('carrera', $carreras)->count(); 

            $data = [
                'mis_materias' => $misMaterias,
                'mis_planes' => $misPlanes,
                'mis_alumnos' => $misAlumnos
            ];
        }

        return response()->json($data);
    }
}