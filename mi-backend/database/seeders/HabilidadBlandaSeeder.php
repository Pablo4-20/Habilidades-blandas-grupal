<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class HabilidadBlandaSeeder extends Seeder
{
    public function run(): void
    {
        $habilidades = [
            [
                'nombre' => 'Adaptabilidad',
                'definicion' => 'Es la capacidad de ajustarse de manera efectiva a cambios, nuevas circunstancias y desafíos en el entorno personal o laboral.'
            ],
            [
                'nombre' => 'Aprender a Aprender',
                'definicion' => 'Es la capacidad de gestionar, dirigir y optimizar el propio proceso de aprendizaje de forma autónoma.'
            ],
            [
                'nombre' => 'Comunicación Efectiva',
                'definicion' => 'Es la capacidad de transmitir ideas, pensamientos, necesidades y emociones de manera clara, coherente y adecuada al contexto.'
            ],
            [
                'nombre' => 'Asertividad',
                'definicion' => 'Es la capacidad de expresar opiniones, necesidades y sentimientos de forma clara, directa y respetuosa, sin ser agresivo ni pasivo.'
            ],
            [
                'nombre' => 'Autocontrol',
                'definicion' => 'Es la capacidad de gestionar y regular las propias emociones, impulsos y comportamientos, especialmente en situaciones de estrés.'
            ],
            [
                'nombre' => 'Pensamiento Crítico',
                'definicion' => 'Es la capacidad de analizar y evaluar la información de manera lógica, objetiva y racional para tomar decisiones fundamentadas.'
            ],
            [
                'nombre' => 'Liderazgo',
                'definicion' => 'Es la capacidad de influir, motivar e inspirar a otros para alcanzar metas comunes, promoviendo un entorno de colaboración.'
            ],
            [
                'nombre' => 'Toma de Decisiones',
                'definicion' => 'Es la capacidad de seleccionar la mejor opción posible entre diversas alternativas para resolver un problema o avanzar hacia un objetivo.'
            ],
            [
                'nombre' => 'Trabajo en Equipo',
                'definicion' => 'Es la capacidad de colaborar de manera efectiva con otras personas para alcanzar un objetivo común.'
            ],
            [
                'nombre' => 'Creatividad',
                'definicion' => 'Es la capacidad de generar ideas originales, soluciones innovadoras y enfoques novedosos para resolver problemas.'
            ],
            [
                'nombre' => 'Resolución de Problemas',
                'definicion' => 'Es la capacidad de identificar, analizar y abordar desafíos o situaciones difíciles de manera efectiva y lógica. '
            ],
            [
                'nombre' => 'Gestión del Tiempo',
                'definicion' => 'Es la capacidad de planificar, priorizar y ejecutar tareas de manera eficiente, optimizando los recursos disponibles.  '
            ],
        ];

        DB::table('habilidades_blandas')->insert($habilidades);
    }
}