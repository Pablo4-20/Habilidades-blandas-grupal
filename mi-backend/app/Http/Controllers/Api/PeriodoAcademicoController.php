<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PeriodoAcademico;
use Illuminate\Http\Request;
use Carbon\Carbon;

class PeriodoAcademicoController extends Controller
{
    public function index()
    {
        return PeriodoAcademico::orderBy('fecha_inicio', 'desc')->get();
    }

    public function activos()
    {
        return PeriodoAcademico::where('activo', true)
            ->orderBy('fecha_inicio', 'desc')
            ->get();
    }

    public function store(Request $request)
    {
        // 1. Validamos solo las fechas (ya no pedimos nombre)
        $request->validate([
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after:fecha_inicio',
        ]);

        // 2. Generamos el nombre automáticamente en Español
        $nombreGenerado = $this->generarNombrePeriodo($request->fecha_inicio, $request->fecha_fin);

        // 3. Guardamos
        $periodo = PeriodoAcademico::create([
            'nombre' => $nombreGenerado,
            'fecha_inicio' => $request->fecha_inicio,
            'fecha_fin' => $request->fecha_fin,
            'activo' => true
        ]);

        return response()->json([
            'message' => 'Periodo creado exitosamente',
            'data' => $periodo
        ], 201);
    }

    public function toggleEstado($id)
    {
        $periodo = PeriodoAcademico::findOrFail($id);
        $periodo->activo = !$periodo->activo;
        $periodo->save();
        return response()->json(['message' => 'Estado actualizado', 'activo' => $periodo->activo]);
    }

    public function destroy($id)
    {
        $periodo = PeriodoAcademico::findOrFail($id);
        $periodo->delete();
        return response()->json(['message' => 'Periodo eliminado']);
    }
    // ... otros métodos ...

    // NUEVO MÉTODO PARA ACTUALIZAR
    public function update(Request $request, $id)
    {
        $request->validate([
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after:fecha_inicio',
        ]);

        $periodo = PeriodoAcademico::findOrFail($id);
        
        // Regeneramos el nombre por si cambiaron las fechas
        $nombreGenerado = $this->generarNombrePeriodo($request->fecha_inicio, $request->fecha_fin);

        $periodo->update([
            'nombre' => $nombreGenerado,
            'fecha_inicio' => $request->fecha_inicio,
            'fecha_fin' => $request->fecha_fin,
        ]);

        return response()->json([
            'message' => 'Periodo actualizado correctamente',
            'data' => $periodo
        ]);
    }

    // ... helper privado ...

    // --- HELPER PRIVADO PARA TRADUCIR MESES ---
    private function generarNombrePeriodo($inicio, $fin)
    {
        $meses = [
            1 => 'Enero', 2 => 'Febrero', 3 => 'Marzo', 4 => 'Abril',
            5 => 'Mayo', 6 => 'Junio', 7 => 'Julio', 8 => 'Agosto',
            9 => 'Septiembre', 10 => 'Octubre', 11 => 'Noviembre', 12 => 'Diciembre'
        ];

        $fInicio = Carbon::parse($inicio);
        $fFin = Carbon::parse($fin);

        $mesInicio = $meses[$fInicio->month];
        $mesFin = $meses[$fFin->month];

        // Formato: "Octubre 2025 - Febrero 2026"
        return "$mesInicio " . $fInicio->year . " - $mesFin " . $fFin->year;
    }

}