import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import CustomSelect from './ui/CustomSelect'; 
import { 
    DocumentTextIcon, BookOpenIcon, CalendarDaysIcon,
    PrinterIcon, SparklesIcon, ChartBarIcon, UserGroupIcon, ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

const ReportesDocente = () => {
    const [asignacionesRaw, setAsignacionesRaw] = useState([]);
    const [selectedMateriaId, setSelectedMateriaId] = useState('');
    const [selectedPeriodo, setSelectedPeriodo] = useState('');
    const [dataCompleta, setDataCompleta] = useState(null); 
    const [conclusiones, setConclusiones] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        api.get('/docente/asignaturas').then(res => {
            setAsignacionesRaw(Array.isArray(res.data) ? res.data : []);
        });
    }, []);

    useEffect(() => {
        if (selectedMateriaId && selectedPeriodo) {
            cargarDatosReporte();
        } else {
            setDataCompleta(null);
        }
    }, [selectedMateriaId, selectedPeriodo]);

    const opcionesMaterias = useMemo(() => {
        const unicas = [];
        const map = new Map();
        for (const item of asignacionesRaw) {
            if(!map.has(item.id)) { 
                map.set(item.id, true);
                unicas.push({ value: item.id, label: item.nombre, subtext: item.carrera });
            }
        }
        return unicas;
    }, [asignacionesRaw]);

    const opcionesPeriodos = useMemo(() => {
        if (!selectedMateriaId) return [];
        return asignacionesRaw
            .filter(a => a.id === parseInt(selectedMateriaId)) 
            .map(a => ({ value: a.periodo, label: a.periodo, subtext: `Paralelo ${a.paralelo}` }));
    }, [asignacionesRaw, selectedMateriaId]);

    const cargarDatosReporte = async () => {
        setLoading(true);
        try {
            const res = await api.post('/reportes/pdf-data', { 
                asignatura_id: selectedMateriaId, 
                periodo: selectedPeriodo   
            });
            setDataCompleta(res.data);
            const initialConclusiones = {};
            if (res.data.reportes) {
                res.data.reportes.forEach(r => { initialConclusiones[r.planificacion_id] = r.conclusion || ''; });
            }
            setConclusiones(initialConclusiones);
        } catch (error) {
            console.error(error);
            setDataCompleta(null);
            Swal.fire('Info', 'No se encontraron datos para este periodo.', 'info');
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

    // ==========================================================
    //   LÓGICA DEL PDF - CORREGIDA (Niveles por Porcentaje)
    // ==========================================================
    const descargarPDFCompleto = () => {
        if (!dataCompleta || !dataCompleta.info) return;
        const doc = new jsPDF();
        const info = dataCompleta.info;

        const drawHeader = (doc) => {
            doc.setFontSize(14);
            doc.setTextColor(40, 53, 147); 
            doc.text("UNIVERSIDAD ESTATAL DE BOLIVAR", 105, 15, { align: "center" });
            doc.setFontSize(10);
            doc.setTextColor(80);
            doc.text(info.facultad || 'FACULTAD', 105, 22, { align: "center" });
            doc.setTextColor(0);
        };

        // --- PÁGINA 1: FICHA RESUMEN ---
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
            const textoConclusion = conclusiones[r.planificacion_id] || "Sin observaciones.";
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
            head: [['Asignatura', 'Ciclo', 'Habilidad', 'N1', 'N2', 'N3', 'N4', 'N5', 'Observación']],
            body: filasResumen,
            theme: 'grid',
            headStyles: { fillColor: [220, 230, 241], textColor: 0, fontSize: 8, halign: 'center', valign: 'middle' },
            bodyStyles: { fontSize: 8, valign: 'middle', halign: 'center' },
            columnStyles: { 0: { cellWidth: 25 }, 2: { cellWidth: 30 }, 8: { cellWidth: 50, halign: 'left' } }
        });

        doc.line(14, 250, 80, 250);
        doc.setFontSize(10);
        doc.text("Firma del Docente", 14, 256);

        // --- PÁGINAS INDIVIDUALES ---
        dataCompleta.reportes.forEach((reporte) => {
            const estudiantesNotas = reporte.parcial_asignado === '1' ? reporte.detalle_p1 : reporte.detalle_p2;
            const nombreParcial = reporte.parcial_asignado === '1' ? 'Primer Parcial' : 'Segundo Parcial';

            if (estudiantesNotas && estudiantesNotas.length > 0) {
                doc.addPage();
                drawHeader(doc); 

                // 1. Cabecera Informativa
                autoTable(doc, {
                    startY: 30,
                    theme: 'plain',
                    body: [
                        ['Carrera:', info.carrera, 'Periodo:', info.periodo],
                        ['Ciclo:', info.ciclo, 'Asignatura:', info.asignatura],
                        ['Habilidad:', reporte.habilidad, 'Parcial:', nombreParcial]
                    ],
                    styles: { fontSize: 10, cellPadding: 1.5 },
                    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 25 }, 2: { fontStyle: 'bold', cellWidth: 25 } }
                });

                // 2. CÁLCULOS DE RENDIMIENTO
                const stats = reporte.estadisticas;
                const totalEvaluados = Object.values(stats).reduce((a, b) => a + b, 0);

                // Calcular promedio ponderado del curso
                // Suma = (cant_n1 * 1) + (cant_n2 * 2) ...
                const sumaPuntos = (stats[1]*1) + (stats[2]*2) + (stats[3]*3) + (stats[4]*4) + (stats[5]*5);
                const promedioNivel = totalEvaluados > 0 ? (sumaPuntos / totalEvaluados) : 0;
                
                // Convertir a porcentaje (Promedio / 5 * 100)
                const porcentajeGlobal = (promedioNivel / 5) * 100;

                // 3. TABLA DE ESTADÍSTICAS POR NIVEL (Header ajustado al 20%, 40%...)
                autoTable(doc, {
                    startY: doc.lastAutoTable.finalY + 8,
                    head: [[
                        'Nivel 1 (20%)', 
                        'Nivel 2 (40%)', 
                        'Nivel 3 (60%)', 
                        'Nivel 4 (80%)', 
                        'Nivel 5 (100%)',
                        'TOTAL EST.',
                        'RENDIMIENTO GLOBAL'
                    ]],
                    body: [[
                        stats[1], 
                        stats[2], 
                        stats[3], 
                        stats[4], 
                        stats[5],
                        totalEvaluados,
                        porcentajeGlobal.toFixed(2) + '%' // El total sobre 100% que pediste
                    ]],
                    theme: 'grid',
                    headStyles: { 
                        fillColor: [230, 230, 230], 
                        textColor: 0, 
                        fontStyle: 'bold', 
                        halign: 'center',
                        fontSize: 9
                    },
                    bodyStyles: { 
                        fontSize: 10, 
                        halign: 'center', 
                        cellPadding: 3 
                    },
                    // Colorear la columna final
                    columnStyles: { 
                        6: { fontStyle: 'bold', textColor: [40, 53, 147], fillColor: [240, 245, 255] }
                    }
                });

                // 4. LISTA DE ESTUDIANTES (DISEÑO ORIGINAL)
                const cuerpoTabla = estudiantesNotas.map(est => [est.nombre, est.n1, est.n2, est.n3, est.n4, est.n5]);

                autoTable(doc, {
                    startY: doc.lastAutoTable.finalY + 5,
                    head: [['Nómina de Estudiantes', 'Nivel 1', 'Nivel 2', 'Nivel 3', 'Nivel 4', 'Nivel 5']],
                    body: cuerpoTabla,
                    theme: 'grid',
                    headStyles: { fillColor: [50, 50, 50], textColor: 255, fontStyle: 'bold', halign: 'center' },
                    bodyStyles: { fontSize: 9, cellPadding: 1.5, halign: 'center' },
                    columnStyles: { 0: { halign: 'left', cellWidth: 80 } } 
                });
            }
        });
        
        const filename = `Reporte_${info.asignatura}_${info.periodo.replace(/[\/\\]/g, '-')}.pdf`;
        doc.save(filename);
    };

    return (
        <div className="space-y-6 animate-fade-in pb-20">
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

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                <CustomSelect
                    label="1. Selecciona la Asignatura"
                    icon={BookOpenIcon}
                    placeholder="-- Buscar Materia --"
                    options={opcionesMaterias}
                    value={selectedMateriaId}
                    onChange={(val) => {
                        setSelectedMateriaId(val);
                        setSelectedPeriodo(''); 
                    }}
                />
                <div className={`transition-all duration-300 ${!selectedMateriaId ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}>
                    <CustomSelect
                        label="2. Selecciona el Periodo"
                        icon={CalendarDaysIcon}
                        placeholder={opcionesPeriodos.length === 0 ? "Sin periodos" : "-- Seleccionar Periodo --"}
                        options={opcionesPeriodos}
                        value={selectedPeriodo}
                        onChange={setSelectedPeriodo}
                    />
                </div>
            </div>

            {loading && (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400 animate-pulse">
                    <DocumentTextIcon className="h-10 w-10 mb-2"/>
                    <p>Generando reporte...</p>
                </div>
            )}

            {!loading && dataCompleta && dataCompleta.reportes.length > 0 && (
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
                                        <span className="text-sm font-bold">Evaluados: {totalEvaluados}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
                                            <ChartBarIcon className="h-4 w-4"/> Estudiantes por Nivel
                                        </h4>
                                        <div className="flex items-end justify-between h-32 gap-3 px-2 pt-4">
                                            {[1, 2, 3, 4, 5].map(nivel => (
                                                <div key={nivel} className="flex flex-col items-center w-full group relative h-full justify-end">
                                                    <div className="text-xs font-extrabold text-blue-600 mb-1.5 text-center w-full">
                                                        {reporte.estadisticas[nivel]}
                                                    </div>
                                                    <div className="w-full bg-white rounded-t-md h-full relative border-b border-gray-200 overflow-hidden shadow-sm">
                                                        <div 
                                                            className="absolute bottom-0 w-full bg-blue-500 rounded-t-md transition-all duration-1000 ease-out hover:bg-blue-600"
                                                            style={{ height: `${(reporte.estadisticas[nivel] / maxVal) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                    <div className="mt-2 text-[10px] font-bold text-gray-500">Nivel {nivel}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex flex-col h-full">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Observación / Conclusión</label>
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
                                                <ArrowDownTrayIcon className="h-4 w-4"/> Guardar Observación
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            
            {!loading && dataCompleta && dataCompleta.reportes.length === 0 && selectedPeriodo && (
                <div className="h-64 flex flex-col items-center justify-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 text-gray-400 animate-fade-in">
                    <DocumentTextIcon className="h-14 w-14 mb-3 opacity-20"/>
                    <p className="font-medium">Sin datos disponibles</p>
                    <p className="text-sm">No hay reportes para este periodo.</p>
                </div>
            )}
        </div>
    );
};

export default ReportesDocente;