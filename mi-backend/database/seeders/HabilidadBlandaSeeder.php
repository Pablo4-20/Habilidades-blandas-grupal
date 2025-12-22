<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Asignatura;
use App\Models\HabilidadBlanda;
use App\Models\CatalogoHabilidad;

class HabilidadBlandaSeeder extends Seeder
{
    public function run(): void
    {
        // 1. DICCIONARIO DE ACTIVIDADES
        // Nota: Las claves aquí deben coincidir con cómo se escriben abajo en el mapa
        $actividades = [
            'Adaptabilidad' => "Aprendizaje basado en problemas.\nSimulación de escenarios cambiantes.\nProyectos interdisciplinarios.",
            'Aprender a Aprender' => "Problemas abiertos con recursos limitados.\nPromover la experimentación y el manejo del error.\nAutoevaluación constante.",
            'Asertividad' => "Debates y discusiones guiadas.\nSesiones de preguntas y respuestas activas.\nAnálisis de casos.",
            'Creatividad' => "Proyectos de innovación.\nLluvias de ideas.\nPresentaciones orales de proyectos.",
            'Pensamiento Crítico' => "Análisis de casos.\nDebates estructurados.\nEnsayos reflexivos.\nSimulación de tomas de decisiones.",
            'Liderazgo' => "Rúbricas de evaluación de liderazgo.\nActividades colaborativas.\nAutoevaluación y metacognición.",
            'Toma de Decisiones' => "Simulación y estudios de caso.\nProblemas abiertos y desestructurados.\nAnálisis de riesgos.",
            'Autocontrol' => "Manejo de presión en entregas.\nResolución de conflictos simulados.",
            'Trabajo en Equipo' => "Proyectos colaborativos.\nEvaluación entre pares.\nAnálisis de productos grupales.",
            'Comunicación Efectiva' => "Debates y mesas redondas.\nPresentaciones orales.\nAnálisis de discursos.",
            'Resolución de Problemas' => "Estudio de casos reales.\nDepuración de código ajeno.\nHackathons internos.",
            'Gestión del Tiempo' => "Uso de herramientas de planificación.\nEntregas por hitos.\nGestión de cronogramas."
        ];

        // 2. MAPA CURRICULAR
        $mapa = [
            // --- SOFTWARE ---
            ['Software', 'Calculo II', 'Aprender a Aprender'],
        ];

        foreach ($mapa as $item) {
            $carrera = $item[0];
            $materiaNombre = $item[1];
            // Aquí obtenemos el nombre original del array
            $habilidadOriginal = $item[2];

            // 👇 APLICAMOS EL MISMO FORMATO QUE EL CONTROLADOR
            // Esto convertirá "Aprender a Aprender" -> "Aprender A Aprender"
            $habilidadFormateada = $this->formatearTexto($habilidadOriginal);

            $asignatura = Asignatura::where('nombre', $materiaNombre)
                                    ->where('carrera', $carrera)
                                    ->first();

            if ($asignatura) {
                // Buscamos/Creamos con el nombre formateado
                $catalogo = CatalogoHabilidad::firstOrCreate(
                    ['nombre' => $habilidadFormateada], 
                    ['definicion' => 'Competencia definida en la Guía 2025-2028.'] 
                );

                // Buscamos la actividad usando la clave original del array $actividades
                $actividadTexto = $actividades[$habilidadOriginal] ?? 'Actividad a definir.';

                HabilidadBlanda::updateOrCreate(
                    [
                        'asignatura_id' => $asignatura->id,
                        'catalogo_habilidad_id' => $catalogo->id 
                    ],
                    [
                        'actividades' => $actividadTexto
                    ]
                );
            }
        }
    }

    // 👇 FUNCIÓN AUXILIAR IDÉNTICA AL CONTROLADOR
    private function formatearTexto($texto) {
        $texto = mb_convert_case($texto, MB_CASE_TITLE, "UTF-8");
        
        $romanos = [
            'Ii' => 'II', 'Iii' => 'III', 'Iv' => 'IV', 'Vi' => 'VI',
            'Vii' => 'VII', 'Viii' => 'VIII', 'Ix' => 'IX', 'Xi' => 'XI',
            'Xii' => 'XII', 'Xiii' => 'XIII', 'Xiv' => 'XIV', 'Xv' => 'XV'
        ];
        foreach ($romanos as $incorrecto => $correcto) {
            $texto = preg_replace("/\b$incorrecto\b/u", $correcto, $texto);
        }
        return $texto;
    }
}