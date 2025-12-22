<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Asignatura; // 👈 Usamos el Modelo en lugar de DB directa

class AsignaturaSeeder extends Seeder
{
    public function run(): void
    {
        $asignaturas = [
            // ================= CARRERA DE SOFTWARE =================
            // Ciclo I
            ['nombre' => 'Algoritmos y Lógica de Programación', 'carrera' => 'Software', 'ciclo' => 'I', 'unidad_curricular' => 'Unidad Básica'],
            ['nombre' => 'Algebra lineal', 'carrera' => 'Software', 'ciclo' => 'I', 'unidad_curricular' => 'Unidad Básica'],
            ['nombre' => 'Calculo I', 'carrera' => 'Software', 'ciclo' => 'I', 'unidad_curricular' => 'Unidad Básica'],
            ['nombre' => 'Lenguaje y Comunicación', 'carrera' => 'Software', 'ciclo' => 'I', 'unidad_curricular' => 'Unidad Básica'],
            ['nombre' => 'Estructuras Discretas', 'carrera' => 'Software', 'ciclo' => 'I', 'unidad_curricular' => 'Unidad Básica'],
            ['nombre' => 'Arquitectura de Computadores', 'carrera' => 'Software', 'ciclo' => 'I', 'unidad_curricular' => 'Unidad Básica'],
            ['nombre' => 'Fundamentos de Física para Ingeniería', 'carrera' => 'Software', 'ciclo' => 'I', 'unidad_curricular' => 'Unidad Básica'],
            // Ciclo II
            ['nombre' => 'Calculo II', 'carrera' => 'Software', 'ciclo' => 'II', 'unidad_curricular' => 'Unidad Básica'],
            ['nombre' => 'Programación Orientada a Objetos', 'carrera' => 'Software', 'ciclo' => 'II', 'unidad_curricular' => 'Unidad Básica'],
            ['nombre' => 'Realidad Nacional y Diversidad Cultural', 'carrera' => 'Software', 'ciclo' => 'II', 'unidad_curricular' => 'Unidad Básica'],
            ['nombre' => 'Estructura de Datos', 'carrera' => 'Software', 'ciclo' => 'II', 'unidad_curricular' => 'Unidad Básica'],
            // Ciclo III
            ['nombre' => 'Ingeniería de Requerimientos', 'carrera' => 'Software', 'ciclo' => 'III', 'unidad_curricular' => 'Unidad Básica'],
            ['nombre' => 'Sistemas de Información', 'carrera' => 'Software', 'ciclo' => 'III', 'unidad_curricular' => 'Unidad Básica'],
            ['nombre' => 'Cálculo III', 'carrera' => 'Software', 'ciclo' => 'III', 'unidad_curricular' => 'Unidad Básica'],
            ['nombre' => 'Trabajo en Equipo y Comunicación Eficaz', 'carrera' => 'Software', 'ciclo' => 'III', 'unidad_curricular' => 'Unidad Básica'],
            ['nombre' => 'Estadística y Probabilidades', 'carrera' => 'Software', 'ciclo' => 'III', 'unidad_curricular' => 'Unidad Básica'],
            ['nombre' => 'Programación Web I', 'carrera' => 'Software', 'ciclo' => 'III', 'unidad_curricular' => 'Unidad Básica'],
            // Ciclo IV
            ['nombre' => 'Modelamiento y Diseño del Software', 'carrera' => 'Software', 'ciclo' => 'IV', 'unidad_curricular' => 'Unidad Profesional'],
            ['nombre' => 'Bases de Datos', 'carrera' => 'Software', 'ciclo' => 'IV', 'unidad_curricular' => 'Unidad Profesional'],
            ['nombre' => 'Sistemas Operativos', 'carrera' => 'Software', 'ciclo' => 'IV', 'unidad_curricular' => 'Unidad Profesional'],
            ['nombre' => 'Sostenibilidad Ambiental', 'carrera' => 'Software', 'ciclo' => 'IV', 'unidad_curricular' => 'Unidad Profesional'],
            ['nombre' => 'Métodos Numéricos', 'carrera' => 'Software', 'ciclo' => 'IV', 'unidad_curricular' => 'Unidad Profesional'],
            ['nombre' => 'Programación Web II', 'carrera' => 'Software', 'ciclo' => 'IV', 'unidad_curricular' => 'Unidad Profesional'],
            ['nombre' => 'Arquitectura de Software', 'carrera' => 'Software', 'ciclo' => 'IV', 'unidad_curricular' => 'Unidad Profesional'],
            // Ciclo V
            ['nombre' => 'Administración de Bases de Datos', 'carrera' => 'Software', 'ciclo' => 'V', 'unidad_curricular' => 'Unidad Profesional'],
            ['nombre' => 'Fundamentos de Redes y Conectividad', 'carrera' => 'Software', 'ciclo' => 'V', 'unidad_curricular' => 'Unidad Profesional'],
            ['nombre' => 'Investigación de Operaciones', 'carrera' => 'Software', 'ciclo' => 'V', 'unidad_curricular' => 'Unidad Profesional'],
            ['nombre' => 'Programación Móvil', 'carrera' => 'Software', 'ciclo' => 'V', 'unidad_curricular' => 'Unidad Profesional'],
            ['nombre' => 'Mantenimiento y Configuración de Software', 'carrera' => 'Software', 'ciclo' => 'V', 'unidad_curricular' => 'Unidad Profesional'],
            // Ciclo VI
            ['nombre' => 'Interacción Hombre Máquina', 'carrera' => 'Software', 'ciclo' => 'VI', 'unidad_curricular' => 'Unidad Profesional'],
            ['nombre' => 'Redes de Datos', 'carrera' => 'Software', 'ciclo' => 'VI', 'unidad_curricular' => 'Unidad Profesional'],
            ['nombre' => 'Liderazgo y Emprendimiento', 'carrera' => 'Software', 'ciclo' => 'VI', 'unidad_curricular' => 'Unidad Profesional'],
            ['nombre' => 'Simulación', 'carrera' => 'Software', 'ciclo' => 'VI', 'unidad_curricular' => 'Unidad Profesional'],
            ['nombre' => 'Aplicaciones Distribuidas', 'carrera' => 'Software', 'ciclo' => 'VI', 'unidad_curricular' => 'Unidad Profesional'],
            ['nombre' => 'Seguridad de Software', 'carrera' => 'Software', 'ciclo' => 'VI', 'unidad_curricular' => 'Unidad Profesional'],
            // Ciclo VII
            ['nombre' => 'Epistemología y Metodología de la Investigación', 'carrera' => 'Software', 'ciclo' => 'VII', 'unidad_curricular' => 'Unidad Profesional'],
            ['nombre' => 'Inteligencia Artificial', 'carrera' => 'Software', 'ciclo' => 'VII', 'unidad_curricular' => 'Unidad Profesional'],
            ['nombre' => 'Prácticas Profesionales', 'carrera' => 'Software', 'ciclo' => 'VII', 'unidad_curricular' => 'Unidad Profesional'],
            ['nombre' => 'Gestión de las Tecnologías de la Información', 'carrera' => 'Software', 'ciclo' => 'VII', 'unidad_curricular' => 'Unidad de Integración Curricular'],
            // Ciclo VIII
            ['nombre' => 'Calidad de Software', 'carrera' => 'Software', 'ciclo' => 'VIII', 'unidad_curricular' => 'Unidad de Integración Curricular'],
            ['nombre' => 'Deontología Informática', 'carrera' => 'Software', 'ciclo' => 'VIII', 'unidad_curricular' => 'Unidad de Integración Curricular'],
            ['nombre' => 'Prácticas de Servicio Comunitario', 'carrera' => 'Software', 'ciclo' => 'VIII', 'unidad_curricular' => 'Unidad de Integración Curricular'],
            ['nombre' => 'Trabajo de Titulación e Integración Curricular', 'carrera' => 'Software', 'ciclo' => 'VIII', 'unidad_curricular' => 'Unidad de Integración Curricular'],

            // ================= CARRERA DE TI =================
            // Ciclo I
            ['nombre' => 'Algoritmos y Fundamentos de Programación', 'carrera' => 'TI', 'ciclo' => 'I', 'unidad_curricular' => 'Unidad Básica'],
            ['nombre' => 'Algebra lineal', 'carrera' => 'TI', 'ciclo' => 'I', 'unidad_curricular' => 'Unidad Básica'],
            ['nombre' => 'Calculo I', 'carrera' => 'TI', 'ciclo' => 'I', 'unidad_curricular' => 'Unidad Básica'],
            ['nombre' => 'Lenguaje y Comunicación', 'carrera' => 'TI', 'ciclo' => 'I', 'unidad_curricular' => 'Unidad Básica'],
            ['nombre' => 'Estructuras Discretas', 'carrera' => 'TI', 'ciclo' => 'I', 'unidad_curricular' => 'Unidad Básica'],
            ['nombre' => 'Estadística', 'carrera' => 'TI', 'ciclo' => 'I', 'unidad_curricular' => 'Unidad Básica'],
            // Ciclo II
            ['nombre' => 'Ingeniería de Requerimientos', 'carrera' => 'TI', 'ciclo' => 'II', 'unidad_curricular' => 'Unidad Básica'],
            ['nombre' => 'Calculo II', 'carrera' => 'TI', 'ciclo' => 'II', 'unidad_curricular' => 'Unidad Básica'],
            ['nombre' => 'Programación Orientada a Objetos', 'carrera' => 'TI', 'ciclo' => 'II', 'unidad_curricular' => 'Unidad Básica'],
            ['nombre' => 'Realidad Nacional y Diversidad Cultural', 'carrera' => 'TI', 'ciclo' => 'II', 'unidad_curricular' => 'Unidad Básica'],
            ['nombre' => 'Programación Web I', 'carrera' => 'TI', 'ciclo' => 'II', 'unidad_curricular' => 'Unidad Básica'],
            ['nombre' => 'Gestión de Procesos', 'carrera' => 'TI', 'ciclo' => 'II', 'unidad_curricular' => 'Unidad Básica'],
            // Ciclo III
            ['nombre' => 'Probabilidades', 'carrera' => 'TI', 'ciclo' => 'III', 'unidad_curricular' => 'Unidad Básica'],
            ['nombre' => 'Cálculo III', 'carrera' => 'TI', 'ciclo' => 'III', 'unidad_curricular' => 'Unidad Básica'],
            ['nombre' => 'Trabajo en Equipo y Comunicación Eficaz', 'carrera' => 'TI', 'ciclo' => 'III', 'unidad_curricular' => 'Unidad Básica'],
            ['nombre' => 'Programación Web II', 'carrera' => 'TI', 'ciclo' => 'III', 'unidad_curricular' => 'Unidad Básica'],
            ['nombre' => 'Bases de Datos', 'carrera' => 'TI', 'ciclo' => 'III', 'unidad_curricular' => 'Unidad Básica'],
            // Ciclo IV
            ['nombre' => 'Fundamentos de Redes y Conectividad', 'carrera' => 'TI', 'ciclo' => 'IV', 'unidad_curricular' => 'Unidad Profesional'],
            ['nombre' => 'Gestión de Servicios TI', 'carrera' => 'TI', 'ciclo' => 'IV', 'unidad_curricular' => 'Unidad Profesional'],
            ['nombre' => 'Sostenibilidad Ambiental', 'carrera' => 'TI', 'ciclo' => 'IV', 'unidad_curricular' => 'Unidad Profesional'],
            ['nombre' => 'Gerencia Financiera', 'carrera' => 'TI', 'ciclo' => 'IV', 'unidad_curricular' => 'Unidad Profesional'],
            ['nombre' => 'Administración de Bases de Datos', 'carrera' => 'TI', 'ciclo' => 'V', 'unidad_curricular' => 'Unidad Profesional'],
            // Ciclo V
            ['nombre' => 'Redes de Datos', 'carrera' => 'TI', 'ciclo' => 'V', 'unidad_curricular' => 'Unidad Profesional'],
            ['nombre' => 'Sistemas Operativos', 'carrera' => 'TI', 'ciclo' => 'V', 'unidad_curricular' => 'Unidad Profesional'],
            ['nombre' => 'Epistemología y Metodología de la Investigación', 'carrera' => 'TI', 'ciclo' => 'V', 'unidad_curricular' => 'Unidad Profesional'],
            ['nombre' => 'Gerencia de Proyectos', 'carrera' => 'TI', 'ciclo' => 'V', 'unidad_curricular' => 'Unidad Profesional'],
            ['nombre' => 'Seguridad de Base de Datos', 'carrera' => 'TI', 'ciclo' => 'V', 'unidad_curricular' => 'Unidad Profesional'],
            // Ciclo VI
            ['nombre' => 'Gestión y Seguridad de Redes', 'carrera' => 'TI', 'ciclo' => 'VI', 'unidad_curricular' => 'Unidad Profesional'],
            ['nombre' => 'Administración de Sistemas Operativos', 'carrera' => 'TI', 'ciclo' => 'VI', 'unidad_curricular' => 'Unidad Profesional'],
            ['nombre' => 'Prácticas de Servicio Comunitario', 'carrera' => 'TI', 'ciclo' => 'VI', 'unidad_curricular' => 'Unidad Profesional'],
            ['nombre' => 'Gestión Estratégica de la Información', 'carrera' => 'TI', 'ciclo' => 'VI', 'unidad_curricular' => 'Unidad Profesional'],
            ['nombre' => 'Diseño del Trabajo de Integración Curricular', 'carrera' => 'TI', 'ciclo' => 'VI', 'unidad_curricular' => 'Unidad Profesional'],
            // Ciclo VII
            ['nombre' => 'Arquitectura y Plataforma de Servidores', 'carrera' => 'TI', 'ciclo' => 'VII', 'unidad_curricular' => 'Unidad Profesional'],
            ['nombre' => 'Liderazgo y Emprendimiento', 'carrera' => 'TI', 'ciclo' => 'VII', 'unidad_curricular' => 'Unidad Profesional'],
            ['nombre' => 'Prácticas Laborales', 'carrera' => 'TI', 'ciclo' => 'VII', 'unidad_curricular' => 'Unidad Profesional'],
            ['nombre' => 'Gestión del Conocimiento e Innovación', 'carrera' => 'TI', 'ciclo' => 'VII', 'unidad_curricular' => 'Unidad Profesional'],
            ['nombre' => 'Gestión y Gobierno de TI', 'carrera' => 'TI', 'ciclo' => 'VII', 'unidad_curricular' => 'Unidad de Integración Curricular'],
            // Ciclo VIII
            ['nombre' => 'Deontología y Legislación Informática', 'carrera' => 'TI', 'ciclo' => 'VIII', 'unidad_curricular' => 'Unidad de Integración Curricular'],
            ['nombre' => 'Cloud Computing', 'carrera' => 'TI', 'ciclo' => 'VIII', 'unidad_curricular' => 'Unidad de Integración Curricular'],
            ['nombre' => 'Trabajo de Integración Curricular', 'carrera' => 'TI', 'ciclo' => 'VIII', 'unidad_curricular' => 'Unidad de Integración Curricular'],
        ];

        foreach ($asignaturas as $asignatura) {
            // 👇 APLICAMOS FORMATO PARA COHERENCIA CON CONTROLADOR
            $nombreFormateado = $this->formatearTexto($asignatura['nombre']);

            Asignatura::updateOrCreate(
                [
                    'nombre' => $nombreFormateado, 
                    'carrera' => $asignatura['carrera']
                ],
                [
                    'ciclo' => $asignatura['ciclo'],
                    'unidad_curricular' => $asignatura['unidad_curricular']
                ]
            );
        }
    }

    // 👇 MISMA FUNCIÓN DE FORMATO DEL CONTROLADOR
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