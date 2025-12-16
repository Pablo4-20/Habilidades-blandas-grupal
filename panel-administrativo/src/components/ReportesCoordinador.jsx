import { useState, useEffect } from 'react';
import api from '../services/api';
import CustomSelect from './ui/CustomSelect';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
    PresentationChartLineIcon, PrinterIcon, FunnelIcon,
    CheckCircleIcon, XCircleIcon, ClockIcon, CalendarDaysIcon
} from '@heroicons/react/24/outline';
import logoIzq from '../assets/facultad.png'; 
import logoDer from '../assets/software.png';

const ReportesCoordinador = () => {
    const [reporteData, setReporteData] = useState([]);
    const [periodos, setPeriodos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [periodosLoaded, setPeriodosLoaded] = useState(false);
    
    // --- FILTROS ---
    const [filtroCarrera, setFiltroCarrera] = useState('Todas');
    const [filtroPeriodo, setFiltroPeriodo] = useState('');

    // Opciones estáticas carrera
    const opcionesCarrera = [
        { value: 'Todas', label: 'Todas las Carreras' },
        { value: 'Software', label: 'Software' },
        { value: 'TI', label: 'Tecnologías de la Información' }
    ];

    // 1. CARGA INICIAL (PERIODOS)
    useEffect(() => {
        cargarPeriodos();
    }, []);

    // 2. CARGA DE REPORTE
    useEffect(() => {
        if (periodosLoaded) { 
            cargarReporte();
        }
    }, [filtroCarrera, filtroPeriodo, periodosLoaded]);

    const cargarPeriodos = async () => {
        try {
            const res = await api.get('/periodos/activos'); 
            const lista = Array.isArray(res.data) ? res.data : [];
            setPeriodos(lista);
            setPeriodosLoaded(true); 
        } catch (error) {
            console.error("Error cargando periodos:", error);
            setPeriodosLoaded(true); 
        }
    };

    const cargarReporte = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/reportes/general`, {
                params: {
                    carrera: filtroCarrera,
                    periodo: filtroPeriodo
                }
            });
            setReporteData(Array.isArray(res.data) ? res.data : []); 
        } catch (error) {
            console.error("Error cargando reporte:", error);
            setReporteData([]);
        } finally {
            setLoading(false);
        }
    };

    // --- LÓGICA DE ORDENAMIENTO (ROMANOS) ---
    const ordenCiclos = {
        'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5, 
        'VI': 6, 'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10
    };

    // --- GENERAR PDF ---
    const descargarPDF = () => {
        const doc = new jsPDF('l'); 
        const pageWidth = doc.internal.pageSize.getWidth();

        const gruposPorCiclo = reporteData.reduce((acc, curr) => {
            const ciclo = curr.ciclo || 'Sin Ciclo';
            if (!acc[ciclo]) acc[ciclo] = [];
            acc[ciclo].push(curr);
            return acc;
        }, {});

        const ciclosOrdenados = Object.keys(gruposPorCiclo).sort((a, b) => {
            return (ordenCiclos[a] || 99) - (ordenCiclos[b] || 99);
        });

        if (ciclosOrdenados.length === 0) {
            alert("No hay datos para generar el reporte.");
            return;
        }

        const dibujarEncabezado = () => {
            const imgWidth = 25; const imgHeight = 25; 
            const marginTop = 5; const marginLeft = 15; 
            const xLogoDer = pageWidth - marginLeft - imgWidth;

            try { doc.addImage(logoIzq, 'PNG', marginLeft, marginTop, imgWidth, imgHeight); } catch (e) {}
            try { doc.addImage(logoDer, 'PNG', xLogoDer, marginTop, imgWidth, imgHeight); } catch (e) {}

            doc.setFontSize(14);
            doc.setTextColor(40, 53, 147);
            doc.text("UNIVERSIDAD ESTATAL DE BOLIVAR", pageWidth / 2, 15, { align: "center" });
            
            doc.setFontSize(10);
            doc.setTextColor(0);
            doc.text("REPORTE DE CUMPLIMIENTO - HABILIDADES BLANDAS", pageWidth / 2, 25, { align: "center" });
            
            doc.setFontSize(9);
            doc.setTextColor(100);
            const textoPeriodo = filtroPeriodo ? `Periodo: ${filtroPeriodo}` : "Periodo: Todos (Histórico)";
            doc.text(`${textoPeriodo}  |  Carrera: ${filtroCarrera}`, pageWidth / 2, 32, { align: "center" });
        };

        ciclosOrdenados.forEach((ciclo, index) => {
            if (index > 0) doc.addPage();
            dibujarEncabezado();

            doc.setFontSize(12);
            doc.setTextColor(220, 38, 38);
            doc.text(`CICLO ACADÉMICO: ${ciclo}`, 15, 45);

            const cuerpo = gruposPorCiclo[ciclo].map(r => [
                r.carrera,
                r.asignatura,
                r.docente,
                r.habilidad,
                r.estado,
                r.progreso + '%'
            ]);

            autoTable(doc, {
                startY: 48,
                head: [['Carrera', 'Asignatura', 'Docente', 'Habilidad', 'Estado', 'Avance']],
                body: cuerpo,
                theme: 'grid',
                headStyles: { fillColor: [41, 128, 185], halign: 'center' },
                styles: { fontSize: 8, halign: 'center' },
                columnStyles: { 
                    1: { halign: 'left', cellWidth: 50 },
                    2: { halign: 'left', cellWidth: 50 },
                    3: { halign: 'left' } 
                },
                didDrawPage: (data) => {
                    const pageCount = doc.internal.getNumberOfPages();
                    doc.setFontSize(8);
                    doc.setTextColor(150);
                    doc.text(`Página ${pageCount}`, pageWidth - 20, doc.internal.pageSize.getHeight() - 10);
                }
            });
        });

        doc.save(`Reporte_${filtroCarrera}_${filtroPeriodo || 'General'}.pdf`);
    };

    const getBadgeColor = (estado) => {
        switch(estado) {
            case 'Completado': return 'bg-green-100 text-green-700 border-green-200';
            case 'En Proceso': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Planificado': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            default: return 'bg-red-50 text-red-600 border-red-100';
        }
    };

    const getIcon = (estado) => {
        switch(estado) {
            case 'Completado': return <CheckCircleIcon className="h-4 w-4"/>;
            case 'Sin Planificar': return <XCircleIcon className="h-4 w-4"/>;
            default: return <ClockIcon className="h-4 w-4"/>;
        }
    };

    const opcionesPeriodos = [
        { value: '', label: 'Todos los Periodos' },
        ...periodos.map(p => ({ value: p.nombre, label: p.nombre }))
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* CABECERA */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Reportes Generales</h2>
                    <p className="text-gray-500 text-sm mt-1">Monitoreo del cumplimiento por carrera y asignatura.</p>
                </div>
                <button 
                    onClick={descargarPDF} 
                    disabled={reporteData.length === 0} 
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-red-100 transition flex items-center gap-2 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <PrinterIcon className="h-5 w-5"/> Exportar PDF por Ciclos
                </button>
            </div>

            {/* ZONA DE FILTROS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                
                {/* COLUMNA 1: FILTROS */}
                <div className="md:col-span-1 space-y-4">
                    <div className="bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
                        <CustomSelect 
                            label="Filtrar por Carrera"
                            icon={FunnelIcon}
                            options={opcionesCarrera}
                            value={filtroCarrera}
                            onChange={setFiltroCarrera}
                        />
                    </div>
                    
                    <div className="bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
                        <CustomSelect 
                            label="Filtrar por Periodo"
                            icon={CalendarDaysIcon}
                            options={opcionesPeriodos}
                            value={filtroPeriodo}
                            onChange={setFiltroPeriodo}
                            placeholder="Todos los periodos"
                        />
                    </div>
                </div>
                
                {/* COLUMNA 2: RESUMEN (TARJETAS) */}
                <div className="md:col-span-3 grid grid-cols-3 gap-4 h-full">
                    {/* COMPLETADOS */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-l-4 border-l-green-500 border-gray-100 flex flex-col justify-center">
                        <p className="text-xs font-bold text-gray-400 uppercase">Completados</p>
                        <p className="text-2xl font-bold text-green-600">
                            {reporteData.filter(r => r.estado === 'Completado').length}
                        </p>
                    </div>

                    {/* EN PROCESO (AHORA INCLUYE PLANIFICADOS) */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-l-4 border-l-blue-500 border-gray-100 flex flex-col justify-center">
                        <p className="text-xs font-bold text-gray-400 uppercase">En Proceso</p>
                        <p className="text-2xl font-bold text-blue-600">
                            {/* CAMBIO AQUÍ: Sumamos 'En Proceso' + 'Planificado' */}
                            {reporteData.filter(r => r.estado === 'En Proceso' || r.estado === 'Planificado').length}
                        </p>
                    </div>

                    {/* SIN PLANIFICAR */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-l-4 border-l-red-400 border-gray-100 flex flex-col justify-center">
                        <p className="text-xs font-bold text-gray-400 uppercase">Sin Planificar</p>
                        <p className="text-2xl font-bold text-red-500">
                            {reporteData.filter(r => r.estado === 'Sin Planificar').length}
                        </p>
                    </div>
                </div>
            </div>

            {/* TABLA DE CUMPLIMIENTO */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <PresentationChartLineIcon className="h-5 w-5 text-gray-500"/>
                        <h3 className="font-bold text-gray-800">Matriz de Cumplimiento</h3>
                    </div>
                    {filtroPeriodo && (
                        <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100 font-bold">
                            Periodo: {filtroPeriodo}
                        </span>
                    )}
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
                            <tr><td colSpan="5" className="text-center py-10 text-gray-400">No hay datos para el periodo y carrera seleccionados.</td></tr>
                        ) : reporteData.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4">
                                    <p className="text-sm font-bold text-gray-800">{item.asignatura}</p>
                                    <p className="text-xs text-gray-500">{item.carrera} - Ciclo {item.ciclo}</p>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700">{item.docente}</td>
                                <td className="px-6 py-4 text-sm text-gray-600 italic">{item.habilidad}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${getBadgeColor(item.estado)}`}>
                                        {getIcon(item.estado)} {item.estado}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div className={`h-2 rounded-full ${item.progreso === 100 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${item.progreso}%` }}></div>
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