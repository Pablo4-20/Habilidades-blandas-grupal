import { useState, useEffect } from 'react';
import api from '../services/api';
import Swal from 'sweetalert2';
import { 
    MagnifyingGlassIcon, 
    PlusIcon, 
    DocumentTextIcon, 
    TrashIcon,
    PencilSquareIcon, // <--- IMPORTAMOS EL ICONO DE EDITAR
    UserGroupIcon,
    AcademicCapIcon,
    FunnelIcon,
    CloudArrowUpIcon 
} from '@heroicons/react/24/outline';

const GestionUsuarios = () => {
    // --- ESTADOS PRINCIPALES ---
    const [activeTab, setActiveTab] = useState('administrativo');
    const [dataList, setDataList] = useState([]); 
    const [loading, setLoading] = useState(false);
    
    // --- ESTADO DE EDICIÓN (NUEVO) ---
    const [editingId, setEditingId] = useState(null); 

    // --- ESTADOS DE FILTRO ---
    const [busqueda, setBusqueda] = useState('');
    const [filtroRol, setFiltroRol] = useState('');          
    const [filtroCarrera, setFiltroCarrera] = useState('');  
    const [filtroCiclo, setFiltroCiclo] = useState('');      

    // --- ESTADOS DE MODALES ---
    const [showModal, setShowModal] = useState(false);       
    const [showImportModal, setShowImportModal] = useState(false); 
    const [fileToUpload, setFileToUpload] = useState(null);  

    // --- ESTADOS DE FORMULARIOS ---
    const [formUser, setFormUser] = useState({ name: '', email: '', rol: 'docente', password: '' });
    const [formStudent, setFormStudent] = useState({ nombres: '', apellidos: '', email: '', carrera: 'Software', ciclo_actual: 'I' });

    // --- CARGA DE DATOS ---
    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            setLoading(true);
            try {
                const endpoint = activeTab === 'administrativo' ? '/users' : '/estudiantes';
                const res = await api.get(endpoint);
                if (isMounted) setDataList(Array.isArray(res.data) ? res.data : []);
            } catch (error) {
                console.error("Error cargando datos:", error);
                if (isMounted) setDataList([]);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchData();
        return () => { isMounted = false; };
    }, [activeTab]);

    // --- MANEJO DE PESTAÑAS ---
    const handleTabChange = (tab) => {
        if (tab === activeTab) return;
        setLoading(true);
        setDataList([]); 
        setBusqueda('');
        setFiltroRol('');
        setFiltroCarrera('');
        setFiltroCiclo('');
        setEditingId(null); // Limpiamos edición al cambiar tab
        setActiveTab(tab);
    };

    // --- LÓGICA DE FILTRADO ---
    const filteredData = dataList.filter(item => {
        if (!item) return false;
        const term = busqueda.toLowerCase();
        let matchesText = false;
        if (activeTab === 'administrativo') {
            matchesText = (item.name?.toLowerCase() || '').includes(term) || (item.email?.toLowerCase() || '').includes(term);
        } else {
            matchesText = (item.nombres?.toLowerCase() || '').includes(term) || (item.apellidos?.toLowerCase() || '').includes(term) || (item.email?.toLowerCase() || '').includes(term);
        }

        if (activeTab === 'administrativo') {
            const matchesRol = filtroRol ? item.rol === filtroRol : true;
            return matchesText && matchesRol;
        } else {
            const matchesCarrera = filtroCarrera ? item.carrera === filtroCarrera : true;
            const matchesCiclo = filtroCiclo ? item.ciclo_actual === filtroCiclo : true;
            return matchesText && matchesCarrera && matchesCiclo;
        }
    });

    // --- HELPER: RESETEAR FORMULARIOS ---
    const resetForms = () => {
        setFormUser({ name: '', email: '', rol: 'docente', password: '' });
        setFormStudent({ nombres: '', apellidos: '', email: '', carrera: 'Software', ciclo_actual: 'I' });
        setEditingId(null); // Importante: Salir del modo edición
        setShowModal(false);
    };

    // --- ACCIÓN: GUARDAR (CREAR O EDITAR) ---
    const handleGuardar = async (e) => {
        e.preventDefault();
        
        // Determinar endpoint base
        const baseEndpoint = activeTab === 'administrativo' ? '/users' : '/estudiantes';
        const payload = activeTab === 'administrativo' ? formUser : formStudent;

        try {
            if (editingId) {
                // --- MODO EDICIÓN (PUT) ---
                // Nota: Si el password está vacío en edición, el backend debería ignorarlo
                await api.put(`${baseEndpoint}/${editingId}`, payload);
                Swal.fire({ title: '¡Actualizado!', icon: 'success', timer: 1500, showConfirmButton: false });
            } else {
                // --- MODO CREACIÓN (POST) ---
                await api.post(baseEndpoint, payload);
                Swal.fire({ title: '¡Registrado!', icon: 'success', timer: 1500, showConfirmButton: false });
            }
            
            resetForms();
            // Recarga optimizada: volver a pedir los datos
            const res = await api.get(baseEndpoint);
            setDataList(res.data);

        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'No se pudo guardar la información. Verifique los datos.', 'error');
        }
    };

    // --- ACCIÓN: PREPARAR EDICIÓN ---
    const handleEditar = (item) => {
        setEditingId(item.id); // Marcamos que estamos editando este ID
        
        if (activeTab === 'administrativo') {
            setFormUser({
                name: item.name,
                email: item.email,
                rol: item.rol,
                password: '' // Dejamos vacío para no sobreescribir si no se cambia
            });
        } else {
            setFormStudent({
                nombres: item.nombres,
                apellidos: item.apellidos,
                email: item.email,
                carrera: item.carrera,
                ciclo_actual: item.ciclo_actual
            });
        }
        setShowModal(true);
    };

    // --- ACCIÓN: ELIMINAR ---
    const handleEliminar = (id) => {
        const endpoint = activeTab === 'administrativo' ? `/users/${id}` : `/estudiantes/${id}`;
        Swal.fire({
            title: '¿Eliminar?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#EF4444', confirmButtonText: 'Sí'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await api.delete(endpoint);
                    setDataList(prev => prev.filter(item => item.id !== id));
                    Swal.fire('Eliminado', '', 'success');
                } catch (error) { Swal.fire('Error', 'No se pudo eliminar.', 'error'); }
            }
        });
    };

    // --- ACCIÓN: IMPORTAR CSV ---
    const handleImportar = async (e) => {
        e.preventDefault();
        if (!fileToUpload) return Swal.fire('Atención', 'Seleccione un archivo CSV.', 'warning');
        const formData = new FormData();
        formData.append('file', fileToUpload);
        const endpoint = activeTab === 'administrativo' ? '/users/import' : '/estudiantes/import';
        try {
            Swal.showLoading();
            const res = await api.post(endpoint, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            Swal.fire('¡Éxito!', res.data.message, 'success');
            setShowImportModal(false);
            setFileToUpload(null);
            const resData = await api.get(activeTab === 'administrativo' ? '/users' : '/estudiantes');
            setDataList(resData.data);
        } catch (error) {
            Swal.fire('Error', 'Formato incorrecto o datos duplicados.', 'error');
        }
    };

    // --- HELPERS VISUALES ---
    const getInitials = (n) => n ? n.charAt(0).toUpperCase() : '?';
    const getRoleStyle = (r) => {
        if(r === 'admin') return 'bg-purple-100 text-purple-700 border-purple-200';
        if(r === 'coordinador') return 'bg-orange-100 text-orange-700 border-orange-200';
        return 'bg-green-100 text-green-700 border-green-200';
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* CABECERA */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h2>
                    <p className="text-gray-500 text-sm mt-1">Administración de personal y nómina estudiantil</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setShowImportModal(true)} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-medium shadow-sm transition text-sm">
                        <DocumentTextIcon className="h-5 w-5" /> Carga Masiva
                    </button>
                    <button onClick={() => { resetForms(); setShowModal(true); }} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium shadow-sm transition text-sm">
                        <PlusIcon className="h-5 w-5" />
                        {activeTab === 'administrativo' ? 'Nuevo Usuario' : 'Nuevo Estudiante'}
                    </button>
                </div>
            </div>

            {/* PESTAÑAS */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button onClick={() => handleTabChange('administrativo')} className={`py-4 px-1 border-b-2 font-medium text-sm flex gap-2 transition ${activeTab === 'administrativo' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                        <UserGroupIcon className="h-5 w-5" /> Personal Administrativo
                    </button>
                    <button onClick={() => handleTabChange('estudiantil')} className={`py-4 px-1 border-b-2 font-medium text-sm flex gap-2 transition ${activeTab === 'estudiantil' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                        <AcademicCapIcon className="h-5 w-5" /> Listado Estudiantil
                    </button>
                </nav>
            </div>

            {/* FILTROS AVANZADOS (SIN CAMBIOS) */}
            <div className="flex flex-col md:flex-row gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="relative flex-1">
                    <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input type="text" className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-100"
                        placeholder="Buscar por nombre, email..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                </div>
                {activeTab === 'administrativo' ? (
                    <div className="w-full md:w-48">
                        <select value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white outline-none text-sm text-gray-600">
                            <option value="">Todos los Roles</option><option value="docente">Docentes</option><option value="coordinador">Coordinadores</option><option value="admin">Administradores</option>
                        </select>
                    </div>
                ) : (
                    <>
                        <div className="w-full md:w-48">
                            <select value={filtroCarrera} onChange={(e) => setFiltroCarrera(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white outline-none text-sm text-gray-600">
                                <option value="">Todas las Carreras</option><option value="Software">Software</option><option value="TI">TI</option>
                            </select>
                        </div>
                        <div className="w-full md:w-32">
                            <select value={filtroCiclo} onChange={(e) => setFiltroCiclo(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white outline-none text-sm text-gray-600">
                                <option value="">Todos Ciclos</option><option value="I">I</option><option value="II">II</option><option value="III">III</option><option value="IV">IV</option>
                                <option value="V">V</option><option value="VI">VI</option><option value="VII">VII</option><option value="VIII">VIII</option>
                            </select>
                        </div>
                    </>
                )}
                {(busqueda || filtroRol || filtroCarrera || filtroCiclo) && (
                    <button onClick={() => { setBusqueda(''); setFiltroRol(''); setFiltroCarrera(''); setFiltroCiclo(''); }} className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">Limpiar</button>
                )}
            </div>

            {/* TABLA CON BOTÓN EDITAR */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-white">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">{activeTab === 'administrativo' ? 'Usuario' : 'Estudiante'}</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">{activeTab === 'administrativo' ? 'Rol' : 'Carrera'}</th>
                            {activeTab === 'estudiantil' && <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Ciclo</th>}
                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-50">
                        {loading ? <tr><td colSpan="4" className="text-center py-10 text-gray-400">Cargando...</td></tr> : filteredData.length === 0 ? (
                            <tr><td colSpan="4" className="text-center py-12 text-gray-400"><FunnelIcon className="h-10 w-10 mx-auto mb-2 opacity-20"/>Sin resultados.</td></tr>
                        ) : filteredData.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4 flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-sm border">{getInitials(item.name || item.nombres)}</div>
                                    <div>
                                        <div className="text-sm font-semibold text-gray-900">{activeTab === 'administrativo' ? item.name : `${item.nombres} ${item.apellidos}`}</div>
                                        <div className="text-xs text-gray-500">{item.email}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    {activeTab === 'administrativo' ? 
                                        <span className={`px-2 py-1 text-xs font-bold uppercase rounded-full border ${getRoleStyle(item.rol)}`}>{item.rol}</span> 
                                        : item.carrera}
                                </td>
                                {activeTab === 'estudiantil' && <td className="px-6 py-4 text-sm font-bold text-gray-600">{item.ciclo_actual}</td>}
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        {/* BOTÓN EDITAR */}
                                        <button onClick={() => handleEditar(item)} className="text-gray-400 hover:text-amber-600 p-2 hover:bg-amber-50 rounded-full transition" title="Editar">
                                            <PencilSquareIcon className="h-5 w-5" />
                                        </button>
                                        {/* BOTÓN ELIMINAR */}
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

            {/* MODAL REUTILIZABLE (CREAR / EDITAR) */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                        <h3 className="text-lg font-bold mb-4">
                            {editingId 
                                ? `Editar ${activeTab === 'administrativo' ? 'Usuario' : 'Estudiante'}` 
                                : `Nuevo ${activeTab === 'administrativo' ? 'Usuario' : 'Estudiante'}`
                            }
                        </h3>
                        
                        <form onSubmit={handleGuardar} className="space-y-4">
                            {activeTab === 'administrativo' ? (
                                <>
                                    <input required placeholder="Nombre Completo" className="w-full px-4 py-2 border rounded-lg" value={formUser.name} onChange={e => setFormUser({...formUser, name: e.target.value})} />
                                    <input required type="email" placeholder="Correo" className="w-full px-4 py-2 border rounded-lg" value={formUser.email} onChange={e => setFormUser({...formUser, email: e.target.value})} />
                                    <select className="w-full px-4 py-2 border rounded-lg bg-white" value={formUser.rol} onChange={e => setFormUser({...formUser, rol: e.target.value})}>
                                        <option value="docente">Docente</option><option value="coordinador">Coordinador</option><option value="admin">Administrador</option>
                                    </select>
                                    <input type="text" placeholder={editingId ? "Contraseña (dejar vacío para mantener)" : "Contraseña"} className="w-full px-4 py-2 border rounded-lg" value={formUser.password} onChange={e => setFormUser({...formUser, password: e.target.value})} />
                                </>
                            ) : (
                                <>
                                    <input required placeholder="Nombres" className="w-full px-4 py-2 border rounded-lg" value={formStudent.nombres} onChange={e => setFormStudent({...formStudent, nombres: e.target.value})} />
                                    <input required placeholder="Apellidos" className="w-full px-4 py-2 border rounded-lg" value={formStudent.apellidos} onChange={e => setFormStudent({...formStudent, apellidos: e.target.value})} />
                                    <input required type="email" placeholder="Correo Estudiantil" className="w-full px-4 py-2 border rounded-lg" value={formStudent.email} onChange={e => setFormStudent({...formStudent, email: e.target.value})} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <select className="w-full px-4 py-2 border rounded-lg bg-white" value={formStudent.carrera} onChange={e => setFormStudent({...formStudent, carrera: e.target.value})}>
                                            <option value="Software">Software</option><option value="TI">TI</option>
                                        </select>
                                        <select className="w-full px-4 py-2 border rounded-lg bg-white" value={formStudent.ciclo_actual} onChange={e => setFormStudent({...formStudent, ciclo_actual: e.target.value})}>
                                            <option value="I">I</option><option value="II">II</option><option value="III">III</option><option value="IV">IV</option><option value="V">V</option><option value="VI">VI</option><option value="VII">VII</option><option value="VIII">VIII</option>
                                        </select>
                                    </div>
                                </>
                            )}
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={resetForms} className="flex-1 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition">Cancelar</button>
                                <button type="submit" className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">
                                    {editingId ? 'Actualizar' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL IMPORTAR (SIN CAMBIOS) */}
            {showImportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 text-center">
                        <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CloudArrowUpIcon className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Importar {activeTab === 'administrativo' ? 'Usuarios' : 'Estudiantes'}</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            Sube un archivo <b>.CSV</b> con la estructura requerida.
                        </p>
                        <input type="file" accept=".csv" onChange={(e) => setFileToUpload(e.target.files[0])} 
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-green-50 file:text-green-700 hover:file:bg-green-100 mb-6" />
                        <div className="flex gap-3">
                            <button onClick={() => setShowImportModal(false)} className="flex-1 py-2 bg-gray-100 rounded-lg">Cancelar</button>
                            <button onClick={handleImportar} className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Subir Archivo</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionUsuarios;