import { useState, useEffect } from 'react';
import api from '../services/api';
import Swal from 'sweetalert2';
import CustomSelect from './ui/CustomSelect'; 
import { 
    UserIcon, BookOpenIcon, TrashIcon, PlusIcon, AcademicCapIcon,
    MagnifyingGlassIcon, FunnelIcon, CalendarDaysIcon, Squares2X2Icon
} from '@heroicons/react/24/outline';

const AsignarMaterias = () => {
    // --- ESTADOS DE DATOS ---
    const [asignaciones, setAsignaciones] = useState([]);
    const [docentes, setDocentes] = useState([]);
    const [materias, setMaterias] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // --- ESTADOS DE FILTROS ---
    const [busqueda, setBusqueda] = useState('');
    const [filtroCiclo, setFiltroCiclo] = useState('');
    const [filtroCarrera, setFiltroCarrera] = useState(''); // Nuevo
    const [filtroPeriodo, setFiltroPeriodo] = useState(''); // Nuevo

    // --- ESTADO DEL FORMULARIO ---
    const [form, setForm] = useState({
        docente_id: '',
        asignatura_id: '',
        paralelo: 'A'
    });
    // Manejo de fechas para el periodo
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');

    // --- CARGA DE DATOS ---
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const resAsig = await api.get('/asignaciones');
            setAsignaciones(resAsig.data);

            const resAux = await api.get('/asignaciones/auxiliares');
            setDocentes(resAux.data.docentes);
            setMaterias(resAux.data.asignaturas);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // --- GENERAR OPCIONES DE FILTRO DINÁMICAS ---
    // Extraemos las carreras y periodos únicos que existen en las asignaciones
    const uniqueCarreras = [...new Set(asignaciones.map(a => a.asignatura?.carrera))].filter(Boolean);
    const uniquePeriodos = [...new Set(asignaciones.map(a => a.periodo))].filter(Boolean);

    const opcionesCarrerasFilter = uniqueCarreras.map(c => ({ value: c, label: c }));
    const opcionesPeriodosFilter = uniquePeriodos.map(p => ({ value: p, label: p }));

    // --- LÓGICA: MATERIAS DISPONIBLES ---
    const materiasDisponibles = materias.filter(materia => {
        // Construimos el string de periodo actual para comparar
        const periodoActual = (fechaInicio && fechaFin) ? `${fechaInicio} al ${fechaFin}` : '';
        
        // Si no hay fechas seleccionadas, mostramos todas (o ninguna, según prefieras)
        if (!periodoActual) return true;

        const estaOcupada = asignaciones.some(asignacion => 
            asignacion.asignatura_id === materia.id && 
            asignacion.periodo === periodoActual && 
            asignacion.paralelo === form.paralelo
        );
        return !estaOcupada;
    });

    // --- LÓGICA: FILTRADO DE TABLA (Buscador + Ciclo + Carrera + Periodo) ---
    const asignacionesFiltradas = asignaciones.filter(item => {
        const term = busqueda.toLowerCase();
        
        // 1. Texto
        const matchesSearch = (
            (item.docente?.name || '').toLowerCase().includes(term) || 
            (item.asignatura?.nombre || '').toLowerCase().includes(term)
        );
        // 2. Ciclo
        const matchesCiclo = filtroCiclo ? item.asignatura?.ciclo === filtroCiclo : true;
        // 3. Carrera
        const matchesCarrera = filtroCarrera ? item.asignatura?.carrera === filtroCarrera : true;
        // 4. Periodo
        const matchesPeriodo = filtroPeriodo ? item.periodo === filtroPeriodo : true;

        return matchesSearch && matchesCiclo && matchesCarrera && matchesPeriodo;
    });

    // --- ACCIONES ---
    const handleGuardar = async (e) => {
        e.preventDefault();
        if(!form.docente_id || !form.asignatura_id || !fechaInicio || !fechaFin) {
            return Swal.fire('Atención', 'Complete todos los campos (Docente, Materia y Fechas)', 'warning');
        }

        // Construir el string del periodo
        const periodoString = `${fechaInicio} al ${fechaFin}`;

        try {
            await api.post('/asignaciones', {
                ...form,
                periodo: periodoString
            });
            Swal.fire({ title: 'Asignado', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
            fetchData(); 
            setForm({...form, asignatura_id: ''}); // Limpiar materia para seguir asignando
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Error al asignar', 'error');
        }
    };

    const handleEliminar = (id) => {
        Swal.fire({
            title: '¿Quitar asignación?', text: "El docente dejará de ver esta materia.", icon: 'warning',
            showCancelButton: true, confirmButtonColor: '#EF4444', confirmButtonText: 'Sí, quitar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await api.delete(`/asignaciones/${id}`);
                    setAsignaciones(prev => prev.filter(a => a.id !== id));
                    Swal.fire('Eliminado', '', 'success');
                } catch (error) { Swal.fire('Error', 'No se pudo eliminar.', 'error'); }
            }
        });
    };

    const getInitials = (n) => n ? n.charAt(0).toUpperCase() : '?';

    // Opciones estáticas para selectores
    const opcionesDocentes = docentes.map(d => ({ value: d.id, label: d.name, subtext: d.email }));
    const opcionesMaterias = materiasDisponibles.map(m => ({ value: m.id, label: m.nombre, subtext: `${m.carrera} - Ciclo ${m.ciclo}` }));
    const opcionesParalelos = [{ value: 'A', label: 'Paralelo A' }, { value: 'B', label: 'Paralelo B' }, { value: 'C', label: 'Paralelo C' }];
    const opcionesCiclos = [{ value: '', label: 'Todos Ciclos' }, { value: 'I', label: 'I' }, { value: 'II', label: 'II' }, { value: 'III', label: 'III' }, { value: 'IV', label: 'IV' }, { value: 'V', label: 'V' }, { value: 'VI', label: 'VI' }, { value: 'VII', label: 'VII' }, { value: 'VIII', label: 'VIII' }];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* CABECERA */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Asignación de Carga Académica</h2>
                <p className="text-gray-500 text-sm mt-1">Vincula docentes a las asignaturas por periodo.</p>
            </div>

            {/* --- TARJETA DE ASIGNACIÓN --- */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
                    <PlusIcon className="h-5 w-5" /> Nueva Asignación
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    
                    {/* 1. CALENDARIO (Dos inputs de fecha) */}
                    <div className="md:col-span-3">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-2">
                            <CalendarDaysIcon className="h-4 w-4 text-blue-600"/> Periodo Académico
                        </label>
                        <div className="flex items-center gap-2">
                            <input 
                                type="date" 
                                className="w-full px-3 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none text-xs text-gray-600"
                                value={fechaInicio}
                                onChange={e => setFechaInicio(e.target.value)}
                            />
                            <span className="text-gray-400">-</span>
                            <input 
                                type="date" 
                                className="w-full px-3 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none text-xs text-gray-600"
                                value={fechaFin}
                                onChange={e => setFechaFin(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* 2. Paralelo */}
                    <div className="md:col-span-2">
                        <CustomSelect label="Paralelo" icon={Squares2X2Icon} options={opcionesParalelos} value={form.paralelo} onChange={(val) => setForm({...form, paralelo: val})} />
                    </div>

                    {/* 3. Docente */}
                    <div className="md:col-span-3">
                        <CustomSelect label="Docente" icon={UserIcon} placeholder="-- Docente --" options={opcionesDocentes} value={form.docente_id} onChange={(val) => setForm({...form, docente_id: val})} />
                    </div>

                    {/* 4. Asignatura */}
                    <div className="md:col-span-4">
                        <CustomSelect label={`Asignatura (${opcionesMaterias.length} Disp.)`} icon={BookOpenIcon} placeholder="-- Materia --" options={opcionesMaterias} value={form.asignatura_id} onChange={(val) => setForm({...form, asignatura_id: val})} />
                    </div>

                    {/* Botón */}
                    <div className="md:col-span-12 flex justify-end mt-2">
                        <button onClick={handleGuardar} disabled={!form.asignatura_id || !form.docente_id} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-100 transition transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                            Asignar Carga
                        </button>
                    </div>
                </div>
            </div>

            {/* --- BARRA DE FILTROS --- */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-4 md:space-y-0 md:flex md:gap-4">
                {/* Buscador */}
                <div className="relative flex-1">
                    <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input type="text" className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl bg-white text-sm outline-none focus:ring-2 focus:ring-blue-100"
                        placeholder="Buscar por docente o materia..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                </div>

                {/* Filtros Dropdown */}
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                    <div className="min-w-[140px]">
                        <CustomSelect placeholder="Ciclo" options={opcionesCiclos} value={filtroCiclo} onChange={setFiltroCiclo} />
                    </div>
                    <div className="min-w-[160px]">
                        <CustomSelect placeholder="Carrera" options={opcionesCarrerasFilter} value={filtroCarrera} onChange={setFiltroCarrera} />
                    </div>
                    <div className="min-w-[180px]">
                        <CustomSelect placeholder="Periodo" options={opcionesPeriodosFilter} value={filtroPeriodo} onChange={setFiltroPeriodo} />
                    </div>
                </div>

                {/* Botón Limpiar */}
                {(busqueda || filtroCiclo || filtroCarrera || filtroPeriodo) && (
                    <button onClick={() => { setBusqueda(''); setFiltroCiclo(''); setFiltroCarrera(''); setFiltroPeriodo(''); }}
                        className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl font-medium transition border border-red-200 bg-white">
                        Limpiar
                    </button>
                )}
            </div>

            {/* --- TABLA --- */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Docente</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Materia Asignada</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Periodo / Detalle</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-50">
                        {loading ? (
                            <tr><td colSpan="4" className="text-center py-10 text-gray-400">Cargando...</td></tr>
                        ) : asignacionesFiltradas.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="text-center py-12 text-gray-400">
                                    <FunnelIcon className="h-10 w-10 mx-auto mb-2 opacity-20"/> 
                                    Sin resultados.
                                </td>
                            </tr>
                        ) : asignacionesFiltradas.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm border border-orange-200">
                                        {getInitials(item.docente?.name)}
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900">{item.docente?.name}</span>
                                </td>
                                
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
                                            <AcademicCapIcon className="h-4 w-4"/>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{item.asignatura?.nombre}</p>
                                            <p className="text-xs text-gray-500">{item.asignatura?.carrera}</p>
                                        </div>
                                    </div>
                                </td>

                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs font-bold text-gray-600 flex items-center gap-1">
                                            <CalendarDaysIcon className="h-3 w-3"/> {item.periodo}
                                        </span>
                                        <div className="flex gap-2">
                                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-bold border border-blue-100">
                                                Ciclo {item.asignatura?.ciclo}
                                            </span>
                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold border border-gray-200">
                                                Paralelo "{item.paralelo}"
                                            </span>
                                        </div>
                                    </div>
                                </td>

                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleEliminar(item.id)} className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition" title="Quitar asignación">
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AsignarMaterias;