<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Asignatura;
use Illuminate\Http\Request;

class AsignaturaController extends Controller
{
    public function index() {
        return Asignatura::orderBy('carrera')->orderBy('ciclo')->get();
    }

    public function store(Request $request) {
        $request->validate([
            'nombre' => 'required|string',
            'carrera' => 'required|string',
            'ciclo' => 'required|string',
            'unidad_curricular' => 'required|string'
        ]);
        $asignatura = Asignatura::create($request->all());
        return response()->json(['message' => 'Asignatura creada', 'data' => $asignatura]);
    }

    public function update(Request $request, $id) {
        $asignatura = Asignatura::findOrFail($id);
        $asignatura->update($request->all());
        return response()->json(['message' => 'Asignatura actualizada']);
    }

    public function destroy($id) {
        $asignatura = Asignatura::findOrFail($id);
        $asignatura->delete();
        return response()->json(['message' => 'Asignatura eliminada']);
    }

    // --- CARGA MASIVA (CSV) ---
    public function import(Request $request) {
        $request->validate(['file' => 'required|file|mimes:csv,txt']);
        $file = $request->file('file');
        $data = array_map('str_getcsv', file($file->getRealPath()));
        array_shift($data); // Quitar cabecera

        $count = 0;
        foreach ($data as $row) {
            // CSV: Nombre, Carrera, Ciclo, Unidad
            if (count($row) >= 4) {
                try {
                    Asignatura::updateOrCreate(
                        ['nombre' => $row[0], 'carrera' => $row[1]], // Evita duplicados por nombre+carrera
                        [
                            'ciclo' => $row[2],
                            'unidad_curricular' => $row[3]
                        ]
                    );
                    $count++;
                } catch (\Exception $e) { continue; }
            }
        }
        return response()->json(['message' => "$count asignaturas importadas."]);
    }
}