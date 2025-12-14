import { useState, useEffect } from 'react';
import api from '../services/api';
import Swal from 'sweetalert2';
import { 
    MagnifyingGlassIcon, 
    PlusIcon, 
    PencilSquareIcon, 
    TrashIcon,
    SparklesIcon,
    DocumentTextIcon, // Icono Excel/CSV
    CloudArrowUpIcon,
    FunnelIcon
} from '@heroicons/react/24/outline';

const GestionHabilidades = () => {
    // --- ESTADOS ---
    const [habilidades, setHabilidades] = useState([]);
    const [loading, setLoading] = useState(false);
    const [busqueda, setBusqueda] = useState('');
    
    // Modales
    const [showModal, setShowModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    
    // Formularios
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState({ id: null, nombre: '', definicion: '', actividades: '' });
    const [fileToUpload, setFileToUpload] = useState(null);

    // --- CARGA DE DATOS ---
    useEffect(() => {
        fetchHabilidades();
    }, []);

    const fetchHabilidades = async () => {
        setLoading(true);
        try {
            const res = await api.get('/habilidades');
            setHabilidades(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // --- ACCIONES CRUD ---
    const openModal = (habilidad = null) => {
        if (habilidad) {
            setIsEditing(true);
            setForm(habilidad); 
        } else {
            setIsEditing(false);
            setForm({ id: null, nombre: '', definicion: '', actividades: '' }); 
        }
        setShowModal(true);
    };

    const handleGuardar = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.put(`/habilidades/${form.id}`, form);
                Swal.fire('¡Actualizado!', 'Habilidad editada con éxito.', 'success');
            } else {
                await api.post('/habilidades', form);
                Swal.fire('¡Creado!', 'Nueva habilidad agregada.', 'success');
            }
            setShowModal(false);
            fetchHabilidades();
        } catch (error) {
            Swal.fire('Error', 'Verifique los datos (el nombre debe ser único).', 'error');
        }
    };

    const handleEliminar = (id) => {
        Swal.fire({
            title: '¿Eliminar habilidad?',
            text: "Esto podría afectar planificaciones existentes.",
            icon: 'warning',
            showCancelButton: true, confirmButtonColor: '#EF4444', confirmButtonText: 'Sí, eliminar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await api.delete(`/habilidades/${id}`);
                    fetchHabilidades();
                    Swal.fire('Eliminado', '', 'success');
                } catch (error) { Swal.fire('Error', 'No se pudo eliminar.', 'error'); }
            }
        });
    };

    // --- CARGA MASIVA ---
    const handleImportar = async (e) => {
        e.preventDefault();
        if (!fileToUpload) return Swal.fire('Atención', 'Seleccione un archivo CSV.', 'warning');

        const formData = new FormData();
        formData.append('file', fileToUpload);

        try {
            Swal.showLoading();
            const res = await api.post('/habilidades/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            Swal.fire('¡Éxito!', res.data.message, 'success');
            setShowImportModal(false);
            setFileToUpload(null);
            fetchHabilidades();
        } catch (error) {
            Swal.fire('Error', 'Formato incorrecto.', 'error');
        }
    };

    // --- FILTRADO INTELIGENTE ---
    const filteredData = habilidades.filter(item => 
        item.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        item.definicion.toLowerCase().includes(busqueda.toLowerCase()) ||
        (item.actividades && item.actividades.toLowerCase().includes(busqueda.toLowerCase()))
    );

    return (
        <div className="space-y-6 animate-fade-in">
            {/* CABECERA */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Catálogo de Habilidades</h2>
                    <p className="text-gray-500 text-sm mt-1">Gestión de competencias blandas, definiciones y actividades</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setShowImportModal(true)} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-medium shadow-sm transition text-sm">
                        <DocumentTextIcon className="h-5 w-5" />
                        Carga Masiva
                    </button>
                    <button onClick={() => openModal()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium shadow-sm transition text-sm">
                        <PlusIcon className="h-5 w-5" />
                        Nueva Habilidad
                    </button>
                </div>
            </div>

            {/* FILTROS */}
            <div className="flex bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="relative flex-1 max-w-lg">
                    <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input 
                        type="text" 
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                        placeholder="Buscar por habilidad, definición o actividad..." 
                        value={busqueda} 
                        onChange={(e) => setBusqueda(e.target.value)} 
                    />
                </div>
                {busqueda && (
                    <button onClick={() => setBusqueda('')} className="ml-4 text-sm text-red-600 hover:underline">Limpiar filtro</button>
                )}
            </div>

            {/* TABLA */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-1/4">Habilidad</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-1/3">Definición</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-1/3">Actividades Sugeridas</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-50">
                        {loading ? (
                            <tr><td colSpan="4" className="text-center py-10 text-gray-400">Cargando...</td></tr>
                        ) : filteredData.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="text-center py-12 text-gray-400">
                                    <FunnelIcon className="h-10 w-10 mx-auto mb-2 opacity-20"/> No se encontraron habilidades.
                                </td>
                            </tr>
                        ) : filteredData.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center border border-purple-200 flex-shrink-0">
                                            <SparklesIcon className="h-4 w-4" />
                                        </div>
                                        <span className="font-semibold text-gray-900 text-sm">{item.nombre}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-sm text-gray-600 line-clamp-3" title={item.definicion}>{item.definicion}</p>
                                </td>
                                <td className="px-6 py-4">
                                    {item.actividades ? (
                                        <p className="text-sm text-gray-500 bg-gray-50 p-2 rounded border border-gray-100 line-clamp-3 italic" title={item.actividades}>
                                            {item.actividades}
                                        </p>
                                    ) : (
                                        <span className="text-xs text-gray-400 italic">Sin actividades registradas</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => openModal(item)} className="text-blue-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-full transition" title="Editar">
                                            <PencilSquareIcon className="h-5 w-5" />
                                        </button>
                                        <button onClick={() => handleEliminar(item.id)} className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition" title="Eliminar">
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL CREAR/EDITAR */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-800">{isEditing ? 'Editar Habilidad' : 'Nueva Habilidad'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                        </div>
                        <form onSubmit={handleGuardar} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre de la Habilidad</label>
                                <input type="text" required placeholder="Ej: Pensamiento Crítico" className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-100"
                                    value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Definición</label>
                                <textarea required rows="3" placeholder="Descripción breve..." className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-100 resize-none"
                                    value={form.definicion} onChange={e => setForm({...form, definicion: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Actividades Sugeridas</label>
                                <textarea rows="3" placeholder="Ej: Debates, Estudios de caso, Role-play..." className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-100 resize-none"
                                    value={form.actividades} onChange={e => setForm({...form, actividades: e.target.value})} />
                                <p className="text-xs text-gray-400 mt-1">Separa las actividades con comas o puntos.</p>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg">Cancelar</button>
                                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">{isEditing ? 'Actualizar' : 'Guardar'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL IMPORTAR */}
            {showImportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 text-center">
                        <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CloudArrowUpIcon className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Importar Catálogo</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            Sube un archivo <b>.CSV</b> con la estructura:<br/>
                            <span className="font-mono bg-gray-100 px-1 text-xs">Nombre, Definición, Actividades</span>
                        </p>
                        <input type="file" accept=".csv" onChange={(e) => setFileToUpload(e.target.files[0])} 
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-green-50 file:text-green-700 hover:file:bg-green-100 mb-6" />
                        <div className="flex gap-3">
                            <button onClick={() => setShowImportModal(false)} className="flex-1 py-2 bg-gray-100 rounded-lg">Cancelar</button>
                            <button onClick={handleImportar} className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Subir</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionHabilidades;