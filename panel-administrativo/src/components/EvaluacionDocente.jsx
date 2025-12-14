import { useState, useEffect } from 'react';
import api from '../services/api';
import Swal from 'sweetalert2';
import { RUBRICAS } from '../data/rubricas';
import CustomSelect from './ui/CustomSelect'; // <--- IMPORTANTE
import { 
    BookOpenIcon, ClipboardDocumentCheckIcon, UserGroupIcon, 
    CheckCircleIcon, ArrowPathIcon, InformationCircleIcon,
    ClockIcon // Icono para parcial
} from '@heroicons/react/24/outline';

const EvaluacionDocente = () => {
    // --- ESTADOS ---
    const [asignaturas, setAsignaturas] = useState([]);
    const [todasLasHabilidades, setTodasLasHabilidades] = useState([]); 
    const [habilidadesFiltradas, setHabilidadesFiltradas] = useState([]);
    const [estudiantes, setEstudiantes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mostrarRubrica, setMostrarRubrica] = useState(false);

    // Selecciones
    const [selectedAsignatura, setSelectedAsignatura] = useState('');
    const [selectedPlanificacion, setSelectedPlanificacion] = useState('');
    const [selectedParcial, setSelectedParcial] = useState('1');

    // --- CARGAS INICIALES ---
    useEffect(() => {
        api.get('/docente/asignaturas')
            .then(res => setAsignaturas(Array.isArray(res.data) ? res.data : []));
    }, []);

    useEffect(() => {
        if (selectedAsignatura) {
            setTodasLasHabilidades([]);
            setHabilidadesFiltradas([]);
            setSelectedPlanificacion('');
            setEstudiantes([]); 
            
            api.get(`/docente/habilidades/${selectedAsignatura}`)
                .then(res => setTodasLasHabilidades(Array.isArray(res.data) ? res.data : []));
        }
    }, [selectedAsignatura]);

    useEffect(() => {
        const filtradas = todasLasHabilidades.filter(h => h.parcial === selectedParcial);
        setHabilidadesFiltradas(filtradas);
        
        // Auto-selección si solo hay una
        if (filtradas.length === 1) setSelectedPlanificacion(filtradas[0].planificacion_id);
        else setSelectedPlanificacion('');
        
        setEstudiantes([]);
        setMostrarRubrica(true);
    }, [selectedParcial, todasLasHabilidades]);

    // --- LÓGICA RÚBRICA ---
    const getHabilidadNombre = () => {
        const hab = todasLasHabilidades.find(h => h.planificacion_id == selectedPlanificacion);
        return hab ? hab.habilidad_nombre : '';
    };

    const rubricaActual = RUBRICAS[getHabilidadNombre()] || {};

    // --- CARGAR Y GUARDAR ---
    const cargarRubrica = async () => {
        if (!selectedAsignatura || !selectedPlanificacion) return Swal.fire('Atención', 'Falta información.', 'warning');
        setLoading(true);
        try {
            const res = await api.post('/docente/rubrica', {
                asignatura_id: selectedAsignatura,
                planificacion_id: selectedPlanificacion,
                parcial: selectedParcial
            });
            if (res.data.length === 0) Swal.fire('Info', 'No hay estudiantes en este curso.', 'info');
            setEstudiantes(res.data);
        } catch (error) { Swal.fire('Error', 'Error al cargar lista.', 'error'); } 
        finally { setLoading(false); }
    };

    const handleNotaChange = (studentId, nuevoNivel) => {
        setEstudiantes(prev => prev.map(est => 
            est.estudiante_id === studentId ? { ...est, nivel: parseInt(nuevoNivel) } : est
        ));
    };

    const handleGuardar = async () => {
        try {
            const notas = estudiantes.map(e => ({ estudiante_id: e.estudiante_id, nivel: e.nivel }));
            await api.post('/docente/guardar-notas', {
                planificacion_id: selectedPlanificacion,
                parcial: selectedParcial,
                notas
            });
            Swal.fire('¡Guardado!', 'Calificaciones registradas.', 'success');
        } catch (error) { Swal.fire('Error', 'No se pudo guardar.', 'error'); }
    };

    const pendientes = estudiantes.filter(e => !e.nivel).length;

    // --- PREPARACIÓN DE OPCIONES PARA CUSTOM SELECT ---
    const opcionesAsignaturas = asignaturas.map(a => ({
        value: a.id,
        label: a.nombre,
        subtext: `${a.carrera} (${a.paralelo})`
    }));

    const opcionesParciales = [
        { value: '1', label: 'Primer Parcial' },
        { value: '2', label: 'Segundo Parcial' }
    ];

    const opcionesHabilidades = habilidadesFiltradas.map(h => ({
        value: h.planificacion_id,
        label: h.habilidad_nombre
    }));

    return (
        <div className="space-y-6 animate-fade-in">
            {/* CABECERA */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Calificar Habilidades</h2>
                    <p className="text-gray-500 text-sm mt-1">Evalúa el desempeño según la rúbrica institucional.</p>
                </div>
                {estudiantes.length > 0 && (
                    <button onClick={cargarRubrica} className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1">
                        <ArrowPathIcon className="h-4 w-4"/> Recargar
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* --- PANEL IZQUIERDO --- */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <BookOpenIcon className="h-5 w-5 text-blue-600"/> Configuración
                        </h3>
                        
                        <div className="space-y-4">
                            {/* 1. Selector Materia */}
                            <CustomSelect 
                                label="Materia"
                                options={opcionesAsignaturas}
                                value={selectedAsignatura}
                                onChange={setSelectedAsignatura}
                                placeholder="-- Seleccionar --"
                            />

                            {/* 2. Selector Parcial */}
                            <div className={!selectedAsignatura ? 'opacity-50 pointer-events-none' : ''}>
                                <CustomSelect 
                                    label="Parcial"
                                    icon={ClockIcon}
                                    options={opcionesParciales}
                                    value={selectedParcial}
                                    onChange={setSelectedParcial}
                                    disabled={!selectedAsignatura}
                                />
                            </div>

                            {/* 3. Selector Habilidad */}
                            <div className={!selectedAsignatura ? 'opacity-50 pointer-events-none' : ''}>
                                <CustomSelect 
                                    label="Habilidad"
                                    icon={ClipboardDocumentCheckIcon}
                                    options={opcionesHabilidades}
                                    value={selectedPlanificacion}
                                    onChange={setSelectedPlanificacion}
                                    placeholder={habilidadesFiltradas.length > 0 ? "-- Seleccionar --" : "-- Sin asignar --"}
                                    disabled={!selectedAsignatura}
                                />
                                {selectedAsignatura && habilidadesFiltradas.length === 0 && (
                                    <p className="text-xs text-red-500 mt-2 ml-1">* Falta planificación para este parcial.</p>
                                )}
                            </div>

                            <button onClick={cargarRubrica} disabled={!selectedPlanificacion || loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow-md transition disabled:opacity-50 mt-2">
                                {loading ? 'Cargando...' : 'Cargar Estudiantes'}
                            </button>
                        </div>
                    </div>

                    {/* RÚBRICA FLOTANTE (Solo si hay habilidad) */}
                    {selectedPlanificacion && (
                        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 shadow-sm animate-fade-in">
                            <div className="flex justify-between items-center cursor-pointer" onClick={() => setMostrarRubrica(!mostrarRubrica)}>
                                <h4 className="text-sm font-bold text-blue-800 flex items-center gap-2">
                                    <InformationCircleIcon className="h-5 w-5"/>
                                    Rúbrica: {getHabilidadNombre()}
                                </h4>
                                <span className="text-blue-500 text-xs">{mostrarRubrica ? 'Ocultar ▲' : 'Ver ▼'}</span>
                            </div>
                            {mostrarRubrica && (
                                <div className="mt-3 space-y-3 text-xs text-blue-900 animate-fade-in">
                                    {[1, 2, 3, 4, 5].map(nivel => (
                                        <div key={nivel} className="flex gap-2 items-start">
                                            <span className="font-bold bg-white w-5 h-5 flex items-center justify-center rounded-full border border-blue-200 shrink-0 mt-0.5">
                                                {nivel}
                                            </span>
                                            <p className="leading-tight">{rubricaActual[nivel] || "Descripción no disponible."}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* --- PANEL DERECHO: TABLA ALINEADA --- */}
                <div className="lg:col-span-8">
                    {estudiantes.length > 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full animate-fade-in">
                            
                            {/* ENCABEZADO */}
                            <div className="p-4 bg-gray-50 border-b border-gray-200 grid grid-cols-12 gap-4 text-xs font-bold text-gray-500 uppercase items-center">
                                <div className="col-span-4 pl-2">Estudiante</div>
                                <div className="col-span-8 grid grid-cols-5">
                                    <div className="flex justify-center text-center">Nivel 1</div>
                                    <div className="flex justify-center text-center">Nivel 2</div>
                                    <div className="flex justify-center text-center">Nivel 3</div>
                                    <div className="flex justify-center text-center">Nivel 4</div>
                                    <div className="flex justify-center text-center">Nivel 5</div>
                                </div>
                            </div>

                            {/* CUERPO */}
                            <div className="flex-1 overflow-y-auto max-h-[600px]">
                                {estudiantes.map((est) => (
                                    <div key={est.estudiante_id} className={`grid grid-cols-12 gap-4 p-4 border-b border-gray-50 items-center transition ${est.nivel ? 'bg-blue-50/40' : 'hover:bg-gray-50'}`}>
                                        
                                        <div className="col-span-4 font-medium text-sm text-gray-800 truncate pl-2">
                                            {est.nombres}
                                        </div>
                                        
                                        <div className="col-span-8 grid grid-cols-5 items-center">
                                            {[1, 2, 3, 4, 5].map((nivel) => (
                                                <div key={nivel} className="flex justify-center">
                                                    <label className="cursor-pointer relative group">
                                                        <input 
                                                            type="radio" 
                                                            name={`nivel-${est.estudiante_id}`} 
                                                            className="peer sr-only"
                                                            checked={est.nivel === nivel}
                                                            onChange={() => handleNotaChange(est.estudiante_id, nivel)}
                                                        />
                                                        <div className={`
                                                            w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200
                                                            ${est.nivel === nivel 
                                                                ? 'bg-blue-600 text-white scale-110 shadow-md ring-2 ring-blue-200' 
                                                                : 'bg-white text-gray-400 border border-gray-200 hover:border-blue-400 hover:text-blue-500'}
                                                        `}>
                                                            {nivel}
                                                        </div>
                                                        <div className="absolute bottom-full mb-2 w-48 bg-gray-800 text-white text-[10px] p-2 rounded hidden group-hover:block z-20 pointer-events-none text-center shadow-xl left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            {rubricaActual[nivel] || "Nivel " + nivel}
                                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                                        </div>
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* FOOTER */}
                            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                                <span className="text-xs text-gray-500 font-medium">
                                    {pendientes > 0 ? `Faltan ${pendientes} estudiantes` : '¡Todos calificados!'}
                                </span>
                                <button onClick={handleGuardar} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition transform hover:scale-105">
                                    <CheckCircleIcon className="h-6 w-6"/> Guardar
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">
                            <UserGroupIcon className="h-16 w-16 mb-4 opacity-20"/>
                            <p className="text-lg font-medium">Lista de Estudiantes</p>
                            <p className="text-sm">Selecciona una materia y haz clic en "Cargar Estudiantes".</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EvaluacionDocente;