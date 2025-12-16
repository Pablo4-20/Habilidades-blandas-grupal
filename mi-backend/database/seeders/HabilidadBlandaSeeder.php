<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Asignatura;
use App\Models\HabilidadBlanda;

class HabilidadBlandaSeeder extends Seeder
{
    public function run(): void
    {
        // 1. DICCIONARIO DE ACTIVIDADES (PDF Pags 14-15)
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

        // 2. MAPA CURRICULAR: ASIGNATURA => HABILIDAD (PDF Pags 3-6)
        $mapa = [
            // --- SOFTWARE ---
            ['Software', 'Estructuras Discretas', 'Adaptabilidad'],
            ['Software', 'Fundamentos de Física para Ingeniería', 'Aprender a Aprender'],
            ['Software', 'Calculo II', 'Aprender a Aprender'],
            ['Software', 'Administración de Bases de Datos', 'Asertividad'],
            ['Software', 'Fundamentos de Redes y Conectividad', 'Asertividad'],
            ['Software', 'Investigación de Operaciones', 'Creatividad'],
            ['Software', 'Programación Móvil', 'Creatividad'],
            ['Software', 'Mantenimiento y Configuración de Software', 'Creatividad'],
            ['Software', 'Interacción Hombre Máquina', 'Pensamiento Crítico'],
            ['Software', 'Redes de Datos', 'Pensamiento Crítico'],
            ['Software', 'Gestión de las Tecnologías de la Información', 'Liderazgo'],
            ['Software', 'Calidad de Software', 'Autocontrol'],
            ['Software', 'Deontología Informática', 'Autocontrol'],
            ['Software', 'Trabajo de Titulación e Integración Curricular', 'Toma de Decisiones'],

            // --- TECNOLOGÍAS DE LA INFORMACIÓN (TI) ---
            ['TI', 'Estadística', 'Adaptabilidad'],
            ['TI', 'Ingeniería de Requerimientos', 'Aprender a Aprender'],
            ['TI', 'Calculo II', 'Aprender a Aprender'],
            ['TI', 'Programación Orientada a Objetos', 'Aprender a Aprender'],
            ['TI', 'Redes de Datos', 'Asertividad'],
            ['TI', 'Sistemas Operativos', 'Asertividad'],
            ['TI', 'Epistemología y Metodología de la Investigación', 'Creatividad'],
            ['TI', 'Gerencia de Proyectos', 'Pensamiento Crítico'],
            ['TI', 'Seguridad de Base de Datos', 'Pensamiento Crítico'],
            ['TI', 'Gestión del Conocimiento e Innovación', 'Liderazgo'],
            ['TI', 'Cloud Computing', 'Autocontrol'],
            ['TI', 'Trabajo de Integración Curricular', 'Toma de Decisiones'],
        ];

        foreach ($mapa as $item) {
            $carrera = $item[0];
            $materiaNombre = $item[1];
            $habilidadNombre = $item[2];

            // Buscar la materia específica de esa carrera
            $asignatura = Asignatura::where('nombre', $materiaNombre)
                                    ->where('carrera', $carrera)
                                    ->first();

            if ($asignatura) {
                HabilidadBlanda::updateOrCreate(
                    [
                        'asignatura_id' => $asignatura->id,
                        'nombre' => $habilidadNombre
                    ],
                    [
                        'definicion' => 'Competencia definida en la Guía 2025-2028.',
                        'actividades' => $actividades[$habilidadNombre] ?? 'Actividad a definir.'
                    ]
                );
            }
        }
    }
}