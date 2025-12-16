import { useState, useEffect } from 'react';
import api from '../services/api';
import Swal from 'sweetalert2';
import CustomSelect from './ui/CustomSelect'; 
import { 
    MagnifyingGlassIcon, PlusIcon, PencilSquareIcon, TrashIcon,
    SparklesIcon, DocumentTextIcon, CloudArrowUpIcon, BookOpenIcon, FunnelIcon,
    CheckBadgeIcon, XMarkIcon
} from '@heroicons/react/24/outline';

// --- CATÁLOGO DE REFERENCIA ---
const CATALOGO_GUIA = {
    'Adaptabilidad': 'Capacidad de ajustarse de manera efectiva a cambios y nuevos desafíos.',
    'Aprender a Aprender': 'Capacidad de gestionar y optimizar el propio proceso de aprendizaje.',
    'Asertividad': 'Expresar opiniones y sentimientos de forma clara, directa y respetuosa.',
    'Creatividad': 'Capacidad de generar ideas originales y soluciones innovadoras.',
    'Pensamiento Crítico': 'Analizar y evaluar información de manera lógica, objetiva y racional.',
    'Liderazgo': 'Capacidad de influir, motivar e inspirar a otros para metas comunes.',
    'Toma de Decisiones': 'Seleccionar la mejor opción entre diversas alternativas.',
    'Trabajo en Equipo': 'Colaborar efectivamente con otros para alcanzar un objetivo común.',
    'Comunicación Efectiva': 'Transmitir ideas, pensamientos y necesidades de manera clara.',
    'Resolución de Problemas': 'Identificar y abordar desafíos de manera efectiva y lógica.',
    'Gestión del Tiempo': 'Planificar y priorizar tareas para optimizar recursos y plazos.'
};

