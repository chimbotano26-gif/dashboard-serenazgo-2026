import React, { useState, useMemo } from 'react';
import {
  X,
  Download,
  Printer,
  FileText,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { IncidentRecord, MesType } from '../types';
import { SerenazgoLogo } from './SerenazgoLogo';
import {
  getMonthlyReportData,
  exportMonthlyReport2PagesPDF,
} from '../utils/reportGenerator';

export interface MonthlyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  records?: IncidentRecord[];
  allRecords?: IncidentRecord[];
  selectedMonth?: MesType | string;
  initialMes?: MesType | string;
}

export const MonthlyReportModal: React.FC<MonthlyReportModalProps> = ({
  isOpen,
  onClose,
  records = [],
  allRecords = [],
  selectedMonth,
  initialMes,
}) => {
  const safeMes = (selectedMonth || initialMes || 'SETIEMBRE').toString().trim().toUpperCase() as MesType;
  const [isExporting, setIsExporting] = useState(false);

  const baseRecords = useMemo(() => {
    if (Array.isArray(allRecords) && allRecords.length > 0) return allRecords;
    if (Array.isArray(records) && records.length > 0) return records;
    return [];
  }, [allRecords, records]);

  // Generación de los datos del reporte mensual
  const reportData = useMemo(() => {
    try {
      return getMonthlyReportData(baseRecords, baseRecords, safeMes);
    } catch (e) {
      console.warn('Error calculando reporte mensual:', e);
      return {
        mes: safeMes,
        rangoFechas: `Mes de ${safeMes} 2026`,
        rows: [],
        totalMes: 0,
        porcentajeAnual: '0.00',
      };
    }
  }, [baseRecords, safeMes]);

  if (!isOpen) return null;

  // Renderizar las atenciones completas sin ningún .slice() en la Hoja 1
  const displayRows = Array.isArray(reportData?.rows) ? reportData.rows : [];
  const chartRows = displayRows.slice(0, 14); // 14 barras principales para el gráfico de la Hoja 2
  const totalMesCasos = reportData?.totalMes || 0;

  // Escala para el gráfico cilíndrico de la Hoja 2
  const maxChartVal = chartRows[0]?.total || 10;
  const xAxisMax = Math.ceil((maxChartVal * 1.15) / 50) * 50 || 100;
  const xGridTicks = [0, 0.25, 0.5, 0.75, 1].map((pct) => Math.round(xAxisMax * pct));

  // KPIs resumen para la Hoja 2
  const top1Name = chartRows[0]?.incidencia || 'N/A';
  const top1Short = top1Name.length > 24 ? top1Name.slice(0, 23) + '…' : top1Name;
  const top1Count = chartRows[0]?.total || 0;

  const vfItem = displayRows.find((r) => r.incidencia.includes('VIOLENCIA FAMILIAR'));
  const vfCount = vfItem?.total || 0;

  // =========================================================================
  // CONTROLADOR DEL BOTÓN "Descargar PDF":
  // Ejecuta la descarga directa del archivo PDF oficial de 2 hojas sin bloquearse
  // =========================================================================
  const handleDownloadPDF = async () => {
    if (isExporting) return;
    setIsExporting(true);

    try {
      // 1. Descarga directa con jsPDF (genera el archivo .pdf descargable)
      await new Promise<void>((resolve, reject) => {
        try {
          exportMonthlyReport2PagesPDF(reportData);
          resolve();
        } catch (pdfErr) {
          reject(pdfErr);
        }
      });
    } catch (err) {
      console.warn('Fallo en jsPDF, intentando impresión nativa de respaldo:', err);
      try {
        window.print();
      } catch (printErr) {
        console.error('Error en impresión de respaldo:', printErr);
        alert('No se pudo generar el PDF automáticamente. Presione Ctrl+P para imprimir.');
      }
    } finally {
      setTimeout(() => setIsExporting(false), 800);
    }
  };

  // Impresión nativa complementaria con @media print
  const handleNativePrint = () => {
    try {
      window.print();
    } catch (err) {
      console.warn('Fallo en window.print():', err);
      handleDownloadPDF();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/85 backdrop-blur-md overflow-hidden print:p-0 print:bg-white print:static print:inset-auto font-sans">
      {/* Estilos dedicados de impresión A4 Horizontal (2 Hojas independientes) */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 5mm;
          }
          html, body {
            background: #ffffff !important;
            color: #0f172a !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print-landscape-page {
            width: 100% !important;
            max-width: 100% !important;
            min-height: 100vh !important;
            height: 100vh !important;
            margin: 0 !important;
            padding: 4mm 6mm !important;
            border: none !important;
            box-shadow: none !important;
            background: #ffffff !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            box-sizing: border-box !important;
          }
          .print-page-1 {
            page-break-after: always !important;
            break-after: page !important;
          }
          .print-page-2 {
            page-break-before: always !important;
            break-before: page !important;
          }
        }
      `}</style>

      {/* ===================================================================== */}
      {/* BARRA SUPERIOR DE ACCIONES Y CONTROLES                                */}
      {/* ===================================================================== */}
      <div className="px-5 py-2.5 bg-gradient-to-r from-[#07172e] via-[#0b2447] to-[#124270] text-white flex items-center justify-between gap-4 border-b-2 border-cyan-500/80 shrink-0 print:hidden shadow-md">
        {/* Lado izquierdo: Información de la previsualización */}
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-cyan-500/20 rounded-xl border border-cyan-400/40">
            <FileText className="w-5 h-5 text-cyan-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-black tracking-wide uppercase text-white font-sans">
                PREVISUALIZACIÓN DE REPORTE MENSUAL &bull; {safeMes} 2026
              </h2>
              <span className="text-[10px] bg-cyan-400 text-slate-950 px-2 py-0.5 rounded-md font-black uppercase tracking-wider">
                {displayRows.length} ATENCIONES &bull; 2 HOJAS
              </span>
            </div>
            <p className="text-[10.5px] text-cyan-200/90 font-medium">
              Municipalidad Distrital de Nuevo Chimbote &bull; Subgerencia de Seguridad Ciudadana
            </p>
          </div>
        </div>

        {/* Lado derecho: Botones de Acción */}
        <div className="flex items-center gap-2">
          {/* Botón: Imprimir Ficha */}
          <button
            type="button"
            onClick={handleNativePrint}
            className="px-3 py-1.5 rounded-xl bg-blue-800/80 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-blue-600 shadow-sm active:scale-95"
            title="Abrir vista de impresión nativa"
          >
            <Printer className="w-4 h-4 text-cyan-300" />
            <span className="hidden sm:inline">Imprimir</span>
          </button>

          {/* Botón Principal: Descargar PDF Oficial */}
          <button
            type="button"
            id="btn-download-monthly-report-pdf"
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 disabled:opacity-75 text-white font-black text-xs flex items-center gap-2 shadow-lg transition-all hover:scale-[1.02] active:scale-95 cursor-pointer border border-amber-300/60"
            title="Descargar el reporte mensual oficial en formato PDF de 2 hojas"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 text-white animate-spin" />
                <span>Generando PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-white" />
                <span>Descargar PDF</span>
              </>
            )}
          </button>

          {/* Botón: Cerrar */}
          <button
            type="button"
            id="btn-close-monthly-modal"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-slate-700/90 hover:bg-slate-600 text-slate-100 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer border border-slate-500 shadow-sm active:scale-95 ml-1"
            title="Cerrar ventana de previsualización"
          >
            <X className="w-4 h-4 text-slate-300" />
            <span>Cerrar</span>
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* CUERPO DEL MODAL: PREVISUALIZACIÓN DE HOJA 1 Y HOJA 2                */}
      {/* ===================================================================== */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5 bg-slate-900/60 flex flex-col items-center gap-5 print:p-0 print:bg-white print:gap-0 print:overflow-visible">
        
        {/* =================================================================== */}
        {/* HOJA 1: MATRIZ COMPLETA DE TODAS LAS ATENCIONES (SIN CORTES EN 23)   */}
        {/* =================================================================== */}
        <div
          id="monthly-report-page-1"
          className="print-landscape-page print-page-1 bg-white text-slate-900 w-full max-w-[1240px] rounded-xl shadow-2xl border border-slate-300 flex flex-col justify-between p-4 sm:p-5 min-h-[770px] print:shadow-none print:border-none print:rounded-none"
        >
          {/* CABECERA AZUL INSTITUCIONAL EN 3 COLUMNAS CON LOS LOGOS REALES DEL PROYECTO */}
          <div className="w-full bg-[#0B2447] text-white rounded-lg px-4 py-2 flex items-center justify-between border-b-2 border-cyan-400 shadow-sm shrink-0">
            {/* Columna Izquierda: Escudo Municipal Oficial de Nuevo Chimbote */}
            <div className="w-1/4 flex items-center justify-start">
              <div className="bg-white rounded-md p-1 shadow-xs border border-white/40 flex items-center justify-center shrink-0">
                <img
                  src="/logo-muni.png"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    if (target.src.endsWith('/logo-muni.png')) {
                      target.src = '/LOGO final.png';
                    }
                  }}
                  crossOrigin="anonymous"
                  alt="Escudo Municipalidad Distrital de Nuevo Chimbote"
                  className="h-10 w-auto object-contain max-w-[130px]"
                  loading="eager"
                />
              </div>
            </div>

            {/* Columna Central: Textos Oficiales Centrados */}
            <div className="w-2/4 text-center px-2">
              <h1 className="text-[11.5px] sm:text-xs font-black text-white uppercase tracking-wider leading-tight font-sans">
                MUNICIPALIDAD DISTRITAL DE NUEVO CHIMBOTE
              </h1>
              <h2 className="text-[10px] sm:text-[11px] font-bold text-cyan-200 uppercase tracking-wide mt-0.5 font-sans">
                SUBGERENCIA DE SEGURIDAD CIUDADANA Y SERENAZGO
              </h2>
              <p className="text-[9.5px] sm:text-[10px] font-extrabold text-amber-300 uppercase tracking-wider mt-0.5 font-sans">
                FICHA OFICIAL DE INCIDENCIAS OPERATIVAS &bull; MES DE {safeMes} 2026 &bull; PÁGINA 01 DE 02
              </p>
            </div>

            {/* Columna Derecha: Componente <SerenazgoLogo /> Oficial del Proyecto */}
            <div className="w-1/4 flex items-center justify-end">
              <div className="flex items-center gap-2">
                <div className="hidden lg:block text-right leading-none">
                  <div className="text-[8.5px] font-black uppercase text-cyan-300">SERENAZGO</div>
                  <div className="text-[7.5px] font-bold text-slate-300 uppercase mt-0.5">NUEVO CHIMBOTE</div>
                </div>
                <div className="p-0.5 rounded-full bg-white/10 border border-white/20 shadow-xs flex items-center justify-center">
                  <SerenazgoLogo className="w-10 h-10 sm:w-11 sm:h-11 object-contain" />
                </div>
              </div>
            </div>
          </div>

          {/* Sub-barra informativa con Periodo y Total Atenciones */}
          <div className="w-full bg-slate-100 border border-slate-300 rounded-md mt-1.5 px-3 py-1 flex items-center justify-between text-[10.5px] font-bold text-slate-800 shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-600 font-semibold">Periodo Oficial:</span>
              <span className="text-blue-950 font-black">{reportData.rangoFechas}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-600 font-semibold">Total Atenciones:</span>
              <span className="text-blue-950 font-black font-mono">
                {reportData.totalMes.toLocaleString()} casos
              </span>
              <span className="text-teal-700 font-bold">
                ({reportData.porcentajeAnual}% anual)
              </span>
            </div>
          </div>

          {/* TABLA COMPLETA: text-[9px] y py-0.5 px-2 (Rinde todas las atenciones sin cortes) */}
          <div className="flex-1 w-full flex flex-col justify-between mt-1.5 overflow-hidden">
            {displayRows.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-slate-50 border border-slate-200 rounded-lg">
                <AlertTriangle className="w-7 h-7 text-amber-500 mb-1" />
                <h3 className="text-xs font-black uppercase text-slate-800">
                  Sin registros disponibles para {safeMes} 2026
                </h3>
              </div>
            ) : (
              <div className="w-full flex-1 flex flex-col justify-between">
                <table className="w-full border-collapse border border-slate-300 shadow-2xs text-[9px] leading-tight">
                  <thead>
                    <tr className="bg-[#0B2447] text-white font-black uppercase tracking-wider text-[9px]">
                      <th className="py-0.5 px-2 border border-blue-900 text-center w-8">N°</th>
                      <th className="py-0.5 px-2.5 border border-blue-900 text-left">
                        PRINCIPALES CONFLICTOS MÁS COMUNES DE LA JURISDICCIÓN
                      </th>
                      <th className="py-0.5 px-2 border border-blue-900 text-center w-28">
                        CANTIDAD ATENCIONES
                      </th>
                      <th className="py-0.5 px-2 border border-blue-900 text-center w-20">
                        % RELATIVO
                      </th>
                      <th className="py-0.5 px-2 border border-blue-900 text-center w-48">
                        NIVEL DE PRIORIDAD
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayRows.map((r, idx) => {
                      const isViolencia = r.incidencia.includes('VIOLENCIA FAMILIAR');
                      return (
                        <tr
                          key={r.incidencia}
                          className={`border-b border-slate-200 ${
                            idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'
                          }`}
                        >
                          <td className="py-0.5 px-2 text-center font-bold text-slate-600 border-x border-slate-200 font-mono">
                            {idx + 1}
                          </td>
                          <td className="py-0.5 px-2.5 font-bold uppercase text-slate-900 border-r border-slate-200 truncate max-w-[340px]">
                            {r.incidencia}
                          </td>
                          <td className="py-0.5 px-2 text-center font-black font-mono text-slate-950 bg-slate-50/50 border-r border-slate-200">
                            {r.total.toLocaleString()}
                          </td>
                          <td className="py-0.5 px-2 text-center font-bold font-mono text-blue-950 bg-slate-50/50 border-r border-slate-200">
                            {r.porcentaje.toFixed(2)}%
                          </td>
                          <td className="py-0.5 px-2 text-center border-r border-slate-200">
                            {isViolencia ? (
                              <span className="inline-block px-1.5 py-0.2 rounded bg-rose-100 border border-rose-300 text-rose-800 font-black text-[8px] tracking-tight uppercase">
                                ALTA (CÓDIGO ROJO - LEY 30364)
                              </span>
                            ) : (
                              <span className="inline-block px-1.5 py-0.2 rounded bg-slate-100 border border-slate-300 text-slate-700 font-bold text-[8px] tracking-tight uppercase">
                                ORDINARIA
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    {/* Fila final TOTAL destacada */}
                    <tr className="bg-[#0B2447] text-white border-t-2 border-cyan-400 font-black text-[9.5px]">
                      <td className="py-1 px-2 text-center text-amber-300 border-r border-blue-900">
                        &bull;
                      </td>
                      <td className="py-1 px-2.5 text-left uppercase text-amber-300 tracking-wide border-r border-blue-900">
                        TOTAL DE ATENCIONES REGISTRADAS EN {safeMes} 2026 ({displayRows.length} CONFLICTOS)
                      </td>
                      <td className="py-1 px-2 text-center font-mono text-white border-r border-blue-900">
                        {reportData.totalMes.toLocaleString()}
                      </td>
                      <td className="py-1 px-2 text-center font-mono text-white border-r border-blue-900">
                        100.00%
                      </td>
                      <td className="py-1 px-2 text-center uppercase text-cyan-300 text-[8.5px] tracking-wider">
                        CUMPLIMIENTO DE META 100%
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Pie de página institucional Hoja 1 */}
          <div className="mt-2 pt-1.5 border-t-2 border-slate-300 flex items-center justify-between text-[10px] text-slate-600 shrink-0 font-medium">
            <div className="flex items-center gap-1.5 font-bold text-[#0B2447]">
              <span>CENTRO DE COMANDO Y CONTROL C2 - MDNCH</span>
              <span className="text-slate-400">&bull;</span>
              <span className="font-normal text-slate-600">
                Subgerencia de Seguridad Ciudadana y Serenazgo
              </span>
            </div>
            <div className="text-center text-slate-500 font-medium hidden sm:block text-[9.5px]">
              Elaborado por: Arturo David Rivero Onofre (ADRO) &bull; Sistema Integrado de Seguridad Ciudadana
            </div>
            <div className="font-mono font-bold text-[#0B2447]">
              Página 01 de 02
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* HOJA 2: GRÁFICO HORIZONTAL SEPARADO (page-break-before: always)     */}
        {/* =================================================================== */}
        <div
          id="monthly-report-page-2"
          className="print-landscape-page print-page-2 bg-white text-slate-900 w-full max-w-[1240px] rounded-xl shadow-2xl border border-slate-300 flex flex-col justify-between p-4 sm:p-5 min-h-[770px] print:shadow-none print:border-none print:rounded-none"
        >
          {/* CABECERA AZUL INSTITUCIONAL EN 3 COLUMNAS CON LOS LOGOS REALES (HOJA 2) */}
          <div className="w-full bg-[#0B2447] text-white rounded-lg px-4 py-2 flex items-center justify-between border-b-2 border-cyan-400 shadow-sm shrink-0">
            {/* Columna Izquierda: Escudo Municipal */}
            <div className="w-1/4 flex items-center justify-start">
              <div className="bg-white rounded-md p-1 shadow-xs border border-white/40 flex items-center justify-center shrink-0">
                <img
                  src="/logo-muni.png"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    if (target.src.endsWith('/logo-muni.png')) {
                      target.src = '/LOGO final.png';
                    }
                  }}
                  crossOrigin="anonymous"
                  alt="Escudo Municipalidad Distrital de Nuevo Chimbote"
                  className="h-10 w-auto object-contain max-w-[130px]"
                  loading="eager"
                />
              </div>
            </div>

            {/* Columna Central: Textos Oficiales Centrados */}
            <div className="w-2/4 text-center px-2">
              <h1 className="text-[11.5px] sm:text-xs font-black text-white uppercase tracking-wider leading-tight font-sans">
                MUNICIPALIDAD DISTRITAL DE NUEVO CHIMBOTE
              </h1>
              <h2 className="text-[10px] sm:text-[11px] font-bold text-cyan-200 uppercase tracking-wide mt-0.5 font-sans">
                SUBGERENCIA DE SEGURIDAD CIUDADANA Y SERENAZGO
              </h2>
              <p className="text-[9.5px] sm:text-[10px] font-extrabold text-amber-300 uppercase tracking-wider mt-0.5 font-sans">
                REPORTE ESTADÍSTICO MENSUAL &bull; MES DE {safeMes} 2026 &bull; PÁGINA 02 DE 02
              </p>
            </div>

            {/* Columna Derecha: Componente <SerenazgoLogo /> Oficial */}
            <div className="w-1/4 flex items-center justify-end">
              <div className="flex items-center gap-2">
                <div className="hidden lg:block text-right leading-none">
                  <div className="text-[8.5px] font-black uppercase text-cyan-300">SERENAZGO</div>
                  <div className="text-[7.5px] font-bold text-slate-300 uppercase mt-0.5">NUEVO CHIMBOTE</div>
                </div>
                <div className="p-0.5 rounded-full bg-white/10 border border-white/20 shadow-xs flex items-center justify-center">
                  <SerenazgoLogo className="w-10 h-10 sm:w-11 sm:h-11 object-contain" />
                </div>
              </div>
            </div>
          </div>

          {/* Título y subtítulo del Gráfico */}
          <div className="w-full text-center mt-2 mb-1.5 shrink-0">
            <h3 className="text-xs sm:text-sm font-black text-[#0B2447] uppercase tracking-wide font-sans">
              EVOLUCIÓN Y DISTRIBUCIÓN DE CONFLICTOS OPERATIVOS &bull; MES DE {safeMes} 2026
            </h3>
            <p className="text-[10.5px] text-slate-500 font-medium mt-0.5">
              Gráfico de barras horizontales en degradado azul tipo cilindro con los principales conflictos registrados (ordenados de mayor a menor)
            </p>
          </div>

          {/* CONTENEDOR DEL GRÁFICO DE BARRAS HORIZONTALES AZUL CILÍNDRICO */}
          <div className="flex-1 w-full bg-slate-50 border border-slate-300 rounded-lg p-3.5 flex flex-col justify-between my-1.5 overflow-hidden shadow-inner">
            <div className="w-full flex-1 flex flex-col justify-center gap-1.5">
              {chartRows.map((item, idx) => {
                const pctOfMax = Math.min(100, Math.max(3, (item.total / xAxisMax) * 100));
                return (
                  <div key={item.incidencia} className="flex items-center gap-3 w-full">
                    {/* Etiqueta del conflicto */}
                    <div className="w-[32%] text-right font-bold text-slate-800 text-[10.5px] truncate uppercase font-sans">
                      <span className="text-slate-400 font-mono mr-1.5">{idx + 1}.</span>
                      {item.incidencia}
                    </div>

                    {/* Barra cilíndrica con efecto de brillo y degradado azul */}
                    <div className="flex-1 relative h-5 sm:h-6 bg-slate-200/80 rounded-md overflow-hidden flex items-center border border-slate-300/70">
                      <div
                        className="h-full rounded-r-md transition-all duration-500 relative overflow-hidden"
                        style={{
                          width: `${pctOfMax}%`,
                          background: 'linear-gradient(180deg, #38bdf8 0%, #1d4ed8 45%, #0f172a 100%)',
                          boxShadow: '0 2px 4px rgba(15, 23, 42, 0.25)',
                        }}
                      >
                        {/* Reflejo superior cilíndrico */}
                        <div className="absolute top-0 inset-x-0 h-[38%] bg-gradient-to-b from-white/70 via-white/30 to-transparent pointer-events-none" />
                        {/* Sombra inferior de relieve */}
                        <div className="absolute bottom-0 inset-x-0 h-[22%] bg-black/35 pointer-events-none" />
                      </div>

                      {/* Cifra al final de la barra */}
                      <span className="ml-2 text-[11px] font-black font-mono text-[#0B2447] whitespace-nowrap">
                        {item.total.toLocaleString()} casos ({item.porcentaje.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Eje de escala horizontal */}
            <div className="pt-1.5 mt-1 border-t border-slate-300 flex items-center justify-between text-[9.5px] font-mono font-bold text-slate-500 px-[32%]">
              {xGridTicks.map((val) => (
                <div key={val} className="flex flex-col items-center">
                  <div className="h-1.5 w-px bg-slate-400 mb-0.5" />
                  <span>{val.toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="text-center text-[9px] font-bold text-slate-600 mt-0.5 uppercase">
              Escala: Número de Atenciones Registradas (Casos)
            </div>
          </div>

          {/* 4 KPIs Resumen al pie de la Hoja 2 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1.5 shrink-0">
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-[9px] font-black uppercase text-slate-500">
                CONFLICTO PRINCIPAL (#1)
              </div>
              <div className="text-xs sm:text-sm font-black text-[#0B2447] truncate mt-0.5">
                {top1Short}
              </div>
              <div className="text-[9.5px] font-bold text-slate-600 mt-0.5">
                {top1Count.toLocaleString()} casos registrados
              </div>
            </div>

            <div className="p-2 rounded-lg bg-rose-50/70 border border-rose-200">
              <div className="text-[9px] font-black uppercase text-rose-700">
                VIOLENCIA FAMILIAR (LEY 30364)
              </div>
              <div className="text-xs sm:text-sm font-black text-rose-900 mt-0.5">
                {vfCount.toLocaleString()} casos
              </div>
              <div className="text-[9.5px] font-bold text-rose-600 mt-0.5">
                Prioridad Código Rojo
              </div>
            </div>

            <div className="p-2 rounded-lg bg-teal-50/70 border border-teal-200">
              <div className="text-[9px] font-black uppercase text-teal-700">
                TOTAL ATENCIONES MES
              </div>
              <div className="text-xs sm:text-sm font-black text-teal-950 font-mono mt-0.5">
                {reportData.totalMes.toLocaleString()}
              </div>
              <div className="text-[9.5px] font-bold text-teal-600 mt-0.5">
                100% de la ficha mensual
              </div>
            </div>

            <div className="p-2 rounded-lg bg-blue-50/70 border border-blue-200">
              <div className="text-[9px] font-black uppercase text-blue-700">
                PORCENTAJE ANUAL
              </div>
              <div className="text-xs sm:text-sm font-black text-blue-950 font-mono mt-0.5">
                {reportData.porcentajeAnual}%
              </div>
              <div className="text-[9.5px] font-bold text-blue-600 mt-0.5">
                Del total distrital 2026
              </div>
            </div>
          </div>

          {/* Pie de página institucional Hoja 2 */}
          <div className="mt-2 pt-1.5 border-t-2 border-slate-300 flex items-center justify-between text-[10px] text-slate-600 shrink-0 font-medium">
            <div className="flex items-center gap-1.5 font-bold text-[#0B2447]">
              <span>CENTRO DE COMANDO Y CONTROL C2 - MDNCH</span>
              <span className="text-slate-400">&bull;</span>
              <span className="font-normal text-slate-600">
                Subgerencia de Seguridad Ciudadana y Serenazgo &bull; Municipalidad Distrital de Nuevo Chimbote
              </span>
            </div>
            <div className="font-mono font-bold text-[#0B2447]">
              Página 02 de 02
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
