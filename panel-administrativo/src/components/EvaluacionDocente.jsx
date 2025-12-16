import { useState, useEffect } from 'react';
import api from '../services/api';
import Swal from 'sweetalert2';
import { RUBRICAS } from '../data/rubricas'; 
import CustomSelect from './ui/CustomSelect';
import { 
    BookOpenIcon, UserGroupIcon, 
    CheckCircleIcon, ArrowPathIcon, InformationCircleIcon,
    ClockIcon, ListBulletIcon, StarIcon, CalendarDaysIcon 
} from '@heroicons/react/24/outline';

const EvaluacionDocente = () => {
    // --- ESTADOS ---
    const [asignaturas, setAsignaturas] = useState([]);
    const [periodos, setPeriodos] = useState([]); // Nuevo estado para la lista de periodos
    const [habilidadesPlanificadas, setHabilidadesPlanificadas] = useState([]);
    
    // Estados de datos
    const [actividadesContexto, setActividadesContexto] = useState({}); 
    const [estudiantes, setEstudiantes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mostrarRubrica, setMostrarRubrica] = useState(false);
    const [actividadesRubrica, setActividadesRubrica] = useState([]); 

    // Selecciones
    const [selectedPeriodo, setSelectedPeriodo] = useState(''); // El usuario elige esto primero
    const [selectedAsignatura, setSelectedAsignatura] = useState('');
    const [selectedParcial, setSelectedParcial] = useState('1');
    const [habilidadActiva, setHabilidadActiva] = useState(null); 

    // --- CARGAS INICIALES ---
    useEffect(() => {
        // Cargar Asignaturas
        api.get('/docente/asignaturas')
            .then(res => setAsignaturas(Array.isArray(res.data) ? res.data : []));
        
        // Cargar Periodos Activos
        api.get('/periodos/activos')
            .then(res => setPeriodos(Array.isArray(res.data) ? res.data : []));
    }, []);

    // --- MANEJO DE CAMBIO DE PERIODO ---
    const handleCambioPeriodo = (nuevoPeriodo) => {
        setSelectedPeriodo(nuevoPeriodo);
        setSelectedAsignatura(''); // Reseteamos la materia al cambiar periodo
        setHabilidadesPlanificadas([]);
        setEstudiantes([]);
        setHabilidadActiva(null);
    };

    // --- CARGAR PLANIFICACIÓN CUANDO CAMBIA MATERIA O PARCIAL ---
    useEffect(() => {
        if (selectedAsignatura && selectedParcial && selectedPeriodo) {
            cargarPlanificacion();
        }
    }, [selectedAsignatura, selectedParcial]); // El periodo ya está implícito en la asignatura filtrada, pero se usa en la función

    // --- CARGAR ESTUDIANTES ---
    useEffect(() => {
        if (selectedAsignatura && habilidadActiva) {
            cargarEstudiantesYNotas();
        }
    }, [habilidadActiva]);

    // 1. Cargar Planificación (Izquierda)
    const cargarPlanificacion = async () => {
        setLoading(true);
        setHabilidadesPlanificadas([]);
        setActividadesContexto({});
        setHabilidadActiva(null);
        setEstudiantes([]);
        setActividadesRubrica([]);
        
        try {
            // Enviamos también el periodo para asegurar la unicidad
            const res = await api.get(`/planificaciones/verificar/${selectedAsignatura}?parcial=${selectedParcial}&periodo=${encodeURIComponent(selectedPeriodo)}`);
            
            if (res.data.tiene_asignacion && res.data.es_edicion) {
                const guardadas = res.data.actividades_guardadas || {};
                const habilidadesListas = res.data.habilidades.filter(h => guardadas[h.id] && guardadas[h.id].length > 0);
                
                setHabilidadesPlanificadas(habilidadesListas);
                setActividadesContexto(guardadas);

                if (habilidadesListas.length > 0) {
                    setHabilidadActiva(habilidadesListas[0].id);
                }
            } else {
                Swal.fire('Atención', 'No has realizado la planificación de actividades para este parcial.', 'warning');
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'No se pudo cargar la planificación.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // 2. Cargar Estudiantes y Notas
    const cargarEstudiantesYNotas = async () => {
        setLoading(true);
        try {
            const res = await api.post('/docente/rubrica', {
                asignatura_id: selectedAsignatura,
                habilidad_blanda_id: habilidadActiva,
                parcial: selectedParcial,
                periodo: selectedPeriodo // Importante: Enviamos el periodo seleccionado
            });
            
            if (res.data && res.data.estudiantes) {
                setEstudiantes(res.data.estudiantes);
                setActividadesRubrica(res.data.actividades || []);
                
                if (res.data.estudiantes.length === 0) Swal.fire('Info', 'No hay estudiantes inscritos.', 'info');
                setMostrarRubrica(true);
            } else {
                setEstudiantes([]);
            }

        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Error al cargar estudiantes y rúbrica.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // --- LÓGICA RÚBRICA ---
    const getNombreHabilidadActiva = () => {
        const hab = habilidadesPlanificadas.find(h => h.id === habilidadActiva);
        return hab ? hab.nombre : '';
    };

    const nombreNormalizado = getNombreHabilidadActiva().trim();
    const keyRubrica = Object.keys(RUBRICAS).find(k => k.toLowerCase() === nombreNormalizado.toLowerCase()) || nombreNormalizado;
    const rubricaActual = RUBRICAS[keyRubrica] || {};

    // --- MANEJO DE NOTAS ---
    const handleNotaChange = (studentId, nuevoNivel) => {
        setEstudiantes(prev => prev.map(est => 
            est.estudiante_id === studentId ? { ...est, nivel: parseInt(nuevoNivel) } : est
        ));
    };

    const handleGuardar = async () => {
        try {
            const notas = estudiantes
                .filter(e => e.nivel)
                .map(e => ({ estudiante_id: e.estudiante_id, nivel: e.nivel }));

            if(notas.length === 0) return Swal.fire('Aviso', 'No has calificado a nadie.', 'warning');

            await api.post('/docente/guardar-notas', {
                asignatura_id: selectedAsignatura,
                habilidad_blanda_id: habilidadActiva,
                parcial: selectedParcial,
                periodo: selectedPeriodo, // Enviamos el periodo para guardar correctamente
                notas
            });
            Swal.fire('¡Guardado!', `Calificaciones registradas correctamente.`, 'success');
        } catch (error) { Swal.fire('Error', 'No se pudo guardar.', 'error'); }
    };

    const pendientes = estudiantes.filter(e => !e.nivel).length;

    // --- OPCIONES UI (Filtradas) ---
    
    // 1. Periodos
    const opcionesPeriodos = periodos.map(p => ({
        value: p.nombre,
        label: p.nombre
    }));

    // 2. Asignaturas (Filtradas por el periodo seleccionado)
    const asignaturasFiltradas = asignaturas.filter(a => a.periodo === selectedPeriodo);

    const opcionesAsignaturas = asignaturasFiltradas.map(a => ({
        value: a.id,
        label: a.nombre,
        subtext: `${a.carrera} (${a.paralelo})`,
        periodo: a.periodo 
    }));

    const opcionesParciales = [
        { value: '1', label: 'Primer Parcial' },
        { value: '2', label: 'Segundo Parcial' }
    ];

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            {/* CABECERA */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Evaluación Docente</h2>
                    <p className="text-gray-500 text-sm mt-1">Califica el desempeño en base a las actividades planificadas.</p>
                </div>
                {estudiantes.length > 0 && (
                    <button onClick={cargarEstudiantesYNotas} className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 bg-white px-3 py-1 rounded border border-blue-200">
                        <ArrowPathIcon className="h-4 w-4"/> Refrescar Lista
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* --- PANEL IZQUIERDO: CONFIGURACIÓN Y HABILIDADES --- */}
                <div className="lg:col-span-4 space-y-6">
                    
                    {/* SELECTORES */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        
                        {/* 1. PERIODO ACADÉMICO (Seleccionable primero) */}
                        <CustomSelect 
                            label="1. Periodo Académico"
                            icon={CalendarDaysIcon}
                            options={opcionesPeriodos}
                            value={selectedPeriodo}
                            onChange={handleCambioPeriodo}
                            placeholder="-- Seleccionar Periodo --"
                        />

                        {/* 2. MATERIA (Filtrada) */}
                        <div className={!selectedPeriodo ? 'opacity-50 pointer-events-none' : ''}>
                            <CustomSelect 
                                label="2. Materia"
                                options={opcionesAsignaturas}
                                value={selectedAsignatura}
                                onChange={setSelectedAsignatura}
                                placeholder={asignaturasFiltradas.length > 0 ? "-- Seleccionar Materia --" : "Sin materias en este periodo"}
                            />
                        </div>

                        {/* 3. PARCIAL */}
                        <div className={!selectedAsignatura ? 'opacity-50 pointer-events-none' : ''}>
                            <CustomSelect 
                                label="3. Parcial"
                                icon={ClockIcon}
                                options={opcionesParciales}
                                value={selectedParcial}
                                onChange={setSelectedParcial}
                            />
                        </div>
                    </div>

                    {/* LISTA DE HABILIDADES PLANIFICADAS (TABS) */}
                    {habilidadesPlanificadas.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="text-xs font-bold text-gray-400 uppercase px-1">4. Selecciona Habilidad</h3>
                            {habilidadesPlanificadas.map(hab => (
                                <button
                                    key={hab.id}
                                    onClick={() => setHabilidadActiva(hab.id)}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-between group ${
                                        habilidadActiva === hab.id 
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200 ring-2 ring-white ring-offset-2 ring-offset-blue-100' 
                                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-blue-300'
                                    }`}
                                >
                                    {hab.nombre}
                                    {habilidadActiva === hab.id && <StarIcon className="h-4 w-4 text-white"/>}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* CONTEXTO DE ACTIVIDADES (CAJA AMARILLA) */}
                    {habilidadActiva && (
                        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 animate-fade-in">
                            <h4 className="text-sm font-bold text-amber-800 flex items-center gap-2 mb-2">
                                <ListBulletIcon className="h-5 w-5"/> Actividades a Evaluar:
                            </h4>
                            <ul className="list-disc list-inside text-xs text-amber-900/80 space-y-1 ml-1 font-medium">
                                {actividadesRubrica.length > 0 ? (
                                    actividadesRubrica.map((act, idx) => (
                                        <li key={idx}>{act.descripcion || act}</li>
                                    ))
                                ) : (
                                    (actividadesContexto[habilidadActiva] || []).map((act, idx) => (
                                        <li key={idx}>{act}</li>
                                    ))
                                )}
                            </ul>
                        </div>
                    )}
                    
                    {/* RÚBRICA FLOTANTE */}
                    {habilidadActiva && (
                        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 shadow-sm">
                            <div className="flex justify-between items-center cursor-pointer" onClick={() => setMostrarRubrica(!mostrarRubrica)}>
                                <h4 className="text-sm font-bold text-blue-800 flex items-center gap-2">
                                    <InformationCircleIcon className="h-5 w-5"/>
                                    Guía de Rúbrica
                                </h4>
                                <span className="text-blue-500 text-xs">{mostrarRubrica ? 'Ocultar ▲' : 'Ver ▼'}</span>
                            </div>
                            {mostrarRubrica && (
                                <div className="mt-3 space-y-2 text-[11px] text-blue-900 animate-fade-in">
                                    {[1, 2, 3, 4, 5].map(nivel => (
                                        <div key={nivel} className="flex gap-2 items-start p-1.5 rounded hover:bg-blue-100/50">
                                            <span className="font-bold bg-white w-5 h-5 flex items-center justify-center rounded-full border border-blue-200 shrink-0 text-blue-600">
                                                {nivel}
                                            </span>
                                            <p className="leading-tight opacity-90">{rubricaActual[nivel] || "Criterio genérico."}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* --- PANEL DERECHO: TABLA DE CALIFICACIÓN --- */}
                <div className="lg:col-span-8">
                    {habilidadActiva ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full animate-fade-in">
                            <div className="p-4 bg-gray-50 border-b border-gray-200 grid grid-cols-12 gap-4 text-xs font-bold text-gray-500 uppercase items-center sticky top-0 z-10">
                                <div className="col-span-4 pl-2">Estudiante</div>
                                <div className="col-span-8 grid grid-cols-5">
                                    {[1, 2, 3, 4, 5].map(n => <div key={n} className="text-center">Nivel {n}</div>)}
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto max-h-[600px] bg-white">
                                {loading ? (
                                    <div className="p-12 text-center text-gray-400">Cargando nómina y rúbrica...</div>
                                ) : estudiantes.length === 0 ? (
                                    <div className="p-12 text-center text-gray-400">No hay estudiantes cargados para este curso.</div>
                                ) : (
                                    estudiantes.map((est) => (
                                        <div key={est.estudiante_id} className={`grid grid-cols-12 gap-4 p-3 border-b border-gray-50 items-center transition ${est.nivel ? 'bg-blue-50/30' : 'hover:bg-gray-50'}`}>
                                            <div className="col-span-4 font-medium text-sm text-gray-800 truncate pl-2">
                                                {est.nombres}
                                            </div>
                                            <div className="col-span-8 grid grid-cols-5 items-center">
                                                {[1, 2, 3, 4, 5].map((nivel) => (
                                                    <div key={nivel} className="flex justify-center">
                                                        <button
                                                            onClick={() => handleNotaChange(est.estudiante_id, nivel)}
                                                            className={`
                                                                w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all duration-200
                                                                ${est.nivel === nivel 
                                                                    ? 'bg-blue-600 text-white scale-110 shadow-md ring-2 ring-blue-100' 
                                                                    : 'bg-white text-gray-300 border border-gray-100 hover:border-blue-300 hover:text-blue-500 hover:bg-gray-50'}
                                                            `}
                                                            title={`Asignar Nivel ${nivel}`}
                                                        >
                                                            {nivel}
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center sticky bottom-0">
                                <span className="text-xs text-gray-500 font-medium">
                                    {pendientes > 0 ? `Faltan ${pendientes} por calificar` : '¡Completo!'}
                                </span>
                                <button onClick={handleGuardar} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-8 rounded-xl shadow-lg transition transform hover:scale-105 active:scale-95">
                                    <CheckCircleIcon className="h-5 w-5"/> Guardar Notas
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">
                            <UserGroupIcon className="h-16 w-16 mb-4 opacity-20"/>
                            <p className="text-lg font-medium">Selecciona una Habilidad</p>
                            <p className="text-sm">Para ver la lista de estudiantes y calificar.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EvaluacionDocente;