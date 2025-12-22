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

        // 👇 1. Formateamos el nombre antes de cualquier búsqueda o guardado
        $nombreFormateado = $this->formatearTexto($request->nombre);

        // Verificar si ya existe (usando el nombre ya formateado)
        $existe = Asignatura::where('nombre', $nombreFormateado)
                            ->where('carrera', $request->carrera)
                            ->exists();

        if ($existe) {
            return response()->json([
                'message' => "La asignatura '{$nombreFormateado}' ya existe en la carrera de {$request->carrera}."
            ], 422); 
        }

        // Preparamos los datos con el nombre corregido
        $data = $request->all();
        $data['nombre'] = $nombreFormateado;

        $asignatura = Asignatura::create($data);
        return response()->json($asignatura, 201);
    }

    public function update(Request $request, $id) {
        $asignatura = Asignatura::findOrFail($id);
        
        // 👇 2. Formateamos al editar
        $nombreFormateado = $this->formatearTexto($request->nombre);

        // Verificar duplicado al editar
        $existe = Asignatura::where('nombre', $nombreFormateado)
                            ->where('carrera', $request->carrera)
                            ->where('id', '!=', $id) 
                            ->exists();

        if ($existe) {
            return response()->json(['message' => 'Ya existe otra asignatura con ese nombre y carrera.'], 422);
        }

        // Actualizamos con el nombre corregido
        $data = $request->all();
        $data['nombre'] = $nombreFormateado;

        $asignatura->update($data);
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
        
        $contenido = file_get_contents($file->getRealPath());
        $primerLinea = explode(PHP_EOL, $contenido)[0] ?? '';
        $separador = str_contains($primerLinea, ';') ? ';' : ',';

        $data = array_map(function($linea) use ($separador) {
            return str_getcsv($linea, $separador);
        }, file($file->getRealPath()));

        array_shift($data); // Eliminamos encabezados

        $count = 0;
        $actualizados = 0;

        foreach ($data as $row) {
            if (empty($row) || count($row) < 4) continue;

            // 👇 3. Formateamos el nombre desde el CSV
            $nombre = $this->formatearTexto(trim($row[0]));
            $carrera = trim($row[1]);

            // MAGIC METHOD: updateOrCreate
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

    // 👇👇 FUNCIÓN PRIVADA PARA FORMATO TÍTULO Y ROMANOS 👇👇
    private function formatearTexto($texto)
    {
        // 1. Convertir a Título (Primera mayúscula)
        $texto = mb_convert_case($texto, MB_CASE_TITLE, "UTF-8");

        // 2. Corregir Números Romanos comunes en materias
        $romanos = [
            'Ii'   => 'II',
            'Iii'  => 'III',
            'Iv'   => 'IV',
            'Vi'   => 'VI',
            'Vii'  => 'VII',
            'Viii' => 'VIII',
            'Ix'   => 'IX',
            'Xi'   => 'XI',
            'Xii'  => 'XII',
            'Xiii' => 'XIII',
            'Xiv'  => 'XIV',
            'Xv'   => 'XV',
            'Xx'   => 'XX',
            'Xxi'  => 'XXI'
        ];

        foreach ($romanos as $incorrecto => $correcto) {
            // Reemplazar solo palabras exactas (\b)
            $texto = preg_replace("/\b$incorrecto\b/u", $correcto, $texto);
        }

        return $texto;
    }
}