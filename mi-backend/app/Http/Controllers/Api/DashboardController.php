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

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $rol = $user->rol;
        $data = [];

        if ($rol === 'admin') {
            // Totales generales
            $data = [
                'usuarios' => User::count(),
                'estudiantes' => Estudiante::count(),
                'asignaturas' => Asignatura::count(),
                'habilidades' => \App\Models\HabilidadBlanda::count(),
            ];
        } 
        elseif ($rol === 'coordinador') {
            // Progreso de la carrera
            $totalAsignaciones = Asignacion::count();
            $totalPlanificaciones = Planificacion::count(); // Cuántos profes han planificado
            // Calcular porcentaje de cumplimiento
            $cumplimiento = $totalAsignaciones > 0 ? round(($totalPlanificaciones / $totalAsignaciones) * 100) : 0;

            $data = [
                'asignaciones' => $totalAsignaciones,
                'planificaciones' => $totalPlanificaciones,
                'cumplimiento' => $cumplimiento,
                'reportes' => \App\Models\Reporte::count()
            ];
        } 
        elseif ($rol === 'docente') {
            // Mis datos personales
            $misMaterias = Asignacion::where('docente_id', $user->id)->count();
            
            // Mis planificaciones hechas
            $misPlanes = Planificacion::where('docente_id', $user->id)->count();
            
            // Total estudiantes a mi cargo (aprox)
            $misAsignacionesIDs = Asignacion::where('docente_id', $user->id)->pluck('asignatura_id');
            $carreras = Asignatura::whereIn('id', $misAsignacionesIDs)->pluck('carrera');
            $misAlumnos = Estudiante::whereIn('carrera', $carreras)->count(); // Estimado simple

            $data = [
                'mis_materias' => $misMaterias,
                'mis_planes' => $misPlanes,
                'mis_alumnos' => $misAlumnos
            ];
        }

        return response()->json($data);
    }
}