<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HabilidadBlanda;
use Illuminate\Http\Request;

class HabilidadBlandaController extends Controller
{
    public function index() {
        return HabilidadBlanda::orderBy('nombre', 'asc')->get();
    }

    public function store(Request $request) {
        $request->validate([
            'nombre' => 'required|string|unique:habilidades_blandas,nombre',
            'definicion' => 'required|string',
            'actividades' => 'nullable|string'
        ]);
        $habilidad = HabilidadBlanda::create($request->all());
        return response()->json(['message' => 'Habilidad creada', 'data' => $habilidad]);
    }

    public function update(Request $request, $id) {
        $habilidad = HabilidadBlanda::findOrFail($id);
        $request->validate([
            'nombre' => 'required|string|unique:habilidades_blandas,nombre,'.$habilidad->id,
            'definicion' => 'required|string',
            'actividades' => 'nullable|string'
        ]);
        $habilidad->update($request->all());
        return response()->json(['message' => 'Habilidad actualizada', 'data' => $habilidad]);
    }

    public function destroy($id) {
        $habilidad = HabilidadBlanda::findOrFail($id);
        $habilidad->delete();
        return response()->json(['message' => 'Habilidad eliminada']);
    }

    // --- CARGA MASIVA (CSV) ---
    public function import(Request $request) {
        $request->validate(['file' => 'required|file|mimes:csv,txt']);
        
        $file = $request->file('file');
        $data = array_map('str_getcsv', file($file->getRealPath()));
        array_shift($data); // Quitar cabecera

        $count = 0;
        foreach ($data as $row) {
            // Estructura CSV: Nombre, Definición, Actividades
            if (count($row) >= 2) {
                try {
                    HabilidadBlanda::updateOrCreate(
                        ['nombre' => $row[0]], // Si existe el nombre, actualiza
                        [
                            'definicion' => $row[1],
                            'actividades' => $row[2] ?? ''
                        ]
                    );
                    $count++;
                } catch (\Exception $e) { continue; }
            }
        }
        return response()->json(['message' => "$count habilidades procesadas correctamente."]);
    }
}