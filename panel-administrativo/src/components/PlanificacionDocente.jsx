// src/components/PlanificacionDocente.jsx

import { useState, useEffect } from 'react';
import api from '../services/api';
import Swal from 'sweetalert2';
import CustomSelect from './ui/CustomSelect';
import { 
    BookOpenIcon, SparklesIcon, UserGroupIcon, 
    CheckBadgeIcon, CalendarDaysIcon, ArrowRightIcon,
    ClockIcon, CheckCircleIcon // Agregamos este ícono
} from '@heroicons/react/24/outline';

const PlanificacionDocente = () => {
    const [misAsignaturas, setMisAsignaturas] = useState([]);
    const [habilidades, setHabilidades] = useState([]);
    const [estudiantes, setEstudiantes] = useState([]);
    const [loading, setLoading] = useState(false);

    // Formulario
    const [form, setForm] = useState({
        asignatura_id: '',
        habilidad_blanda_id: '',
        parcial: '1',
        periodo_academico: '' 
    });

    // Helper: Buscar la materia completa para sacar datos visuales y de estado
    const materiaSeleccionada = misAsignaturas.find(a => a.id == form.asignatura_id);

    // Helper: Determinar si el parcial seleccionado ya tiene planificación
    const parcialSeleccionadoPlanificado = materiaSeleccionada 
        ? (form.parcial === '1' && materiaSeleccionada.planificacion_p1) || 
          (form.parcial === '2' && materiaSeleccionada.planificacion_p2) 
        : false;

    // 1. CARGA INICIAL
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const resAsig = await api.get('/docente/asignaturas');
                setMisAsignaturas(Array.isArray(resAsig.data) ? resAsig.data : []);

                const resHab = await api.get('/habilidades');
                setHabilidades(Array.isArray(resHab.data) ? resHab.data : []);
            } catch (error) {
                console.error("Error cargando datos", error);
            }
        };
        cargarDatos();
    }, []);

    // 2. LOGICA: AL CAMBIAR MATERIA, ACTUALIZAR PERIODO y mantener el parcial por defecto
    const handleCambioMateria = (val) => {
        const materia = misAsignaturas.find(m => m.id == val);
        
        // Determinar el primer parcial disponible
        let nuevoParcial = '1';
        if (materia) {
            if (materia.planificacion_p1 && !materia.planificacion_p2) {
                nuevoParcial = '2'; // Si P1 está listo, sugerir P2
            } else if (materia.planificacion_p1 && materia.planificacion_p2) {
                // Si ambos están listos, mantener P1 o el que estuviera seleccionado
            }
        }

        setForm({
            ...form,
            asignatura_id: val,
            periodo_academico: materia ? materia.periodo : '',
            parcial: nuevoParcial // Usamos el nuevo parcial sugerido
        });
    };
    
    // Manejar el cambio de parcial
    const handleCambioParcial = (val) => {
        setForm(prev => ({ ...prev, parcial: val }));
    }


    // 3. CARGAR ESTUDIANTES
    useEffect(() => {
        if (form.asignatura_id) {
            setLoading(true);
            api.get(`/docente/estudiantes/${form.asignatura_id}`)
                .then(res => setEstudiantes(res.data))
                .catch(() => setEstudiantes([]))
                .finally(() => setLoading(false));
        } else {
            setEstudiantes([]);
        }
    }, [form.asignatura_id]);

    // 4. GUARDAR
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (parcialSeleccionadoPlanificado) {
             Swal.fire('Atención', `El Parcial ${form.parcial} de esta materia ya fue planificado.`, 'warning');
             return;
        }
        
        const user = JSON.parse(localStorage.getItem('user'));
        
        try {
            await api.post('/planificaciones', {
                ...form,
                docente_id: user.id
            });
            
            Swal.fire({
                title: '¡Planificación Exitosa!',
                text: `Habilidad asignada para el Parcial ${form.parcial} del periodo ${form.periodo_academico}.`,
                icon: 'success',
                confirmButtonColor: '#2563EB'
            });
            
            // Actualizar la lista de asignaturas para reflejar la nueva planificación
            const resAsig = await api.get('/docente/asignaturas');
            setMisAsignaturas(Array.isArray(resAsig.data) ? resAsig.data : []);
            
            // Resetear el formulario (manteniendo la asignatura y el nuevo estado)
            setForm(prev => ({ 
                ...prev, 
                habilidad_blanda_id: '',
            }));
            
        } catch (error) {
            const msg = error.response?.data?.message || 'Error al guardar.';
            Swal.fire('Atención', msg, 'warning');
        }
    };

    // Opciones para CustomSelect
    const opcionesAsignaturas = misAsignaturas.map(a => {
        const estadoP1 = a.planificacion_p1 ? 'P1 ✔️' : 'P1 ❌';
        const estadoP2 = a.planificacion_p2 ? 'P2 ✔️' : 'P2 ❌';
        const estaCompleta = a.planificacion_p1 && a.planificacion_p2;

        return {
            value: a.id,
            label: a.nombre,
            subtext: `${a.carrera} (${a.paralelo}) - ${a.periodo} | ${estadoP1} | ${estadoP2}`,
            icon: estaCompleta ? CheckCircleIcon : null, // Muestra un ícono si está completa
            iconClass: 'text-green-500' // Color para el ícono de completado
        };
    });

    const opcionesParciales = [
        { 
            value: '1', 
            label: 'Primer Parcial',
            // Deshabilitar si ya está planificado
            disabled: materiaSeleccionada ? materiaSeleccionada.planificacion_p1 : false
        },
        { 
            value: '2', 
            label: 'Segundo Parcial',
            // Deshabilitar si ya está planificado
            disabled: materiaSeleccionada ? materiaSeleccionada.planificacion_p2 : false
        }
    ];

    const opcionesHabilidades = habilidades.map(h => ({
        value: h.id,
        label: h.nombre
    }));

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Mis Habilidades</h2>
                <p className="text-gray-500 text-sm mt-1">Planifica la competencia blanda para cada parcial.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* --- CONFIGURACIÓN --- */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden h-fit">
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-50 rounded-full opacity-50 blur-xl"></div>

                        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                            
                            <CustomSelect 
                                label="Selecciona tu Asignatura"
                                icon={BookOpenIcon}
                                placeholder="-- Elegir materia --"
                                options={opcionesAsignaturas}
                                value={form.asignatura_id}
                                onChange={handleCambioMateria}
                            />
                            {misAsignaturas.length === 0 && (
                                <p className="text-xs text-orange-500 ml-1">* No tienes asignaciones.</p>
                            )}
                            {materiaSeleccionada && materiaSeleccionada.planificacion_p1 && materiaSeleccionada.planificacion_p2 && (
                                <div className="p-3 bg-green-50 rounded-xl border border-green-100 text-sm text-green-700 animate-fade-in font-medium flex items-center gap-2">
                                    <CheckCircleIcon className="h-5 w-5"/>
                                    ¡Planificación completa! Ambos parciales han sido asignados.
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className={`transition-all duration-300 ${form.asignatura_id ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                                    <CustomSelect 
                                        label="Parcial a Evaluar"
                                        icon={ClockIcon}
                                        options={opcionesParciales}
                                        value={form.parcial}
                                        onChange={handleCambioParcial}
                                        disabled={!form.asignatura_id}
                                    />
                                    {parcialSeleccionadoPlanificado && (
                                        <p className="text-xs text-red-500 ml-1 mt-1 font-medium">
                                            * Este parcial ya fue planificado.
                                        </p>
                                    )}
                                </div>

                                <div className={`transition-all duration-300 ${form.asignatura_id ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                                    <CustomSelect 
                                        label="Habilidad"
                                        icon={SparklesIcon}
                                        placeholder="-- Elegir habilidad --"
                                        options={opcionesHabilidades}
                                        value={form.habilidad_blanda_id}
                                        onChange={(val) => setForm({...form, habilidad_blanda_id: val})}
                                        disabled={!form.asignatura_id}
                                    />
                                </div>
                            </div>

                            {form.habilidad_blanda_id && (
                                <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 text-sm text-purple-800 animate-fade-in">
                                    <strong>Definición:</strong> {habilidades.find(h => h.id == form.habilidad_blanda_id)?.definicion}
                                </div>
                            )}

                            {/* Campo de Periodo (Automático) */}
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Periodo Académico (Automático)</label>
                                <div className="flex items-center gap-2 text-gray-700 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 w-full text-sm font-medium">
                                    <CalendarDaysIcon className="h-5 w-5 text-blue-500"/>
                                    {form.periodo_academico || "Selecciona una materia..."}
                                </div>
                            </div>

                            <div className="pt-2">
                                <button 
                                    type="submit" 
                                    disabled={!form.asignatura_id || !form.habilidad_blanda_id || !form.periodo_academico || parcialSeleccionadoPlanificado}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-100 transition transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                                >
                                    <CheckBadgeIcon className="h-6 w-6" />
                                    {parcialSeleccionadoPlanificado ? 'Parcial Ya Planificado' : 'Guardar Planificación'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* --- NÓMINA --- */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col overflow-hidden min-h-[500px]">
                        <div className="p-5 border-b border-gray-100 bg-gray-50">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <UserGroupIcon className="h-5 w-5 text-blue-600"/>
                                Nómina de Estudiantes
                            </h3>
                            {materiaSeleccionada && (
                                <p className="text-xs text-gray-500 mt-1">
                                    {materiaSeleccionada.carrera} - Ciclo {materiaSeleccionada.ciclo}
                                </p>
                            )}
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-0 max-h-[500px]">
                            {loading ? (
                                <div className="p-10 text-center text-gray-400 text-sm">Cargando lista...</div>
                            ) : !form.asignatura_id ? (
                                <div className="p-10 text-center text-gray-400 text-sm flex flex-col items-center mt-10">
                                    <ArrowRightIcon className="h-8 w-8 mb-2 opacity-20"/>
                                    Selecciona una asignatura.
                                </div>
                            ) : estudiantes.length === 0 ? (
                                <div className="p-8 text-center text-red-400 text-sm bg-red-50 m-4 rounded-xl border border-red-100">
                                    Sin estudiantes registrados.
                                </div>
                            ) : (
                                <ul className="divide-y divide-gray-50">
                                    {estudiantes.map((est, index) => (
                                        <li key={est.id} className="px-5 py-3 flex items-center gap-3 hover:bg-blue-50 transition">
                                            <span className="text-xs font-bold text-gray-300 w-5">{index + 1}</span>
                                            <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold border border-indigo-200">
                                                {est.nombres.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">{est.nombres} {est.apellidos}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        
                        <div className="p-3 bg-gray-50 border-t border-gray-100 text-center text-xs text-gray-500 font-medium">
                            Total: {estudiantes.length} alumnos
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PlanificacionDocente;