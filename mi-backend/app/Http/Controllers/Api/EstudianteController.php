<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Estudiante;
use Illuminate\Http\Request;

class EstudianteController extends Controller
{
    // Listar estudiantes
    public function index()
    {
        return Estudiante::orderBy('id', 'desc')->get();
    }

    // Crear estudiante manual
    public function store(Request $request)
    {
        $request->validate([
            'nombres' => 'required|string',
            'apellidos' => 'required|string',
            'email' => 'required|email|unique:estudiantes,email',
            'carrera' => 'required|string',
            'ciclo_actual' => 'required|string',
        ]);

        $estudiante = Estudiante::create($request->all());

        return response()->json(['message' => 'Estudiante creado', 'data' => $estudiante]);
    }

    // Eliminar estudiante
    public function destroy($id)
    {
        $estudiante = Estudiante::findOrFail($id);
        $estudiante->delete();
        return response()->json(['message' => 'Estudiante eliminado']);
    }
    // Importación Masiva de Estudiantes (CSV)
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt'
        ]);

        $file = $request->file('file');
        $data = array_map('str_getcsv', file($file->getRealPath()));
        $header = array_shift($data); // Quitar cabecera

        $count = 0;
        foreach ($data as $row) {
            // Estructura CSV: Nombres, Apellidos, Email, Carrera, Ciclo
            if (count($row) >= 5) {
                try {
                    Estudiante::create([
                        'nombres'      => $row[0],
                        'apellidos'    => $row[1],
                        'email'        => $row[2],
                        'carrera'      => $row[3],
                        'ciclo_actual' => $row[4],
                    ]);
                    $count++;
                } catch (\Exception $e) {
                    continue;
                }
            }
        }

        return response()->json(['message' => "$count estudiantes importados correctamente."]);
    }
    // En EstudianteController.php

public function update(Request $request, $id)
{
    // 1. Buscar el estudiante
    $estudiante = Estudiante::findOrFail($id);

    // 2. Validar
    $request->validate([
        'nombres' => 'required|string|max:255',
        'apellidos' => 'required|string|max:255',
        
        // --- AQUÍ ESTÁ EL TRUCO ---
        // Le decimos: "El email debe ser único en la tabla estudiantes, 
        // PERO ignora el registro con este $estudiante->id"
        'email' => 'required|email|unique:estudiantes,email,' . $estudiante->id,
        
        'carrera' => 'required|string',
        'ciclo_actual' => 'required|string',
    ]);

    // 3. Actualizar
    $estudiante->update($request->all());

    return response()->json([
        'message' => 'Estudiante actualizado correctamente',
        'data' => $estudiante
    ]);
}
}