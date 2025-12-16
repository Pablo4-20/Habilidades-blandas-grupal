<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Asignatura;
use Illuminate\Http\Request;

class AsignaturaController extends Controller
{
    public function index() {
        return Asignatura::all();
    }

    // --- CREACIÓN MANUAL (CON CONTROL DE DUPLICADOS) ---
    public function store(Request $request) {
        $request->validate([
            'nombre' => 'required',
            'carrera' => 'required',
            'ciclo' => 'required',
            'unidad_curricular' => 'required'
        ]);

        // Verificar si ya existe
        $existe = Asignatura::where('nombre', $request->nombre)
                            ->where('carrera', $request->carrera)
                            ->exists();

        if ($existe) {
            return response()->json([
                'message' => "La asignatura '{$request->nombre}' ya existe en la carrera de {$request->carrera}."
            ], 422); // Error 422: Entidad no procesable
        }

        $asignatura = Asignatura::create($request->all());
        return response()->json($asignatura, 201);
    }

    public function update(Request $request, $id) {
        $asignatura = Asignatura::findOrFail($id);
        
        // Verificar duplicado al editar (excluyendo la propia materia)
        $existe = Asignatura::where('nombre', $request->nombre)
                            ->where('carrera', $request->carrera)
                            ->where('id', '!=', $id) // Que no sea ella misma
                            ->exists();

        if ($existe) {
            return response()->json(['message' => 'Ya existe otra asignatura con ese nombre y carrera.'], 422);
        }

        $asignatura->update($request->all());
        return response()->json($asignatura);
    }

    public function destroy($id) {
        Asignatura::destroy($id);
        return response()->json(['message' => 'Eliminado']);
    }

    // --- CARGA MASIVA INTELIGENTE (NO DUPLICA) ---
    public function import(Request $request) {
        $request->validate(['file' => 'required|file']);
        
        $file = $request->file('file');
        
        // Detectar separador
        $contenido = file_get_contents($file->getRealPath());
        $primerLinea = explode(PHP_EOL, $contenido)[0] ?? '';
        $separador = str_contains($primerLinea, ';') ? ';' : ',';

        $data = array_map(function($linea) use ($separador) {
            return str_getcsv($linea, $separador);
        }, file($file->getRealPath()));

        // Opcional: array_shift($data) si tiene encabezados

        $count = 0;
        $actualizados = 0;

        foreach ($data as $row) {
            // Estructura CSV: Nombre, Carrera, Ciclo, Unidad
            if (empty($row) || count($row) < 4) continue;

            $nombre = trim($row[0]);
            $carrera = trim($row[1]);

            // MAGIC METHOD: updateOrCreate
            // Busca por ['nombre', 'carrera']. Si existe, actualiza lo demás. Si no, crea.
            $asignatura = Asignatura::updateOrCreate(
                [
                    'nombre' => $nombre, 
                    'carrera' => $carrera
                ], 
                [
                    'ciclo' => trim($row[2]),
                    'unidad_curricular' => trim($row[3])
                ]
            );

            if ($asignatura->wasRecentlyCreated) {
                $count++;
            } else {
                $actualizados++;
            }
        }

        return response()->json([
            'message' => "Proceso terminado: $count materias nuevas creadas, $actualizados actualizadas."
        ]);
    }
}