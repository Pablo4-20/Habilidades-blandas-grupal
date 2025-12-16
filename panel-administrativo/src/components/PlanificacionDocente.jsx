import { useState, useEffect } from 'react';
import api from '../services/api';
import Swal from 'sweetalert2';
import CustomSelect from './ui/CustomSelect';
import { 
    BookOpenIcon, SparklesIcon, UserGroupIcon, 
    CheckBadgeIcon, CalendarDaysIcon, ClockIcon, CheckCircleIcon,
    CursorArrowRaysIcon, PencilSquareIcon 
} from '@heroicons/react/24/outline';

// --- CATÁLOGO OFICIAL SEGÚN GUÍA METODOLÓGICA (Págs. 14-15) ---
const CATALOGO_GUIA = {
    // 1. Habilidades Transversales
    'Comunicación Efectiva': [
        'Debates y mesas redondas',
        'Presentaciones orales y proyectos grupales',
        'Simulaciones y dramatizaciones',
        'Análisis de discursos y textos'
    ],
    'Resolución de Problemas': [
        'Observación directa',
        'Estudio de casos',
        'Debates y discusiones',
        'Simulaciones y role-playing',
        'Proyectos colaborativos',
        'Autoevaluación y reflexión',
        'Autoevaluación y coevaluación',
        'Análisis de productos grupales',
        'Autoevaluación'
    ],
    'Trabajo en Equipo': [
        'Observación directa',
        'Estudio de casos',
        'Debates y discusiones',
        'Simulaciones y role-playing',
        'Proyectos colaborativos',
        'Autoevaluación y reflexión',
        'Autoevaluación y coevaluación',
        'Análisis de productos grupales',
        'Autoevaluación'
    ],
    'Gestión del Tiempo': [
        'Observación directa',
        'Análisis de resultados',
        'Retroalimentación de pares',
        'Uso de indicadores de desempeño'
    ],

    // 2. Unidad Básica
    'Adaptabilidad': [
        'Aprendizaje basado en problemas',
        'Simulación de escenarios cambiantes',
        'Proyectos interdisciplinarios',
        'Uso de metodologías activas-aulas invertidas',
        'Problemas abiertos con recursos limitados',
        'Promover la experimentación y el manejo del error'
    ],
    'Aprender a Aprender': [
        'Aprendizaje basado en problemas',
        'Simulación de escenarios cambiantes',
        'Proyectos interdisciplinarios',
        'Uso de metodologías activas-aulas invertidas',
        'Problemas abiertos con recursos limitados',
        'Promover la experimentación y el manejo del error'
    ],

    // 3. Unidad Profesional
    'Asertividad': [
        'Debates y discusiones guiadas',
        'Sesiones de preguntas y respuestas activas',
        'Análisis de casos',
        'Proyectos de innovación',
        'Evaluación del proceso creativo',
        'Presentaciones orales y exposiciones de proyectos'
    ],
    'Creatividad': [
        'Debates y discusiones guiadas',
        'Sesiones de preguntas y respuestas activas',
        'Análisis de casos',
        'Proyectos de innovación',
        'Evaluación del proceso creativo',
        'Presentaciones orales y exposiciones de proyectos'
    ],
    'Pensamiento Crítico': [
        'Feedback constructivo en procesos creativos',
        'Análisis de casos',
        'Debates estructurados',
        'Ensayos reflexivos',
        'Simulación de tomas de decisiones',
        'Cuestionarios de autoevaluación'
    ],

    // 4. Unidad de Integración Curricular
    'Liderazgo': [
        'Rubricas de evaluación de liderazgo en actividades colaborativas',
        'Autoevaluación y metacognición',
        'Portafolios reflexivos',
        'Evaluación entre pares',
        'Simulación y estudios de caso',
        'Problemas abiertos y desestructurados',
        'Estudio de casos o escenarios reales',
        'Depuración de código ajeno'
    ],
    'Toma de Decisiones': [
        'Rubricas de evaluación de liderazgo en actividades colaborativas',
        'Autoevaluación y metacognición',
        'Portafolios reflexivos',
        'Evaluación entre pares',
        'Simulación y estudios de caso',
        'Problemas abiertos y desestructurados',
        'Estudio de casos o escenarios reales',
        'Depuración de código ajeno'
    ],
    'Autocontrol': [ // Asignadas por pertenecer a la Unidad de Integración Curricular
        'Rubricas de evaluación de liderazgo en actividades colaborativas',
        'Autoevaluación y metacognición',
        'Portafolios reflexivos',
        'Evaluación entre pares',
        'Simulación y estudios de caso',
        'Problemas abiertos y desestructurados',
        'Estudio de casos o escenarios reales',
        'Depuración de código ajeno'
    ]
};

