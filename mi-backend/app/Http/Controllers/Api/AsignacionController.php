<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
// --- IMPORTACIONES OBLIGATORIAS ---
use App\Models\Asignacion;
use App\Models\User;        // <--- SI FALTA ESTO, NO CARGAN DOCENTES
use App\Models\Asignatura;  // <--- SI FALTA ESTO, NO CARGAN MATERIAS

class AsignacionController extends Controller
{
    // 1. Listar asignaciones
    public function index()
    {
        return Asignacion::with(['docente', 'asignatura'])
            ->orderBy('id', 'desc')
            ->get();
    }

    // 2. Datos para los selectores
    public function datosAuxiliares()
    {
        // Traemos usuarios que sean 'docente' y todas las asignaturas
        $docentes = User::where('rol', 'docente')->get();
        $asignaturas = Asignatura::all();

        return response()->json([
            'docentes' => $docentes,
            'asignaturas' => $asignaturas
        ]);
    }

    // 3. Guardar asignación
    public function store(Request $request)
    {
        $request->validate([
            'docente_id' => 'required|exists:users,id',
            'asignatura_id' => 'required|exists:asignaturas,id',
            'periodo' => 'required|string',
            'paralelo' => 'required|string|max:2'
        ]);

        // VALIDACIÓN CORREGIDA:
        // Verificamos si ESTA materia en ESTE paralelo ya tiene dueño (sin importar quién sea)
        $asignacionExistente = Asignacion::with('docente') // Traemos al docente para mostrar quién la tiene
            ->where('asignatura_id', $request->asignatura_id)
            ->where('periodo', $request->periodo)
            ->where('paralelo', $request->paralelo)
            ->first();

        if ($asignacionExistente) {
            // Si ya existe, avisamos quién la tiene asignada
            $nombreProfe = $asignacionExistente->docente->name;
            return response()->json([
                'message' => "Esta materia ya está asignada al docente: $nombreProfe"
            ], 422); // Código 422 para error de validación
        }

        $asignacion = Asignacion::create($request->all());
        return response()->json(['message' => 'Carga asignada correctamente', 'data' => $asignacion]);
    }

    // 4. Eliminar
    public function destroy($id)
    {
        Asignacion::destroy($id);
        return response()->json(['message' => 'Asignación eliminada']);
    }
}