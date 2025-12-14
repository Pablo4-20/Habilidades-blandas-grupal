import { useState, useEffect } from 'react';
import api from '../services/api';
import CustomSelect from './ui/CustomSelect'; // Usamos tu componente elegante
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
    PresentationChartLineIcon, PrinterIcon, FunnelIcon,
    CheckCircleIcon, XCircleIcon, ClockIcon
} from '@heroicons/react/24/outline';
import logoIzq from '../assets/facultad.png'; 
import logoDer from '../assets/software.png';

const ReportesCoordinador = () => {
    const [reporteData, setReporteData] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Filtros
    const [filtroCarrera, setFiltroCarrera] = useState('Todas');

    // Opciones para el select
    const opcionesCarrera = [
        { value: 'Todas', label: 'Todas las Carreras' },
        { value: 'Software', label: 'Software' },
        { value: 'TI', label: 'Tecnologías de la Información' }
    ];

    useEffect(() => {
        cargarReporte();
    }, [filtroCarrera]);

    const cargarReporte = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/reportes/general?carrera=${filtroCarrera}`);
            setReporteData(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // --- GENERAR PDF CONSOLIDADO ---
    const descargarPDF = () => {
        const doc = new jsPDF('l'); // 'l' = Landscape (Horizontal) para que quepa la tabla
        
      // --- CONFIGURACIÓN DE LOGOS ---
    const imgWidth = 25; // Ancho del logo en mm
    const imgHeight = 25; // Alto del logo en mm
    const marginTop = 5;  // Margen superior
    const marginLeft = 15; // Margen izquierdo
    const pageWidth = doc.internal.pageSize.getWidth(); // Obtiene 297mm dinámicamente

    // 1. Logo Izquierdo
    // Parámetros: imagen, formato, x, y, ancho, alto
    try {
        doc.addImage(logoIzq, 'PNG', marginLeft, marginTop, imgWidth, imgHeight);
    } catch (e) {
        console.warn("No se pudo cargar el logo izquierdo", e);
    }

    // 2. Logo Derecho
    // Calculamos X: AnchoPagina - Margen - AnchoImagen
    const xLogoDer = pageWidth - marginLeft - imgWidth;
    try {
        doc.addImage(logoDer, 'PNG', xLogoDer, marginTop, imgWidth, imgHeight);
    } catch (e) {
        console.warn("No se pudo cargar el logo derecho", e);
    }

    // --- ENCABEZADO DE TEXTO ---
    // Ajustamos la Y del texto para que quede alineado con los logos
    doc.setFontSize(14);
    doc.setTextColor(40, 53, 147);
    // Centrado en X (aprox 148.5)
    doc.text("UNIVERSIDAD ESTATAL DE BOLIVAR", pageWidth / 2, 15, { align: "center" });
    
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text("REPORTE GENERAL DE CUMPLIMIENTO - HABILIDADES BLANDAS", pageWidth / 2, 25, { align: "center" });
    
    

        // Tabla
        const cuerpo = reporteData.map(r => [
            r.carrera,
            r.ciclo,
            r.asignatura,
            r.docente,
            r.habilidad,
            r.estado,
            r.progreso + '%'
        ]);

        autoTable(doc, {
            startY: 40,
            head: [['Carrera', 'Ciclo', 'Asignatura', 'Docente', 'Habilidad', 'Estado', 'Avance']],
            body: cuerpo,
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185], halign: 'center' },
            styles: { fontSize: 8, halign: 'center' },
            columnStyles: { 
                2: { halign: 'left' }, // Asignatura
                3: { halign: 'left' }  // Docente
            }
        });

        doc.save(`Reporte_General_${filtroCarrera}.pdf`);
    };

    // Helpers de estilo
    const getBadgeColor = (estado) => {
        switch(estado) {
            case 'Completado': return 'bg-green-100 text-green-700 border-green-200';
            case 'En Proceso': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Planificado': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            default: return 'bg-red-50 text-red-600 border-red-100'; // Sin Planificar
        }
    };

    const getIcon = (estado) => {
        switch(estado) {
            case 'Completado': return <CheckCircleIcon className="h-4 w-4"/>;
            case 'Sin Planificar': return <XCircleIcon className="h-4 w-4"/>;
            default: return <ClockIcon className="h-4 w-4"/>;
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* CABECERA */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Reportes Generales</h2>
                    <p className="text-gray-500 text-sm mt-1">Monitoreo del cumplimiento por carrera y asignatura.</p>
                </div>
                <button onClick={descargarPDF} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-red-100 transition flex items-center gap-2 transform active:scale-95">
                    <PrinterIcon className="h-5 w-5"/> Exportar PDF
                </button>
            </div>

            {/* FILTROS Y RESUMEN */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
                    <CustomSelect 
                        label="Filtrar por Carrera"
                        icon={FunnelIcon}
                        options={opcionesCarrera}
                        value={filtroCarrera}
                        onChange={setFiltroCarrera}
                    />
                </div>
                
                {/* Tarjetas de Resumen Rápido */}
                <div className="md:col-span-3 grid grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-l-4 border-l-green-500 border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase">Completados</p>
                        <p className="text-2xl font-bold text-green-600">
                            {reporteData.filter(r => r.estado === 'Completado').length}
                        </p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-l-4 border-l-blue-500 border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase">En Proceso</p>
                        <p className="text-2xl font-bold text-blue-600">
                            {reporteData.filter(r => r.estado === 'En Proceso').length}
                        </p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-l-4 border-l-red-400 border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase">Sin Planificar</p>
                        <p className="text-2xl font-bold text-red-500">
                            {reporteData.filter(r => r.estado === 'Sin Planificar').length}
                        </p>
                    </div>
                </div>
            </div>

            {/* TABLA DE CUMPLIMIENTO */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex items-center gap-2">
                    <PresentationChartLineIcon className="h-5 w-5 text-gray-500"/>
                    <h3 className="font-bold text-gray-800">Matriz de Cumplimiento</h3>
                </div>
                
                <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Asignatura / Carrera</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Docente</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Habilidad</th>
                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Estado</th>
                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Avance</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-50">
                        {loading ? (
                            <tr><td colSpan="5" className="text-center py-10 text-gray-400">Cargando datos...</td></tr>
                        ) : reporteData.length === 0 ? (
                            <tr><td colSpan="5" className="text-center py-10 text-gray-400">No hay asignaturas para esta selección.</td></tr>
                        ) : reporteData.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4">
                                    <p className="text-sm font-bold text-gray-800">{item.asignatura}</p>
                                    <p className="text-xs text-gray-500">{item.carrera} - Ciclo {item.ciclo}</p>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700">
                                    {item.docente}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600 italic">
                                    {item.habilidad}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${getBadgeColor(item.estado)}`}>
                                        {getIcon(item.estado)} {item.estado}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div 
                                                className={`h-2 rounded-full ${item.progreso === 100 ? 'bg-green-500' : 'bg-blue-500'}`} 
                                                style={{ width: `${item.progreso}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-xs font-bold text-gray-600 w-8">{item.progreso}%</span>
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

export default ReportesCoordinador;