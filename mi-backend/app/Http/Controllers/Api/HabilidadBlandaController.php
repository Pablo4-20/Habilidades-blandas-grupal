<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HabilidadBlanda;
use App\Models\Asignatura;
use Illuminate\Http\Request;

class HabilidadBlandaController extends Controller
{
    public function index() {
        return HabilidadBlanda::with('asignatura')->orderBy('nombre', 'asc')->get();
    }

    // --- STORE INTELIGENTE (Sincronización) ---
    public function store(Request $request) {
        $request->validate([
            'asignatura_id' => 'required|exists:asignaturas,id',
            'habilidades' => 'present|array', // 'present' permite enviar array vacío para borrar todo
        ]);

        // 1. OBTENER LOS NOMBRES QUE SE QUIEREN MANTENER
        // Extraemos solo los nombres de las habilidades que vienen del frontend
        $nombresA_Mantener = array_column($request->habilidades, 'nombre');

        // 2. ELIMINAR LAS QUE NO ESTÁN EN LA LISTA
        // Buscamos en esta asignatura las habilidades cuyo nombre NO esté en la lista nueva y las borramos.
        HabilidadBlanda::where('asignatura_id', $request->asignatura_id)
            ->whereNotIn('nombre', $nombresA_Mantener)
            ->delete();

        // 3. CREAR O ACTUALIZAR LAS SELECCIONADAS
        $count = 0;
        foreach ($request->habilidades as $hab) {
            HabilidadBlanda::updateOrCreate(
                [
                    'asignatura_id' => $request->asignatura_id,
                    'nombre' => $hab['nombre']
                ],
                [
                    'definicion' => $hab['definicion'],
                    // Si ya existe y tiene actividades, no las borramos (opcional), 
                    // o forzamos null si quieres reiniciar para el docente.
                    // Aquí las mantenemos si ya existían para no perder trabajo del docente.
                ]
            );
            $count++;
        }

        return response()->json(['message' => "Habilidades sincronizadas correctamente."]);
    }

    // El método update individual ya no es necesario para la edición en grupo,
    // pero lo dejamos por si acaso.
    public function update(Request $request, $id) {
        $habilidad = HabilidadBlanda::findOrFail($id);
        $habilidad->update($request->all());
        return response()->json(['message' => 'Actualizado']);
    }

    public function destroy($id) {
        $habilidad = HabilidadBlanda::findOrFail($id);
        $habilidad->delete();
        return response()->json(['message' => 'Eliminado']);
    }

  // --- CARGA MASIVA OPTIMIZADA ---
    public function import(Request $request) {
        $request->validate(['file' => 'required|file']);
        
        $file = $request->file('file');
        
        // Detectar separador (; o ,) automáticamente
        $contenido = file_get_contents($file->getRealPath());
        $primerLinea = explode(PHP_EOL, $contenido)[0] ?? '';
        $separador = str_contains($primerLinea, ';') ? ';' : ',';

        $data = array_map(function($linea) use ($separador) {
            return str_getcsv($linea, $separador);
        }, file($file->getRealPath()));

        // Opcional: Si la primera fila son encabezados (ej: "Asignatura", "Nombre"...), descomenta esto:
        // array_shift($data); 

        $count = 0;
        $errores = 0;

        foreach ($data as $row) {
            // Validar fila mínima (Asignatura, Nombre)
            if (empty($row) || count($row) < 2) continue;
            
            $nombreAsignatura = trim($row[0]);
            $nombreHabilidad = trim($row[1]);
            $definicion = isset($row[2]) ? trim($row[2]) : 'Definición pendiente.'; // Definición opcional en CSV

            // Buscar ID de la asignatura (Búsqueda flexible)
            $asignatura = Asignatura::where('nombre', 'LIKE', "%$nombreAsignatura%")->first();
            
            if ($asignatura && $nombreHabilidad) {
                try {
                    HabilidadBlanda::updateOrCreate(
                        [
                            'asignatura_id' => $asignatura->id,
                            'nombre' => $nombreHabilidad
                        ], 
                        [
                            'definicion' => $definicion,
                            'actividades' => null // <--- IMPORTANTE: Se deja vacío para el docente
                        ]
                    );
                    $count++;
                } catch (\Exception $e) { 
                    $errores++; 
                }
            } else {
                $errores++; // No encontró la materia o nombre vacío
            }
        }

        return response()->json([
            'message' => "Proceso finalizado: $count habilidades importadas/actualizadas. $errores omitidas."
        ]);
    }
}