const GestionHabilidades = () => {
    const [habilidades, setHabilidades] = useState([]);
    const [asignaturas, setAsignaturas] = useState([]); 
    const [loading, setLoading] = useState(false);
    const [busqueda, setBusqueda] = useState('');
    const [filtroAsignatura, setFiltroAsignatura] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [fileToUpload, setFileToUpload] = useState(null);

    // Formulario
    const [form, setForm] = useState({ 
        asignatura_id: '', 
        selected_skills: [] 
    });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [resHab, resAsig] = await Promise.all([
                api.get('/habilidades'),
                api.get('/asignaturas')
            ]);
            setHabilidades(Array.isArray(resHab.data) ? resHab.data : []);
            setAsignaturas(Array.isArray(resAsig.data) ? resAsig.data : []);
        } catch (error) { setHabilidades([]); } finally { setLoading(false); }
    };

    // --- AGRUPACIÓN ---
    const datosAgrupados = habilidades.reduce((acc, curr) => {
        const term = busqueda.toLowerCase();
        const matchText = curr.nombre.toLowerCase().includes(term) || (curr.asignatura?.nombre || '').toLowerCase().includes(term);
        const matchAsig = filtroAsignatura ? curr.asignatura_id == filtroAsignatura : true;

        if (matchText && matchAsig) {
            const idMateria = curr.asignatura_id;
            if (!acc[idMateria]) {
                acc[idMateria] = {
                    asignatura: curr.asignatura,
                    skills: []
                };
            }
            acc[idMateria].skills.push(curr);
        }
        return acc;
    }, {});

    const listaAgrupada = Object.values(datosAgrupados);

    // --- ACCIONES ---
    const toggleSkill = (skillName) => {
        setForm(prev => {
            const current = prev.selected_skills;
            if (current.includes(skillName)) {
                return { ...prev, selected_skills: current.filter(s => s !== skillName) };
            } else {
                return { ...prev, selected_skills: [...current, skillName] };
            }
        });
    };

    const openModal = (materiaId = '', skillsExistentes = []) => {
        if (materiaId) {
            const skillsNames = skillsExistentes.map(s => s.nombre);
            setForm({
                asignatura_id: materiaId,
                selected_skills: skillsNames
            });
        } else {
            setForm({ asignatura_id: '', selected_skills: [] });
        }
        setShowModal(true);
    };

   const handleGuardar = async (e) => {
        e.preventDefault();
        
        // Validaciones básicas
        if(!form.asignatura_id) return Swal.fire('Error', 'Selecciona una asignatura.', 'warning');
        if(form.selected_skills.length === 0) return Swal.fire('Error', 'Selecciona al menos una habilidad.', 'warning');

        try {
            // Preparamos los datos
            const payload = {
                asignatura_id: form.asignatura_id,
                // Mapeamos los nombres seleccionados a objetos con su definición
                habilidades: form.selected_skills.map(name => ({
                    nombre: name,
                    definicion: CATALOGO_GUIA[name]
                }))
            };
            
            // --- CAMBIO CLAVE ---
            // SIEMPRE usamos POST al endpoint '/habilidades'.
            // El backend ahora es lo suficientemente inteligente para borrar las viejas y crear las nuevas.
            await api.post('/habilidades', payload);
            
            Swal.fire({
                title: '¡Guardado!',
                text: 'Las habilidades se han actualizado correctamente.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });

            setShowModal(false);
            fetchData(); // Recargamos la tabla para ver los cambios
            
        } catch (error) { 
            console.error(error);
            Swal.fire('Error', 'No se pudo guardar la configuración.', 'error'); 
        }
    };

    // Eliminar una sola habilidad (botón X pequeño)
    const handleEliminarHabilidad = (id, nombre) => {
        Swal.fire({
            title: `¿Quitar ${nombre}?`, 
            text: "Se eliminará solo esta habilidad.", 
            icon: 'warning', 
            showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Sí, quitar', cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                await api.delete(`/habilidades/${id}`);
                fetchData();
                Swal.fire('Eliminado', '', 'success');
            }
        });
    };

    // Eliminar GRUPO COMPLETO (botón de la tabla)
    const handleEliminarGrupo = (nombreAsignatura, skills) => {
        Swal.fire({
            title: '¿Eliminar Grupo?',
            text: `Se eliminarán TODAS las habilidades asignadas a: ${nombreAsignatura}`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            confirmButtonText: 'Sí, eliminar todo'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    // Eliminamos todas las habilidades de ese grupo en paralelo
                    await Promise.all(skills.map(s => api.delete(`/habilidades/${s.id}`)));
                    fetchData();
                    Swal.fire('Grupo Eliminado', 'Se han quitado todas las asignaciones.', 'success');
                } catch (error) {
                    Swal.fire('Error', 'No se pudo completar la eliminación.', 'error');
                }
            }
        });
    };

    const handleImportar = async (e) => {
        if (e) e.preventDefault();
        if (!fileToUpload) return Swal.fire('Atención', 'Seleccione CSV.', 'warning');
        const formData = new FormData();
        formData.append('file', fileToUpload);
        try {
            Swal.fire({ title: 'Procesando...', didOpen: () => Swal.showLoading() });
            const res = await api.post('/habilidades/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            Swal.fire('¡Éxito!', res.data.message, 'success');
            setShowImportModal(false);
            setFileToUpload(null);
            fetchData();
        } catch (error) { Swal.fire('Error', 'Formato inválido.', 'error'); }
    };

    const opcionesAsignaturas = asignaturas.map(a => ({
        value: a.id,
        label: a.nombre,
        subtext: `${a.carrera} (${a.unidad_curricular})`
    }));

    return (
        <div className="space-y-6 animate-fade-in">
            {/* CABECERA */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Catálogo de Habilidades</h2>
                    <p className="text-gray-500 text-sm mt-1">Gestión de competencias agrupadas por asignatura</p>
                </div>
                <div className="flex gap-3">
                    <button type="button" onClick={() => setShowImportModal(true)} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-full font-bold shadow-md transition text-sm">
                        <DocumentTextIcon className="h-5 w-5" /> Carga Masiva
                    </button>
                    <button type="button" onClick={() => openModal()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-full font-bold shadow-md transition text-sm">
                        <PlusIcon className="h-5 w-5" /> Nueva Asignacion de Habilidad
                    </button>
                </div>
            </div>

            {/* FILTROS */}
            <div className="flex flex-col md:flex-row gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="relative flex-1">
                    <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input type="text" className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-100"
                        placeholder="Buscar materia o habilidad..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                </div>
                <div className="w-full md:w-64">
                    <CustomSelect placeholder="Filtrar por Materia" options={opcionesAsignaturas} value={filtroAsignatura} onChange={setFiltroAsignatura} searchable={true} />
                </div>
            </div>

            {/* TABLA AGRUPADA */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-1/3">Asignatura</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-2/3">Habilidades Asignadas</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-50">
                        {loading ? <tr><td colSpan="3" className="text-center py-10">Cargando...</td></tr> : 
                         listaAgrupada.length === 0 ? <tr><td colSpan="3" className="text-center py-10 text-gray-400"><FunnelIcon className="h-10 w-10 mx-auto mb-2 opacity-20"/>Sin datos.</td></tr> :
                         listaAgrupada.map((grupo) => (
                            <tr key={grupo.asignatura?.id} className="hover:bg-gray-50 transition group">
                                {/* COLUMNA 1: ASIGNATURA */}
                                <td className="px-6 py-4 align-top">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600 mt-1">
                                            <BookOpenIcon className="h-5 w-5"/>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-sm">{grupo.asignatura?.nombre}</h4>
                                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200 mt-1 inline-block">
                                                {grupo.asignatura?.carrera}
                                            </span>
                                        </div>
                                    </div>
                                </td>

                                {/* COLUMNA 2: LISTA DE HABILIDADES */}
                                <td className="px-6 py-4 align-top">
                                    <div className="flex flex-wrap gap-2">
                                        {grupo.skills.map(skill => (
                                            <div key={skill.id} className="flex items-center gap-1 pl-3 pr-1 py-1.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100 text-sm font-medium transition hover:shadow-sm hover:bg-purple-100">
                                                <SparklesIcon className="h-3 w-3"/>
                                                {skill.nombre}
                                                <button 
                                                    onClick={() => handleEliminarHabilidad(skill.id, skill.nombre)}
                                                    className="ml-2 p-0.5 rounded-full text-purple-400 hover:bg-red-100 hover:text-red-600 transition"
                                                    title="Quitar esta habilidad"
                                                >
                                                    <XMarkIcon className="h-4 w-4"/>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-2 italic pl-1">* Actividades a definir por docente.</p>
                                </td>

                                {/* COLUMNA 3: ACCIONES CON ICONOS */}
                                <td className="px-6 py-4 align-top text-right">
                                    <div className="flex justify-end gap-2">
                                        {/* BOTÓN EDITAR */}
                                        <button 
                                            onClick={() => openModal(grupo.asignatura.id, grupo.skills)}
                                            className="text-blue-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-full transition" 
                                            title="Editar Grupo"
                                        >
                                            <PencilSquareIcon className="h-5 w-5" />
                                        </button>
                                        
                                        {/* BOTÓN ELIMINAR GRUPO */}
                                        <button 
                                            onClick={() => handleEliminarGrupo(grupo.asignatura.nombre, grupo.skills)}
                                            className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition" 
                                            title="Eliminar todas las habilidades"
                                        >
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL (IGUAL AL ANTERIOR) */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 flex flex-col max-h-[90vh]">
                        <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
                            {form.asignatura_id && form.selected_skills.length > 0 ? 'Editar Habilidades' : 'Nueva Asignación'}
                        </h3>
                        <div className="space-y-5 overflow-y-auto flex-1 pr-2">
                            <CustomSelect 
                                label="Asignatura"
                                options={opcionesAsignaturas}
                                value={form.asignatura_id}
                                onChange={(val) => setForm({...form, asignatura_id: val})}
                                placeholder="Escribe para buscar asignatura..."
                                searchable={true}
                                icon={BookOpenIcon}
                                disabled={listaAgrupada.some(g => g.asignatura?.id === form.asignatura_id && form.selected_skills.length > 0)}
                            />
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                                    <SparklesIcon className="h-4 w-4 text-blue-600"/>
                                    Seleccione las Habilidades
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {Object.keys(CATALOGO_GUIA).map((skillName) => (
                                        <div key={skillName} 
                                            onClick={() => toggleSkill(skillName)}
                                            className={`
                                                cursor-pointer p-3 rounded-xl border transition-all duration-200 flex items-start gap-3
                                                ${form.selected_skills.includes(skillName) 
                                                    ? 'bg-blue-50 border-blue-500 shadow-sm ring-1 ring-blue-500' 
                                                    : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-gray-50'}
                                            `}
                                        >
                                            <div className={`
                                                w-5 h-5 rounded border flex items-center justify-center mt-0.5 transition-colors
                                                ${form.selected_skills.includes(skillName) ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'}
                                            `}>
                                                {form.selected_skills.includes(skillName) && <CheckBadgeIcon className="h-4 w-4 text-white"/>}
                                            </div>
                                            <div>
                                                <p className={`text-sm font-bold ${form.selected_skills.includes(skillName) ? 'text-blue-800' : 'text-gray-700'}`}>{skillName}</p>
                                                <p className="text-[10px] text-gray-500 leading-tight mt-1">{CATALOGO_GUIA[skillName]}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 pt-4 border-t mt-4 bg-white">
                            <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition">Cancelar</button>
                            <button type="button" onClick={handleGuardar} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg">Guardar Cambios</button>
                        </div>
                    </div>
                </div>
            )}

         {/* MODAL IMPORTAR */}
            {showImportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 text-center">
                        <CloudArrowUpIcon className="h-12 w-12 text-green-600 mx-auto mb-4 bg-green-50 p-2 rounded-full"/>
                        <h3 className="text-xl font-bold mb-2">Carga Masiva</h3>
                        
                        <div className="bg-slate-100 p-4 rounded-lg text-left mb-6 border border-slate-200">
                            <p className="text-xs font-bold text-slate-500 uppercase mb-2">Estructura del CSV:</p>
                            
                            {/* EJEMPLO VISUAL DE LA TABLA CSV */}
                            <div className="bg-white border border-slate-300 rounded overflow-hidden mb-2">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-slate-50 text-slate-600 font-bold border-b">
                                        <tr>
                                            <th className="p-1 border-r">Asignatura</th>
                                            <th className="p-1 border-r">Nombre Habilidad</th>
                                            <th className="p-1">Definición</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-slate-500 font-mono">
                                        <tr>
                                            <td className="p-1 border-r border-b">Matemática</td>
                                            <td className="p-1 border-r border-b">Liderazgo</td>
                                            <td className="p-1 border-b">Capacidad de...</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <p className="text-[10px] text-gray-400">
                                * El nombre de la asignatura debe ser exacto.<br/>
                                * Las actividades se dejarán vacías para el docente.
                            </p>
                        </div>

                        {/* INPUT DE ARCHIVO */}
                        <label className="block w-full cursor-pointer bg-green-50 border-2 border-dashed border-green-200 hover:bg-green-100 transition rounded-xl p-4 text-center mb-6">
                            <span className="text-sm font-bold text-green-700 block">
                                {fileToUpload ? fileToUpload.name : "Clic aquí para buscar archivo .CSV"}
                            </span>
                            <span className="text-xs text-green-600 mt-1">Soporta separadores coma (,) y punto y coma (;)</span>
                            <input 
                                type="file" 
                                accept=".csv,.txt" 
                                className="hidden" 
                                onChange={(e) => setFileToUpload(e.target.files[0])} 
                            />
                        </label>
                        
                        <div className="flex gap-3">
                            <button 
                                type="button" 
                                onClick={() => setShowImportModal(false)} 
                                className="flex-1 py-2 bg-gray-100 rounded-lg font-bold hover:bg-gray-200 transition"
                            >
                                Cancelar
                            </button>
                            <button 
                                type="button" 
                                onClick={handleImportar} 
                                className="flex-1 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition shadow-lg"
                            >
                                Subir Archivo
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionHabilidades;