import { useState, useEffect } from 'react';
import api from '../services/api';
import Swal from 'sweetalert2';
import { 
    MagnifyingGlassIcon, PlusIcon, PencilSquareIcon, TrashIcon,
    AcademicCapIcon, DocumentTextIcon, FunnelIcon, BookOpenIcon, CloudArrowUpIcon
} from '@heroicons/react/24/outline';

const GestionAsignaturas = () => {
    // Estados
    const [asignaturas, setAsignaturas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    
    // Filtros
    const [busqueda, setBusqueda] = useState('');
    const [filtroUnidad, setFiltroUnidad] = useState(''); // Filtro clave solicitado
    const [filtroCarrera, setFiltroCarrera] = useState('');

    // Formulario
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState({ id: null, nombre: '', carrera: 'Software', ciclo: 'I', unidad_curricular: 'Unidad Básica' });
    const [fileToUpload, setFileToUpload] = useState(null);

    useEffect(() => { fetchAsignaturas(); }, []);

    const fetchAsignaturas = async () => {
        setLoading(true);
        try {
            const res = await api.get('/asignaturas');
            setAsignaturas(Array.isArray(res.data) ? res.data : []);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    // --- FILTRADO ---
    const filteredData = asignaturas.filter(item => {
        const matchesText = item.nombre.toLowerCase().includes(busqueda.toLowerCase());
        const matchesUnidad = filtroUnidad ? item.unidad_curricular === filtroUnidad : true;
        const matchesCarrera = filtroCarrera ? item.carrera === filtroCarrera : true;
        return matchesText && matchesUnidad && matchesCarrera;
    });

    // --- ACCIONES ---
    const openModal = (item = null) => {
        if (item) {
            setIsEditing(true);
            setForm(item);
        } else {
            setIsEditing(false);
            setForm({ id: null, nombre: '', carrera: 'Software', ciclo: 'I', unidad_curricular: 'Unidad Básica' });
        }
        setShowModal(true);
    };

    const handleGuardar = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) await api.put(`/asignaturas/${form.id}`, form);
            else await api.post('/asignaturas', form);
            
            Swal.fire({ title: 'Guardado', icon: 'success', timer: 1500, showConfirmButton: false });
            setShowModal(false);
            fetchAsignaturas();
        } catch (error) { Swal.fire('Error', 'Verifique los datos.', 'error'); }
    };

    const handleEliminar = (id) => {
        Swal.fire({
            title: '¿Eliminar asignatura?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#EF4444', confirmButtonText: 'Sí'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await api.delete(`/asignaturas/${id}`);
                    fetchAsignaturas();
                    Swal.fire('Eliminado', '', 'success');
                } catch (error) { Swal.fire('Error', 'No se pudo eliminar.', 'error'); }
            }
        });
    };

    const handleImportar = async (e) => {
        e.preventDefault();
        if (!fileToUpload) return Swal.fire('Atención', 'Seleccione un archivo CSV.', 'warning');
        const formData = new FormData();
        formData.append('file', fileToUpload);

        try {
            Swal.showLoading();
            const res = await api.post('/asignaturas/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            Swal.fire('¡Éxito!', res.data.message, 'success');
            setShowImportModal(false);
            fetchAsignaturas();
        } catch (error) { Swal.fire('Error', 'Formato incorrecto.', 'error'); }
    };

    const getUnidadColor = (unidad) => {
        if(unidad.includes('Básica')) return 'bg-blue-100 text-blue-700 border-blue-200';
        if(unidad.includes('Profesional')) return 'bg-purple-100 text-purple-700 border-purple-200';
        return 'bg-orange-100 text-orange-700 border-orange-200';
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* CABECERA */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Gestión de Materias</h2>
                    <p className="text-gray-500 text-sm mt-1">Administración del plan de estudios por unidad curricular</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setShowImportModal(true)} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-medium shadow-sm transition text-sm">
                        <DocumentTextIcon className="h-5 w-5" /> Carga Masiva
                    </button>
                    <button onClick={() => openModal()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium shadow-sm transition text-sm">
                        <PlusIcon className="h-5 w-5" /> Nueva Materia
                    </button>
                </div>
            </div>

            {/* BARRA DE FILTROS */}
            <div className="flex flex-col md:flex-row gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="relative flex-1">
                    <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input type="text" className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-100"
                        placeholder="Buscar materia..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                </div>
                
                {/* Filtro Unidad Curricular */}
                <div className="w-full md:w-64">
                    <select value={filtroUnidad} onChange={(e) => setFiltroUnidad(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white outline-none text-sm text-gray-600">
                        <option value="">Todas las Unidades</option>
                        <option value="Unidad Básica">Unidad Básica</option>
                        <option value="Unidad Profesional">Unidad Profesional</option>
                        <option value="Unidad de Integración Curricular">Unidad de Integración</option>
                    </select>
                </div>

                {/* Filtro Carrera */}
                <div className="w-full md:w-48">
                    <select value={filtroCarrera} onChange={(e) => setFiltroCarrera(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white outline-none text-sm text-gray-600">
                        <option value="">Todas las Carreras</option>
                        <option value="Software">Software</option>
                        <option value="TI">TI</option>
                    </select>
                </div>

                {(busqueda || filtroUnidad || filtroCarrera) && (
                    <button onClick={() => { setBusqueda(''); setFiltroUnidad(''); setFiltroCarrera(''); }} className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">Limpiar</button>
                )}
            </div>

            {/* TABLA */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Asignatura</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Carrera / Ciclo</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Org. Curricular</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-50">
                        {loading ? <tr><td colSpan="4" className="text-center py-10 text-gray-400">Cargando...</td></tr> : 
                         filteredData.length === 0 ? <tr><td colSpan="4" className="text-center py-12 text-gray-400">Sin resultados.</td></tr> :
                         filteredData.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center border border-indigo-200">
                                            <BookOpenIcon className="h-4 w-4" />
                                        </div>
                                        <span className="font-semibold text-gray-900 text-sm">{item.nombre}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-900">{item.carrera}</div>
                                    <div className="text-xs text-gray-500">Ciclo {item.ciclo}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-bold uppercase rounded-full border ${getUnidadColor(item.unidad_curricular)}`}>
                                        {item.unidad_curricular}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right flex justify-end gap-2">
                                    <button onClick={() => openModal(item)} className="text-blue-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-full"><PencilSquareIcon className="h-5 w-5" /></button>
                                    <button onClick={() => handleEliminar(item.id)} className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full"><TrashIcon className="h-5 w-5" /></button>
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
                            <h3 className="text-lg font-bold text-gray-800">{isEditing ? 'Editar Materia' : 'Nueva Materia'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                        </div>
                        <form onSubmit={handleGuardar} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre Asignatura</label>
                                <input type="text" required className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-100"
                                    value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Carrera</label>
                                    <select className="w-full px-4 py-2 border rounded-lg bg-white outline-none" value={form.carrera} onChange={e => setForm({...form, carrera: e.target.value})}>
                                        <option value="Software">Software</option><option value="TI">TI</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ciclo</label>
                                    <select className="w-full px-4 py-2 border rounded-lg bg-white outline-none" value={form.ciclo} onChange={e => setForm({...form, ciclo: e.target.value})}>
                                        <option value="I">I</option><option value="II">II</option><option value="III">III</option><option value="IV">IV</option>
                                        <option value="V">V</option><option value="VI">VI</option><option value="VII">VII</option><option value="VIII">VIII</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Organización Curricular</label>
                                <select className="w-full px-4 py-2 border rounded-lg bg-white outline-none" value={form.unidad_curricular} onChange={e => setForm({...form, unidad_curricular: e.target.value})}>
                                    <option value="Unidad Básica">Unidad Básica</option>
                                    <option value="Unidad Profesional">Unidad Profesional</option>
                                    <option value="Unidad de Integración Curricular">Unidad de Integración Curricular</option>
                                </select>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 bg-gray-100 rounded-lg">Cancelar</button>
                                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg">Guardar</button>
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
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Importar Materias</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            CSV con formato:<br/>
                            <span className="font-mono bg-gray-100 px-1 text-xs">Nombre, Carrera, Ciclo, Unidad Curricular</span>
                        </p>
                        <input type="file" accept=".csv" onChange={(e) => setFileToUpload(e.target.files[0])} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-green-50 file:text-green-700 hover:file:bg-green-100 mb-6" />
                        <div className="flex gap-3">
                            <button onClick={() => setShowImportModal(false)} className="flex-1 py-2 bg-gray-100 rounded-lg">Cancelar</button>
                            <button onClick={handleImportar} className="flex-1 py-2 bg-green-600 text-white rounded-lg">Subir</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionAsignaturas;