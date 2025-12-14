import { useState, useEffect } from 'react';
import api from '../services/api';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import CustomSelect from './ui/CustomSelect'; // <--- IMPORTACIÓN NUEVA
import { 
    DocumentTextIcon, BookOpenIcon, 
    ArrowDownTrayIcon, PrinterIcon, SparklesIcon, ChartBarIcon, UserGroupIcon
} from '@heroicons/react/24/outline';

const ReportesDocente = () => {
    const [asignaturas, setAsignaturas] = useState([]);
    const [selectedAsignatura, setSelectedAsignatura] = useState('');
    
    // Data completa
    const [dataCompleta, setDataCompleta] = useState(null); 
    const [conclusiones, setConclusiones] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        api.get('/docente/asignaturas').then(res => setAsignaturas(Array.isArray(res.data) ? res.data : []));
    }, []);

    useEffect(() => {
        if (selectedAsignatura) {
            cargarDatosReporte();
        } else {
            setDataCompleta(null);
        }
    }, [selectedAsignatura]);

    const cargarDatosReporte = async () => {
        setLoading(true);
        try {
            const res = await api.post('/reportes/pdf-data', { asignatura_id: selectedAsignatura });
            setDataCompleta(res.data);
            const initialConclusiones = {};
            res.data.reportes.forEach(r => { initialConclusiones[r.planificacion_id] = r.conclusion; });
            setConclusiones(initialConclusiones);
        } catch (error) {
            console.error(error);
            setDataCompleta(null);
        } finally {
            setLoading(false);
        }
    };

    const guardarConclusion = async (planId) => {
        try {
            await api.post('/reportes/guardar', {
                planificacion_id: planId,
                conclusion: conclusiones[planId]
            });
            Swal.fire({ title: 'Guardado', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
        } catch (error) {
            Swal.fire('Error', 'No se pudo guardar.', 'error');
        }
    };

    // --- PDF ---
    const descargarPDFCompleto = () => {
        if (!dataCompleta) return;
        const doc = new jsPDF();
        const info = dataCompleta.info;

        const drawHeader = (doc) => {
            doc.setFontSize(14);
            doc.setTextColor(40, 53, 147);
            doc.text("UNIVERSIDAD ESTATAL DE BOLIVAR", 105, 15, { align: "center" });
            doc.setFontSize(10);
            doc.setTextColor(80);
            doc.text(info.facultad, 105, 22, { align: "center" });
            doc.setTextColor(0);
        };

        drawHeader(doc);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("ANEXO 1: FICHA RESUMEN DE EJECUCIÓN", 105, 35, { align: "center" });

        autoTable(doc, {
            startY: 40,
            theme: 'plain',
            body: [
                ['Facultad:', info.facultad],
                ['Carrera:', info.carrera],
                ['Docente:', info.docente],
                ['Periodo:', info.periodo]
            ],
            styles: { fontSize: 9, cellPadding: 1 },
            columnStyles: { 0: { fontStyle: 'bold', cellWidth: 35 } }
        });

        const filasResumen = dataCompleta.reportes.map(r => {
            const textoConclusion = conclusiones[r.planificacion_id] || r.conclusion || "Sin registro.";
            return [
                info.asignatura,
                info.ciclo,
                `${r.habilidad} (P${r.parcial_asignado})`,
                r.estadisticas[1], r.estadisticas[2], r.estadisticas[3], r.estadisticas[4], r.estadisticas[5],
                textoConclusion
            ];
        });

        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 5,
            head: [['Asignatura', 'Ciclo', 'Habilidad', 'N1', 'N2', 'N3', 'N4', 'N5', 'Conclusión']],
            body: filasResumen,
            theme: 'grid',
            headStyles: { fillColor: [220, 230, 241], textColor: 0, fontSize: 8, halign: 'center', valign: 'middle' },
            bodyStyles: { fontSize: 8, valign: 'middle', halign: 'center' },
            columnStyles: { 0: { cellWidth: 25 }, 2: { cellWidth: 30 }, 8: { cellWidth: 50, halign: 'left' } }
        });

        doc.line(14, 250, 80, 250);
        doc.setFontSize(10);
        doc.text("Firma del Docente", 14, 256);
        doc.setFontSize(8);
        doc.text("Adjunto: Evaluación realizada en cada parcial.", 14, 270);

        dataCompleta.reportes.forEach((reporte) => {
            const notas = reporte.parcial_asignado === '1' ? reporte.detalle_p1 : reporte.detalle_p2;
            const nombreParcial = reporte.parcial_asignado === '1' ? 'I' : 'II';

            doc.addPage();
            doc.setFontSize(10);
            doc.setTextColor(40, 53, 147);
            doc.text("UNIVERSIDAD ESTATAL DE BOLIVAR", 14, 10);
            doc.setTextColor(0);

            autoTable(doc, {
                startY: 15,
                theme: 'plain',
                body: [
                    ['Carrera:', info.carrera, 'Periodo Académico:', info.periodo],
                    ['Ciclo:', info.ciclo, 'Asignatura:', info.asignatura],
                    ['Habilidad Blanda:', reporte.habilidad, 'Parcial:', nombreParcial]
                ],
                styles: { fontSize: 10, cellPadding: 1.5 },
                columnStyles: { 0: { fontStyle: 'bold', cellWidth: 30 }, 2: { fontStyle: 'bold', cellWidth: 35 } }
            });

            const cuerpoTabla = notas.map(est => [est.nombre, est.n1, est.n2, est.n3, est.n4, est.n5]);

            autoTable(doc, {
                startY: doc.lastAutoTable.finalY + 5,
                head: [['Estudiante', 'Nivel 1', 'Nivel 2', 'Nivel 3', 'Nivel 4', 'Nivel 5']],
                body: cuerpoTabla,
                theme: 'grid',
                headStyles: { fillColor: [255, 255, 255], textColor: 0, lineWidth: 0.1, lineColor: 0, fontStyle: 'bold' },
                styles: { fontSize: 9, cellPadding: 2, lineColor: 0, lineWidth: 0.1, halign: 'center', valign: 'middle' },
                columnStyles: { 0: { halign: 'left', cellWidth: 80 } }
            });
        });

        doc.save(`Ficha_Completa_${info.asignatura}.pdf`);
    };

    // --- PREPARAR OPCIONES PARA EL SELECTOR ---
    const opcionesAsignaturas = asignaturas.map(a => ({
        value: a.id,
        label: `${a.nombre}`,
        subtext: `${a.carrera} - Paralelo ${a.paralelo}`
    }));

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Reportes por Asignatura</h2>
                    <p className="text-gray-500 text-sm mt-1">Informe consolidado y actas de calificación.</p>
                </div>
                {dataCompleta && (
                    <button onClick={descargarPDFCompleto} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-red-100 transition flex items-center gap-2 transform active:scale-95">
                        <PrinterIcon className="h-5 w-5"/> Descargar PDF Completo
                    </button>
                )}
            </div>

            {/* SELECCIÓN ELEGANTE */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <CustomSelect
                    label="Selecciona la Asignatura"
                    icon={BookOpenIcon}
                    placeholder="-- Buscar Materia --"
                    options={opcionesAsignaturas}
                    value={selectedAsignatura}
                    onChange={setSelectedAsignatura}
                />
            </div>

            {loading && (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400 animate-pulse">
                    <DocumentTextIcon className="h-10 w-10 mb-2"/>
                    <p>Generando reporte...</p>
                </div>
            )}

            {!loading && dataCompleta && dataCompleta.reportes.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                    {dataCompleta.reportes.map((reporte) => {
                        const totalEvaluados = Object.values(reporte.estadisticas).reduce((a,b)=>a+b,0);
                        const maxVal = Math.max(...Object.values(reporte.estadisticas)) || 1;

                        return (
                            <div key={reporte.planificacion_id} className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 transition hover:shadow-md">
                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 border-b border-gray-100 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-200">
                                            <SparklesIcon className="h-6 w-6"/>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-800">{reporte.habilidad}</h3>
                                            <span className="text-xs font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-md border border-blue-100">
                                                Parcial: {reporte.parcial_asignado === '1' ? 'I' : 'II'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${totalEvaluados > 0 ? 'bg-green-50 border-green-100 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                                        <UserGroupIcon className="h-5 w-5"/>
                                        <span className="text-sm font-bold">
                                            Evaluados: {totalEvaluados}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* GRÁFICO */}
                                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
                                            <ChartBarIcon className="h-4 w-4"/> Distribución
                                        </h4>
                                        <div className="flex items-end justify-between h-28 gap-3 px-2">
                                            {[1, 2, 3, 4, 5].map(nivel => (
                                                <div key={nivel} className="flex flex-col items-center w-full group relative h-full justify-end">
                                                    <div className="text-[10px] font-bold text-blue-600 mb-1 opacity-0 group-hover:opacity-100 transition absolute -top-4 bg-white px-1 rounded shadow-sm border">
                                                        {reporte.estadisticas[nivel]}
                                                    </div>
                                                    <div className="w-full bg-white rounded-t-md h-full relative border-b border-gray-200 overflow-hidden">
                                                        <div 
                                                            className="absolute bottom-0 w-full bg-blue-500 rounded-t-md transition-all duration-1000 ease-out"
                                                            style={{ height: `${(reporte.estadisticas[nivel] / maxVal) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                    <div className="mt-2 text-[10px] font-bold text-gray-400">N{nivel}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* CONCLUSIÓN */}
                                    <div className="flex flex-col h-full">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Conclusión del Progreso</label>
                                        <div className="flex-1 relative">
                                            <textarea 
                                                rows="4"
                                                className="w-full h-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-100 outline-none text-sm resize-none shadow-sm transition"
                                                placeholder="Escriba aquí el análisis de resultados..."
                                                value={conclusiones[reporte.planificacion_id] || ''}
                                                onChange={(e) => setConclusiones({...conclusiones, [reporte.planificacion_id]: e.target.value})}
                                            />
                                        </div>
                                        <div className="mt-3 text-right">
                                            <button 
                                                onClick={() => guardarConclusion(reporte.planificacion_id)}
                                                className="text-blue-600 hover:text-blue-800 text-xs font-bold flex items-center justify-end gap-1 w-full uppercase tracking-wide transition"
                                            >
                                                <ArrowDownTrayIcon className="h-4 w-4"/> Guardar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                !loading && selectedAsignatura && (
                    <div className="h-64 flex flex-col items-center justify-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 text-gray-400 animate-fade-in">
                        <DocumentTextIcon className="h-14 w-14 mb-3 opacity-20"/>
                        <p className="font-medium">Sin datos disponibles</p>
                        <p className="text-sm">No se encontraron habilidades planificadas para esta materia.</p>
                    </div>
                )
            )}
        </div>
    );
};

export default ReportesDocente;