const PlanificacionDocente = () => {
    const [misAsignaturas, setMisAsignaturas] = useState([]);
    const [estudiantes, setEstudiantes] = useState([]);
    const [loading, setLoading] = useState(false);

    const [habilidadesAsignadas, setHabilidadesAsignadas] = useState([]);
    const [form, setForm] = useState({
        asignatura_id: '',
        parcial: '1',
        periodo_academico: '',
    });

    const [opcionesPorHabilidad, setOpcionesPorHabilidad] = useState({});
    const [seleccionActividades, setSeleccionActividades] = useState({});
    const [esEdicion, setEsEdicion] = useState(false);

    const materiaSeleccionada = misAsignaturas.find(a => a.id == form.asignatura_id);

    // 1. CARGA INICIAL
    useEffect(() => {
        api.get('/docente/asignaturas').then(res => {
            setMisAsignaturas(Array.isArray(res.data) ? res.data : []);
        });
    }, []);

    // 2. EFECTO: Recarga al cambiar Materia o Parcial
    useEffect(() => {
        if (form.asignatura_id && form.parcial) {
            cargarDatosPlanificacion();
        }
    }, [form.asignatura_id, form.parcial]);

    const handleCambioMateria = (val) => {
        const materia = misAsignaturas.find(m => m.id == val);
        let nuevoParcial = '1';
        // Auto-seleccionar parcial 2 si el 1 ya está listo
        if (materia && materia.planificacion_p1 && !materia.planificacion_p2) nuevoParcial = '2';

        setForm(prev => ({
            ...prev,
            asignatura_id: val,
            periodo_academico: materia ? materia.periodo : '',
            parcial: nuevoParcial
        }));
        
        if(val) cargarEstudiantes(val);
    };

    const cargarDatosPlanificacion = async () => {
        // Limpieza visual
        setHabilidadesAsignadas([]);
        setSeleccionActividades({});
        setEsEdicion(false);

        try {
            const res = await api.get(`/planificaciones/verificar/${form.asignatura_id}?parcial=${form.parcial}`);
            
            if (res.data.tiene_asignacion) {
                const habilidades = res.data.habilidades;
                const guardadas = res.data.actividades_guardadas || {};
                const esModoEdicion = res.data.es_edicion;

                setHabilidadesAsignadas(habilidades);
                setEsEdicion(esModoEdicion);

                const opcionesMap = {};
                const seleccionMap = {};

                habilidades.forEach(h => {
                    // --- CORRECCIÓN DE MATCHING (Lógica mejorada) ---
                    const nombreBD = h.nombre.trim();
                    let listaOpciones = [];

                    // 1. Buscamos coincidencia exacta en el Catálogo
                    if (CATALOGO_GUIA[nombreBD]) {
                        listaOpciones = CATALOGO_GUIA[nombreBD];
                    } 
                    // 2. Si no, buscamos ignorando mayúsculas/minúsculas o tildes
                    else {
                        const keyEncontrada = Object.keys(CATALOGO_GUIA).find(k => 
                            k.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === 
                            nombreBD.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                        );
                        if (keyEncontrada) {
                            listaOpciones = CATALOGO_GUIA[keyEncontrada];
                        } else {
                            // 3. Fallback solo si realmente no existe en la guía
                            listaOpciones = ['Actividad sugerida por defecto'];
                        }
                    }

                    opcionesMap[h.id] = listaOpciones;
                    
                    // Cargar selección guardada o vacía
                    seleccionMap[h.id] = (esModoEdicion && guardadas[h.id]) ? guardadas[h.id] : [];
                });

                setOpcionesPorHabilidad(opcionesMap);
                setSeleccionActividades(seleccionMap);

                if (esModoEdicion) {
                    const Toast = Swal.mixin({toast: true, position: 'top-end', showConfirmButton: false, timer: 2000});
                    Toast.fire({icon: 'info', title: `Cargada planificación P${form.parcial}`});
                }

            } else {
                Swal.fire('Información', res.data.message || 'Materia sin configuración.', 'info');
            }
        } catch (error) {
            console.error("Error cargando planificación:", error);
        }
    };

    const cargarEstudiantes = (asignaturaId) => {
        setLoading(true);
        api.get(`/docente/estudiantes/${asignaturaId}`)
            .then(res => setEstudiantes(res.data))
            .finally(() => setLoading(false));
    };

    const toggleActividad = (habilidadId, actividad) => {
        setSeleccionActividades(prev => {
            const seleccionadas = prev[habilidadId] || [];
            if (seleccionadas.includes(actividad)) {
                return { ...prev, [habilidadId]: seleccionadas.filter(a => a !== actividad) };
            } else {
                return { ...prev, [habilidadId]: [...seleccionadas, actividad] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!form.asignatura_id) return Swal.fire('Atención', 'Selecciona una asignatura.', 'warning');
        if (habilidadesAsignadas.length === 0) return Swal.fire('Error', 'No hay habilidades.', 'error');
        
        const userStr = localStorage.getItem('user');
        if (!userStr) return Swal.fire('Error', 'Sesión inválida.', 'error');
        const user = JSON.parse(userStr);

        for (let h of habilidadesAsignadas) {
            if (!seleccionActividades[h.id] || seleccionActividades[h.id].length === 0) {
                return Swal.fire('Faltan datos', `Selecciona actividades para: ${h.nombre}`, 'warning');
            }
        }

        const detalles = habilidadesAsignadas.map(hab => ({
            habilidad_blanda_id: hab.id,
            actividades: seleccionActividades[hab.id].join('\n') 
        }));

        try {
            await api.post('/planificaciones', {
                asignatura_id: form.asignatura_id,
                docente_id: user.id,
                parcial: form.parcial,
                periodo_academico: form.periodo_academico || 'Periodo Actual',
                detalles: detalles
            });
            
            Swal.fire({
                title: esEdicion ? '¡Actualizado!' : '¡Guardado!',
                text: `Planificación del Parcial ${form.parcial} registrada correctamente.`,
                icon: 'success'
            });
            
            api.get('/docente/asignaturas').then(res => {
                setMisAsignaturas(Array.isArray(res.data) ? res.data : []);
            });
            setEsEdicion(true); 
            
        } catch (error) {
            const msj = error.response?.data?.message || 'Error al guardar.';
            Swal.fire('Error', msj, 'error');
        }
    };

    // Opciones visuales
    const opcionesAsignaturas = misAsignaturas.map(a => ({
        value: a.id,
        label: a.nombre,
        subtext: `${a.carrera} (${a.paralelo}) | P1:${a.planificacion_p1?'Ok':'-'} P2:${a.planificacion_p2?'Ok':'-'}`,
        icon: (a.planificacion_p1 && a.planificacion_p2) ? CheckCircleIcon : null
    }));

    const opcionesParciales = [
        { value: '1', label: 'Primer Parcial' },
        { value: '2', label: 'Segundo Parcial' }
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Planificación de Habilidades</h2>
                    <p className="text-gray-500 text-sm mt-1">Gestiona las actividades oficiales de la Guía Académica.</p>
                </div>
                {esEdicion && (
                    <span className="bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 border border-amber-200 animate-pulse">
                        <PencilSquareIcon className="h-5 w-5"/>
                        Editando Parcial {form.parcial}
                    </span>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* --- FORMULARIO --- */}
                <div className="lg:col-span-2 space-y-6">
                    <form onSubmit={handleSubmit}>
                        <div className={`p-6 rounded-2xl shadow-sm border mb-6 space-y-4 transition-colors ${esEdicion ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-100'}`}>
                            <CustomSelect 
                                label="1. Selecciona tu Asignatura"
                                icon={BookOpenIcon}
                                placeholder="-- Elegir materia --"
                                options={opcionesAsignaturas}
                                value={form.asignatura_id}
                                onChange={handleCambioMateria}
                            />
                            
                            <div className={`grid grid-cols-2 gap-4 transition-all ${form.asignatura_id ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                                <CustomSelect 
                                    label="2. Parcial"
                                    icon={ClockIcon}
                                    options={opcionesParciales}
                                    value={form.parcial}
                                    onChange={(val) => setForm(prev => ({ ...prev, parcial: val }))} 
                                />
                                <div className="bg-white border border-gray-200 rounded-xl p-3 flex flex-col justify-center">
                                    <span className="text-xs font-bold text-gray-400 uppercase mb-1">Periodo Académico</span>
                                    <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                        <CalendarDaysIcon className="h-4 w-4"/> 
                                        {form.periodo_academico || '...'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* LISTA DE HABILIDADES */}
                        {habilidadesAsignadas.length > 0 ? (
                            <div className="space-y-6">
                                <h3 className="font-bold text-gray-700 flex items-center gap-2 px-1 text-lg">
                                    <SparklesIcon className="h-6 w-6 text-purple-600"/>
                                    3. Habilidades ({habilidadesAsignadas.length})
                                </h3>
                                
                                {habilidadesAsignadas.map((hab, index) => (
                                    <div key={hab.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500"></div>
                                        
                                        <div className="mb-4">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-xs font-bold text-purple-600 uppercase tracking-wide bg-purple-50 px-2 py-1 rounded">
                                                    #{index + 1} {hab.nombre}
                                                </span>
                                            </div>
                                            {hab.definicion && (
                                                <p className="text-sm text-gray-500 italic mt-1 bg-gray-50 p-2 rounded border border-gray-100">
                                                    "{hab.definicion}"
                                                </p>
                                            )}
                                        </div>

                                        <div className="mt-4">
                                            <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                                <CursorArrowRaysIcon className="h-5 w-5 text-blue-600"/> 
                                                Actividades según Guía Metodológica:
                                            </label>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {opcionesPorHabilidad[hab.id]?.map((actividad, i) => {
                                                    const isSelected = (seleccionActividades[hab.id] || []).includes(actividad);
                                                    return (
                                                        <label 
                                                            key={i} 
                                                            className={`
                                                                flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all
                                                                ${isSelected
                                                                    ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500'
                                                                    : 'bg-white border-gray-200 hover:bg-gray-50'
                                                                }
                                                            `}
                                                        >
                                                            <input 
                                                                type="checkbox" 
                                                                className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                                                                checked={isSelected}
                                                                onChange={() => toggleActividad(hab.id, actividad)}
                                                            />
                                                            <span className={`text-xs md:text-sm ${isSelected ? 'text-blue-800 font-medium' : 'text-gray-600'}`}>
                                                                {actividad}
                                                            </span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <div className="pt-4 pb-8">
                                    <button 
                                        type="submit" 
                                        className={`w-full font-bold py-4 rounded-xl shadow-lg transition flex justify-center items-center gap-2 text-lg transform hover:-translate-y-0.5 active:translate-y-0 ${esEdicion ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                                    >
                                        {esEdicion ? (
                                            <><PencilSquareIcon className="h-6 w-6"/> Actualizar Planificación P{form.parcial}</>
                                        ) : (
                                            <><CheckBadgeIcon className="h-6 w-6"/> Guardar Planificación P{form.parcial}</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ) : form.asignatura_id && (
                            <div className="p-10 bg-gray-50 border border-gray-200 border-dashed rounded-xl text-center flex flex-col items-center justify-center h-64">
                                <SparklesIcon className="h-10 w-10 text-gray-300 mb-2"/>
                                <p className="text-gray-500 font-medium">Esta materia no tiene habilidades asignadas.</p>
                            </div>
                        )}
                    </form>
                </div>

                {/* --- DERECHA: NÓMINA --- */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col overflow-hidden max-h-[800px] sticky top-6">
                        <div className="p-5 border-b border-gray-100 bg-gray-50">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <UserGroupIcon className="h-5 w-5 text-blue-600"/>
                                Estudiantes
                            </h3>
                            {materiaSeleccionada && (
                                <p className="text-xs text-gray-500 mt-1">
                                    {materiaSeleccionada.carrera} {materiaSeleccionada.paralelo}
                                </p>
                            )}
                        </div>
                        <div className="flex-1 overflow-y-auto p-0 scrollbar-thin">
                            {loading ? (
                                <div className="p-10 text-center text-gray-400">Cargando...</div>
                            ) : estudiantes.length > 0 ? (
                                <ul className="divide-y divide-gray-50">
                                    {estudiantes.map((est, i) => (
                                        <li key={est.id} className="px-5 py-3 flex items-center gap-3 hover:bg-blue-50 transition">
                                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-xs font-bold text-gray-500">
                                                {i+1}
                                            </span>
                                            <div>
                                                <div className="text-sm font-bold text-gray-700">
                                                    {est.apellidos} {est.nombres}
                                                </div>
                                                <div className="text-[10px] text-gray-400">{est.email}</div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="p-10 text-center text-gray-400 text-sm">
                                    Selecciona una materia.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlanificacionDocente;