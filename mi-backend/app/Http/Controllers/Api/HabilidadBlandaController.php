<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HabilidadBlanda;
use App\Models\CatalogoHabilidad; 
use App\Models\Asignatura;
use Illuminate\Http\Request;

class HabilidadBlandaController extends Controller
{
    // Listar
    public function index() {
        return HabilidadBlanda::with(['asignatura', 'catalogo'])
                ->get()
                ->map(function($item) {
                    return [
                        'id' => $item->id,
                        'asignatura_id' => $item->asignatura_id,
                        'asignatura' => $item->asignatura, 
                        'nombre' => $item->catalogo ? $item->catalogo->nombre : 'Sin Nombre',
                        'definicion' => $item->catalogo ? $item->catalogo->definicion : '',
                        'actividades' => $item->actividades
                    ];
                });
    }

    // --- CARGA MASIVA EXACTA (IGNORANDO TILDES) ---
    public function import(Request $request) {
        $request->validate(['file' => 'required|file']);
        
        $file = $request->file('file');
        $contenido = file_get_contents($file->getRealPath());
        
        // 1. Detección de encoding para tildes del Excel
        if (!mb_detect_encoding($contenido, 'UTF-8', true)) {
            $contenido = mb_convert_encoding($contenido, 'UTF-8', 'ISO-8859-1');
        }

        $primerLinea = explode(PHP_EOL, $contenido)[0] ?? '';
        $separador = str_contains($primerLinea, ';') ? ';' : ',';

        $lineas = explode(PHP_EOL, $contenido);
        $data = array_map(function($l) use ($separador) {
            return str_getcsv($l, $separador);
        }, $lineas);

        array_shift($data); // Quitar encabezados

        // 2. CARGAMOS TODAS LAS MATERIAS PARA BUSCAR EN MEMORIA
        // Esto permite comparar "limpiando" tildes fácilmente sin depender de la base de datos
        $asignaturasDB = Asignatura::all(); 

        $count = 0;
        $errores = [];

        foreach ($data as $index => $row) {
            if (empty($row) || count($row) < 2 || empty(trim($row[0]))) continue;
            
            $nombreExcel = trim($row[0]);
            $nombreExcelLimpio = $this->limpiarCadena($nombreExcel); // Ej: "calculo i"
            
            // 3. BÚSQUEDA EXACTA PERO SIN TILDES
            // Buscamos en la colección la materia que coincida exactamente letra por letra (sin tildes)
            $asignatura = $asignaturasDB->first(function($asig) use ($nombreExcelLimpio) {
                return $this->limpiarCadena($asig->nombre) === $nombreExcelLimpio;
            });

            if (!$asignatura) {
                $errores[] = "Fila " . ($index + 2) . ": No existe la materia '$nombreExcel'.";
                continue;
            }

            // Datos de la habilidad
            $nombreHabilidad = $this->formatearTexto(trim($row[1]));
            $definicionCSV = isset($row[2]) ? trim($row[2]) : null;

            try {
                // 4. Catálogo y Asignación
                $catalogoItem = CatalogoHabilidad::firstOrCreate(
                    ['nombre' => $nombreHabilidad],
                    ['definicion' => $definicionCSV ?: 'Definición pendiente.']
                );
                
                if ($definicionCSV && $catalogoItem->definicion !== $definicionCSV) {
                    $catalogoItem->update(['definicion' => $definicionCSV]);
                }

                HabilidadBlanda::updateOrCreate(
                    [
                        'asignatura_id' => $asignatura->id,
                        'catalogo_habilidad_id' => $catalogoItem->id
                    ], 
                    [ 'actividades' => null ]
                );
                
                $count++;

            } catch (\Exception $e) { 
                $errores[] = "Fila " . ($index + 2) . ": Error interno con '$nombreHabilidad'."; 
            }
        }

        // 5. RESPUESTA
        $mensaje = "Se procesaron $count asignaciones correctamente.";
        
        if (count($errores) > 0) {
            $reporte = implode("\n", array_slice($errores, 0, 10));
            if(count($errores) > 10) $reporte .= "\n... y " . (count($errores) - 10) . " errores más.";

            return response()->json([
                'message' => $mensaje,
                'warning' => "ATENCIÓN: Algunas filas no se cargaron:\n" . $reporte
            ]);
        }

        return response()->json(['message' => $mensaje]);
    }

    public function store(Request $request) {
        $request->validate([
            'asignatura_id' => 'required|exists:asignaturas,id',
            'habilidades' => 'present|array', 
        ]);

        $idsCatalogoSeleccionados = [];

        foreach ($request->habilidades as $hab) {
            $nombreLimpio = $this->formatearTexto($hab['nombre']);
            
            $item = CatalogoHabilidad::firstOrCreate(
                ['nombre' => $nombreLimpio],
                ['definicion' => $hab['definicion'] ?? 'Definición pendiente.']
            );
            
            if (!empty($hab['definicion']) && $item->definicion !== $hab['definicion']) {
                $item->update(['definicion' => $hab['definicion']]);
            }

            HabilidadBlanda::firstOrCreate([
                'asignatura_id' => $request->asignatura_id,
                'catalogo_habilidad_id' => $item->id
            ]);
            
            $idsCatalogoSeleccionados[] = $item->id;
        }

        HabilidadBlanda::where('asignatura_id', $request->asignatura_id)
            ->whereNotIn('catalogo_habilidad_id', $idsCatalogoSeleccionados)
            ->delete();

        return response()->json(['message' => "Habilidades sincronizadas correctamente."]);
    }
    
    public function destroy($id) {
        $habilidad = HabilidadBlanda::findOrFail($id);
        $habilidad->delete();
        return response()->json(['message' => 'Eliminado']);
    }

    private function formatearTexto($texto) {
        $texto = mb_convert_case($texto, MB_CASE_TITLE, "UTF-8");
        $romanos = ['Ii' => 'II', 'Iii' => 'III', 'Iv' => 'IV', 'Vi' => 'VI', 'Vii' => 'VII', 'Viii' => 'VIII', 'Ix' => 'IX', 'Xi' => 'XI', 'Xii' => 'XII', 'Xiii' => 'XIII', 'Xiv' => 'XIV', 'Xv' => 'XV'];
        foreach ($romanos as $incorrecto => $correcto) {
            $texto = preg_replace("/\b$incorrecto\b/u", $correcto, $texto);
        }
        return $texto;
    }

    // 👇 FUNCIÓN CLAVE: Quita tildes y pone minúsculas para comparar
    private function limpiarCadena($cadena) {
        $cadena = mb_strtolower($cadena, 'UTF-8');
        $buscar = ['á', 'é', 'í', 'ó', 'ú', 'ñ'];
        $reemplazar = ['a', 'e', 'i', 'o', 'u', 'n'];
        return str_replace($buscar, $reemplazar, $cadena);
    }
}