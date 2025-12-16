import { useState, useEffect } from 'react';
import api from '../services/api';
import Swal from 'sweetalert2';
import { 
    CalendarDaysIcon, PlusCircleIcon, TrashIcon, 
    CheckCircleIcon, XCircleIcon, ClockIcon,
    PencilSquareIcon, ArrowPathIcon, XMarkIcon 
} from '@heroicons/react/24/outline';

const GestionPeriodos = () => {
    const [periodos, setPeriodos] = useState([]);
    const [form, setForm] = useState({ fecha_inicio: '', fecha_fin: '' });
    const [editingId, setEditingId] = useState(null); 

    useEffect(() => {
        fetchPeriodos();
    }, []);

    const fetchPeriodos = async () => {
        try {
            const res = await api.get('/periodos');
            setPeriodos(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    // --- CORRECCIÓN AQUÍ: Eliminamos la hora (los ceros) ---
    const formatearFecha = (fecha) => {
        if (!fecha) return '';
        // 1. split('T')[0] -> Quita la hora si viene formato ISO (2025-01-01T00:00:00)
        // 2. split(' ')[0] -> Quita la hora si viene formato SQL (2025-01-01 00:00:00)
        const soloFecha = fecha.split('T')[0].split(' ')[0];
        // 3. Reemplaza guiones por barras
        return soloFecha.replace(/-/g, '/'); 
    };

    const cargarEdicion = (periodo) => {
        setEditingId(periodo.id);
        // Al cargar en el input type="date", necesitamos el formato YYYY-MM-DD
        setForm({
            fecha_inicio: periodo.fecha_inicio.split('T')[0].split(' ')[0], 
            fecha_fin: periodo.fecha_fin.split('T')[0].split(' ')[0]
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelarEdicion = () => {
        setEditingId(null);
        setForm({ fecha_inicio: '', fecha_fin: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                // MODO ACTUALIZAR
                await api.put(`/periodos/${editingId}`, form);
                Swal.fire('Actualizado', 'El periodo ha sido modificado.', 'success');
            } else {
                // MODO CREAR
                await api.post('/periodos', form);
                Swal.fire({
                    icon: 'success',
                    title: 'Periodo Creado',
                    text: 'El nombre se ha generado automáticamente.'
                });
            }
            cancelarEdicion();
            fetchPeriodos();
        } catch (error) {
            Swal.fire('Error', 'Verifica que la fecha fin sea posterior al inicio.', 'error');
        }
    };

    const toggleEstado = async (id) => {
        try {
            await api.put(`/periodos/${id}/estado`);
            fetchPeriodos();
        } catch (error) {
            Swal.fire('Error', 'No se pudo cambiar el estado', 'error');
        }
    };

    const eliminar = async (id) => {
        const result = await Swal.fire({
            title: '¿Eliminar periodo?',
            text: "Esta acción borrará el periodo del sistema.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/periodos/${id}`);
                Swal.fire('Eliminado', 'El periodo ha sido eliminado.', 'success');
                fetchPeriodos();
            } catch (error) {
                Swal.fire('Error', 'No se puede eliminar porque tiene datos asociados.', 'error');
            }
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <CalendarDaysIcon className="h-7 w-7 text-blue-600"/> Gestión de Periodos Académicos
            </h2>

            {/* FORMULARIO INTELIGENTE (CREAR / EDITAR) */}
            <div className={`p-6 rounded-2xl shadow-sm border transition-colors duration-300 ${editingId ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`}>
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h3 className={`font-bold ${editingId ? 'text-red-700' : 'text-gray-700'}`}>
                        {editingId ? '✏️ Editando Periodo' : 'Nuevo Periodo'}
                    </h3>
                    {editingId && (
                        <button onClick={cancelarEdicion} className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 font-bold">
                            <XMarkIcon className="h-4 w-4"/> Cancelar
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Fecha Inicio</label>
                        <input 
                            type="date" 
                            required
                            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition bg-white"
                            value={form.fecha_inicio}
                            onChange={e => setForm({...form, fecha_inicio: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Fecha Fin</label>
                        <input 
                            type="date" 
                            required
                            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition bg-white"
                            value={form.fecha_fin}
                            onChange={e => setForm({...form, fecha_fin: e.target.value})}
                        />
                    </div>

                    <button type="submit" className={`font-bold py-2.5 px-6 rounded-xl transition shadow-md flex justify-center items-center gap-2 text-white ${editingId ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                        {editingId ? (
                            <><ArrowPathIcon className="h-5 w-5"/> Actualizar</>
                        ) : (
                            <><PlusCircleIcon className="h-5 w-5"/> Generar Periodo</>
                        )}
                    </button>
                </form>
            </div>

            {/* TABLA DE PERIODOS */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                        <tr>
                            <th className="p-4">Periodo (Automático)</th>
                            <th className="p-4">Duración (Año/Mes/Día)</th>
                            <th className="p-4 text-center">Estado</th>
                            <th className="p-4 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {periodos.map(p => (
                            <tr key={p.id} className={`transition ${editingId === p.id ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
                                <td className="p-4">
                                    <span className="font-bold text-gray-800 text-sm block">{p.nombre}</span>
                                </td>
                                
                                <td className="p-4">
                                    <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg w-fit border border-gray-200 font-mono">
                                        <ClockIcon className="h-4 w-4 text-gray-400"/>
                                        {/* AHORA SÍ SE VERÁ LIMPIO: 2025/10/01 */}
                                        {formatearFecha(p.fecha_inicio)} 
                                        <span className="text-gray-400 mx-1">➜</span> 
                                        {formatearFecha(p.fecha_fin)}
                                    </div>
                                </td>

                                <td className="p-4 text-center">
                                    <button 
                                        onClick={() => toggleEstado(p.id)}
                                        className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 mx-auto transition border ${
                                            p.activo 
                                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
                                            : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                                        }`}
                                    >
                                        {p.activo ? <CheckCircleIcon className="h-4 w-4"/> : <XCircleIcon className="h-4 w-4"/>}
                                        {p.activo ? 'Activo' : 'Inactivo'}
                                    </button>
                                </td>

                                <td className="p-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <button 
                                            onClick={() => cargarEdicion(p)}
                                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-lg transition"
                                            title="Editar"
                                        >
                                            <PencilSquareIcon className="h-5 w-5"/>
                                        </button>

                                        <button 
                                            onClick={() => eliminar(p.id)} 
                                            className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
                                            title="Eliminar"
                                        >
                                            <TrashIcon className="h-5 w-5"/>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default GestionPeriodos;