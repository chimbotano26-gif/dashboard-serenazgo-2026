import React, { useState, useMemo } from 'react';
import {
  X,
  FileSpreadsheet,
  FileText,
  Printer,
  Search,
  Layers,
  TrendingUp,
  BarChart3,
  Calendar,
  CheckCircle2,
  Shield,
  Download,
} from 'lucide-react';
import { IncidentRecord } from '../types';
import { MESES_LIST } from '../data/mockData';
import { SerenazgoLogo } from './SerenazgoLogo';
import {
  getAnnualConsolidatedData,
  exportAnnualConsolidatedExcel,
  exportAnnualConsolidatedPDF,
} from '../utils/reportGenerator';

interface AnnualConsolidatedModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: IncidentRecord[];
}

// Datos oficiales de la Evolución Mensual de Incidencias Operativas (ordenados de mayor a menor)
const EVOLUCION_MENSUAL_OFICIAL = [
  { mes: 'ABRIL', total: 5301, pct: '10.94%' },
  { mes: 'JULIO', total: 4897, pct: '10.11%' },
  { mes: 'MAYO', total: 4616, pct: '9.53%' },
  { mes: 'MARZO', total: 4587, pct: '9.47%' },
  { mes: 'JUNIO', total: 4423, pct: '9.13%' },
  { mes: 'SETIEMBRE', total: 4229, pct: '8.73%' },
  { mes: 'AGOSTO', total: 3979, pct: '8.21%' },
  { mes: 'ENERO', total: 3919, pct: '8.09%' },
  { mes: 'OCTUBRE', total: 3490, pct: '7.20%' },
  { mes: 'DICIEMBRE', total: 3204, pct: '6.61%' },
  { mes: 'NOVIEMBRE', total: 2951, pct: '6.09%' },
  { mes: 'FEBRERO', total: 2844, pct: '5.87%' },
];

export const AnnualConsolidatedModal: React.FC<AnnualConsolidatedModalProps> = ({
  isOpen,
  onClose,
  records,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const annualData = useMemo(() => {
    return getAnnualConsolidatedData(records);
  }, [records]);

  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return annualData.rows;
    const q = searchTerm.toLowerCase();
    return annualData.rows.filter((r) => r.incidencia.toLowerCase().includes(q));
  }, [annualData.rows, searchTerm]);

  const now = new Date();
  const dateFormatted = now.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  if (!isOpen) return null;

  const handleExportExcel = () => {
    exportAnnualConsolidatedExcel(annualData);
  };

  const handleExportPDF = () => {
    // Al pulsar 'Exportar a PDF', se ejecuta la impresión oficial donde la página 2 se genera automáticamente
    window.print();
  };

  const handleDirectDownloadPDF = () => {
    exportAnnualConsolidatedPDF(annualData);
  };

  const maxEscala = 6000;
  const escalaTicks = [0, 1000, 2000, 3000, 4000, 5000, 6000];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn print:p-0 print:bg-white print:static print:inset-auto">
      <div
        id="annual-consolidated-sheet"
        className="bg-white text-slate-800 w-full max-w-[96vw] xl:max-w-7xl max-h-[94vh] rounded-xl border-2 border-blue-900 shadow-2xl flex flex-col overflow-hidden print:max-h-none print:shadow-none print:border-none print:w-full print:rounded-none print:overflow-visible"
      >
        {/* ========================================================================= */}
        {/* BARRA SUPERIOR DE ACCIONES (OCULTA EN IMPRESIÓN)                          */}
        {/* ========================================================================= */}
        <div className="px-4 py-3 bg-gradient-to-r from-[#07172e] via-[#0b2447] to-[#124270] text-white flex flex-wrap items-center justify-between gap-3 border-b border-cyan-700/60 shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-cyan-500/20 rounded border border-cyan-400/40">
              <Layers className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-wide uppercase">
                CONSOLIDADO GENERAL ANUAL 2026 &bull; MATRIZ COMPLETA DE INCIDENCIAS
              </h2>
              <p className="text-[11px] text-cyan-200/90 font-medium">
                Municipalidad Distrital de Nuevo Chimbote &bull; Subgerencia de Seguridad Ciudadana (Pág. 01 y 02)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="btn-export-annual-excel"
              onClick={handleExportExcel}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all hover:scale-[1.02] active:scale-95 border border-emerald-400/50 cursor-pointer"
              title="Exportar Consolidado Anual completo a hoja de cálculo Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Exportar Consolidado Anual a Excel</span>
            </button>

            <button
              id="btn-export-annual-pdf"
              onClick={handleExportPDF}
              className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all hover:scale-[1.02] active:scale-95 border border-rose-400/50 cursor-pointer"
              title="Exportar a PDF oficial de 2 páginas (Pág. 01: Matriz Consolidada, Pág. 02: Evolución Mensual)"
            >
              <FileText className="w-4 h-4" />
              <span>Exportar a PDF</span>
            </button>

            <button
              onClick={handleDirectDownloadPDF}
              className="px-3 py-1.5 rounded-lg bg-indigo-700 hover:bg-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-colors cursor-pointer"
              title="Descargar archivo PDF directo (.pdf)"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Descargar .PDF</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-2.5 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-colors cursor-pointer"
              title="Imprimir documento oficial"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors ml-1 cursor-pointer"
              title="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BARRA DE BÚSQUEDA Y METADATOS RESUMEN (OCULTA EN IMPRESIÓN)               */}
        {/* ========================================================================= */}
        <div className="bg-slate-100 border-b border-slate-300 px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <span className="bg-blue-900 text-white px-2 py-0.5 rounded font-mono font-bold text-[11px]">
              {annualData.totalGeneral.toLocaleString()} Registros
            </span>
            <span className="hidden md:inline text-slate-600">
              Periodo Enero a Diciembre 2026 &bull; {annualData.rows.length} Tipos de Conflictos
            </span>
            <span className="bg-cyan-100 text-cyan-900 font-bold px-2 py-0.5 rounded text-[10px] border border-cyan-300">
              Documento Oficial de 2 Páginas
            </span>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar conflicto en la matriz..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                &times;
              </button>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CONTENEDOR MULTIPÁGINA: PÁGINA 01 + PÁGINA 02                             */}
        {/* ========================================================================= */}
        <div className="overflow-y-auto flex-1 text-slate-800 font-sans print:overflow-visible print:h-auto">
          
          {/* ======================================================================= */}
          {/* HOJA 01: MATRIZ CONSOLIDADA GENERAL DE INCIDENCIAS 2026                 */}
          {/* ======================================================================= */}
          <div className="p-3 sm:p-5 print:p-4 bg-white min-h-[900px] flex flex-col justify-between">
            <div>
              {/* Encabezado Institucional Exclusivo de Impresión para Página 01 */}
              <div className="hidden print:flex items-center justify-between pb-3 mb-3 border-b-2 border-slate-900 gap-4">
                <div className="flex items-center gap-3">
                  <SerenazgoLogo className="w-12 h-12 shrink-0" />
                  <div>
                    <div className="text-[10px] font-black tracking-widest uppercase text-slate-600">
                      MUNICIPALIDAD DISTRITAL DE NUEVO CHIMBOTE
                    </div>
                    <div className="text-sm font-black tracking-wider uppercase text-[#0b2447]">
                      SUBGERENCIA DE SEGURIDAD CIUDADANA Y SERENAZGO
                    </div>
                    <div className="text-[11px] font-bold uppercase text-blue-900 tracking-wide">
                      CONSOLIDADO GENERAL ANUAL DE INCIDENCIAS &bull; PERIODO 2026 (PÁGINA 01 DE 02)
                    </div>
                  </div>
                </div>
                <div className="text-right text-[10px] text-slate-600 font-mono">
                  <div>Fecha: <strong>{dateFormatted}</strong></div>
                  <div>Página <strong>01 de 02</strong></div>
                  <div className="text-blue-950 font-black">C2 - MDNCH</div>
                  <div className="text-slate-400">Jurisdicción Nuevo Chimbote</div>
                </div>
              </div>

              {/* Banner descriptivo en pantalla */}
              <div className="print:hidden mb-3 p-2.5 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                  <span className="font-bold text-blue-950">PÁGINA 01: MATRIZ CONSOLIDADA ANUAL DE CONFLICTOS</span>
                </div>
                <span className="text-[11px] text-blue-700 font-mono font-bold">
                  Meses en curso representados con guion (-)
                </span>
              </div>

              {/* Tabla Matriz Cruzada Completa (35 Conflictos x 12 Meses) */}
              <div className="border-2 border-slate-300 rounded-lg overflow-x-auto shadow-xs bg-white">
                <table className="w-full text-left text-[11px] border-collapse min-w-[950px]">
                  <thead>
                    <tr className="bg-gradient-to-r from-[#0b2447] via-[#124270] to-[#0b2447] text-white font-black uppercase text-[10px] tracking-wider">
                      <th className="py-2 px-2 w-10 text-center border-r border-blue-800">N°</th>
                      <th className="py-2 px-3 min-w-[260px] border-r border-blue-800">
                        PRINCIPALES CONFLICTOS MÁS COMUNES
                      </th>
                      {MESES_LIST.map((m) => (
                        <th
                          key={m}
                          className="py-2 px-1 text-center w-14 border-r border-blue-800"
                        >
                          {m.slice(0, 3)}
                        </th>
                      ))}
                      <th className="py-2 px-2 text-center w-18 border-r border-blue-800 bg-blue-900/90 font-black">
                        TOTAL
                      </th>
                      <th className="py-2 px-2 text-center w-14 bg-blue-950 font-black">
                        %
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200">
                    {filteredRows.map((r, idx) => (
                      <tr
                        key={r.incidencia}
                        className={`hover:bg-blue-50/70 transition-colors ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'
                        }`}
                      >
                        <td className="py-1 px-2 text-center text-slate-500 font-mono font-bold border-r border-slate-200">
                          {idx + 1}
                        </td>
                        <td className="py-1 px-3 font-bold text-slate-800 border-r border-slate-200 uppercase text-[10px]">
                          {r.incidencia}
                        </td>
                        {MESES_LIST.map((m) => {
                          const count = r.meses[m] || 0;
                          return (
                            <td
                              key={m}
                              className={`py-1 px-1 text-center font-mono border-r border-slate-200 ${
                                count > 0 ? 'font-bold text-blue-950' : 'text-slate-300'
                              }`}
                            >
                              {count > 0 ? count.toLocaleString() : '-'}
                            </td>
                          );
                        })}
                        <td className="py-1 px-2 text-center font-mono font-black text-blue-900 bg-blue-50/50 border-r border-slate-200">
                          {r.total.toLocaleString()}
                        </td>
                        <td className="py-1 px-2 text-center font-mono font-bold text-slate-700 bg-slate-50">
                          {r.porcentaje.toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>

                  {/* Filas de Totales y Porcentajes Oficiales */}
                  <tfoot>
                    <tr className="bg-gradient-to-r from-blue-900 via-blue-950 to-blue-900 text-white font-black border-t-2 border-slate-400 text-[10.5px]">
                      <td className="py-2 px-2 text-center border-r border-blue-800"></td>
                      <td className="py-2 px-3 uppercase tracking-wider border-r border-blue-800 text-[10px]">
                        TOTAL DE INCIDENCIAS POR MES DEL PERIODO {annualData.anio}
                      </td>
                      {MESES_LIST.map((m) => (
                        <td
                          key={`tot-${m}`}
                          className="py-2 px-1 text-center font-mono font-black text-cyan-200 border-r border-blue-800"
                        >
                          {annualData.totalesPorMes[m] > 0
                            ? annualData.totalesPorMes[m].toLocaleString()
                            : '-'}
                        </td>
                      ))}
                      <td className="py-2 px-2 text-center font-mono font-black text-amber-300 text-xs border-r border-blue-800 bg-blue-950">
                        {annualData.totalGeneral.toLocaleString()}
                      </td>
                      <td className="py-2 px-2 text-center font-mono font-black text-emerald-300 bg-blue-950">
                        100.00%
                      </td>
                    </tr>

                    <tr className="bg-slate-200 text-slate-900 font-black border-t border-slate-300 text-[9.5px]">
                      <td className="py-1.5 px-2 text-center border-r border-slate-300"></td>
                      <td className="py-1.5 px-3 uppercase tracking-wider border-r border-slate-300">
                        PORCENTAJES (%)
                      </td>
                      {MESES_LIST.map((m) => (
                        <td
                          key={`pct-${m}`}
                          className="py-1.5 px-1 text-center font-mono text-slate-800 border-r border-slate-300"
                        >
                          {annualData.totalesPorMes[m] > 0
                            ? `${annualData.porcentajesPorMes[m].toFixed(2)}%`
                            : '-'}
                        </td>
                      ))}
                      <td className="py-1.5 px-2 text-center font-mono text-slate-500 border-r border-slate-300 bg-slate-300/50">
                        -
                      </td>
                      <td className="py-1.5 px-2 text-center font-mono font-black text-blue-950 bg-slate-300">
                        100.00%
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Pie Institucional de la Página 01 */}
            <div className="pt-3 mt-4 border-t-2 border-slate-300 flex items-center justify-between text-[10px] text-slate-600">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-blue-900 text-white rounded font-mono font-bold text-[9px]">
                  C2 - MDNCH
                </span>
                <span>
                  <strong>CENTRO DE COMANDO Y CONTROL C2 - MDNCH</strong> &bull; Subgerencia de Seguridad Ciudadana y Serenazgo
                </span>
              </div>
              <div className="font-mono font-bold text-slate-500">
                Página 01 de 02 &bull; Sistema Integrado de Seguridad Ciudadana
              </div>
            </div>
          </div>

          {/* ======================================================================= */}
          {/* SEPARADOR VISUAL DE PÁGINAS (SOLO PANTALLA)                              */}
          {/* ======================================================================= */}
          <div className="print:hidden px-4 py-2 bg-slate-800 text-white flex items-center justify-between text-xs border-y-2 border-blue-600">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span className="font-black uppercase tracking-wider">
                SALTO DE HOJA &bull; PÁGINA 02: EVOLUCIÓN MENSUAL DE INCIDENCIAS OPERATIVAS 2026
              </span>
            </div>
            <span className="text-[11px] text-cyan-300 font-mono">
              Al imprimir o pulsar 'Exportar a PDF' se genera en una hoja independiente
            </span>
          </div>

          {/* ======================================================================= */}
          {/* HOJA 02 INDEPENDIENTE: EVOLUCIÓN MENSUAL DE INCIDENCIAS OPERATIVAS 2026 */}
          {/* ======================================================================= */}
          <div
            className="print:break-before-page break-before-page bg-white p-4 sm:p-8 flex flex-col justify-between min-h-[960px] print:min-h-0 print:h-[195mm] print:p-4"
            style={{ pageBreakBefore: 'always', breakBefore: 'page' }}
          >
            <div>
              {/* 1. Encabezado Institucional correspondiente a la Página 2 */}
              <div className="border-b-2 border-slate-900 pb-3 mb-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <SerenazgoLogo className="w-12 h-12 sm:w-14 sm:h-14 shrink-0" />
                  <div>
                    <div className="text-[10px] font-black tracking-widest uppercase text-slate-600">
                      MUNICIPALIDAD DISTRITAL DE NUEVO CHIMBOTE
                    </div>
                    <div className="text-sm sm:text-base font-black tracking-wider uppercase text-[#0b2447]">
                      SUBGERENCIA DE SEGURIDAD CIUDADANA Y SERENAZGO
                    </div>
                    <div className="text-[11px] font-bold uppercase text-blue-900 tracking-wide flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-blue-700" />
                      <span>REPORTE ESTADÍSTICO CONSOLIDADO ANUAL 2026 &bull; PÁGINA 02</span>
                    </div>
                  </div>
                </div>
                <div className="text-right text-[10px] text-slate-600 font-mono">
                  <div>Fecha: <strong>{dateFormatted}</strong></div>
                  <div>Página <strong>02 de 02</strong></div>
                  <div className="text-blue-950 font-black">C2 - MDNCH</div>
                  <div className="text-slate-400">Jurisdicción Nuevo Chimbote</div>
                </div>
              </div>

              {/* 2. Título y Subtítulo del Gráfico */}
              <div className="mb-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 pb-1">
                  <h3 className="text-sm sm:text-base font-black uppercase tracking-wide text-[#0b2447] flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-700" />
                    <span>Evolución Mensual de Incidencias Operativas 2026</span>
                  </h3>
                  <span className="text-xs font-mono font-black text-blue-950 bg-blue-100 px-2.5 py-0.5 rounded border border-blue-300">
                    Escala 0 a 6,000 casos &bull; Total: 48,440 atenciones
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Gráfico de barras horizontales en degradado azul cilíndrico ordenadas de mayor a menor volumen (de Abril 5,301 a Febrero 2,844 casos).
                </p>
              </div>

              {/* 3. Gráfico de Barras Horizontales con Degradado Azul Tipo Cilindro y Escala 0 a 6000 */}
              <div className="border-2 border-slate-300 rounded-xl p-3 sm:p-5 bg-gradient-to-b from-slate-50 to-white shadow-xs relative">
                
                {/* Cuadrícula de fondo vertical para la escala 0 a 6000 */}
                <div className="relative">
                  {/* Filas de Barras Horizontales (12 Meses Ordenados de Mayor a Menor) */}
                  <div className="space-y-2 relative z-10">
                    {EVOLUCION_MENSUAL_OFICIAL.map((item, idx) => {
                      const barPct = Math.min(100, Math.max(3, (item.total / maxEscala) * 100));
                      const isTop = idx === 0; // Abril 5301
                      const isBottom = idx === EVOLUCION_MENSUAL_OFICIAL.length - 1; // Febrero 2844

                      return (
                        <div
                          key={item.mes}
                          className="flex items-center gap-2 text-xs group"
                        >
                          {/* Etiqueta del Mes */}
                          <div className="w-24 sm:w-28 text-right shrink-0">
                            <span className="font-mono text-[10px] text-slate-500 font-bold mr-1">
                              #{idx + 1}
                            </span>
                            <span
                              className={`font-mono font-black text-[11px] uppercase tracking-wide ${
                                isTop
                                  ? 'text-rose-700 font-black'
                                  : isBottom
                                  ? 'text-slate-600'
                                  : 'text-slate-800'
                              }`}
                            >
                              {item.mes}
                            </span>
                          </div>

                          {/* Pista del Gráfico y Barra Cilíndrica */}
                          <div className="flex-1 bg-slate-100 h-6 sm:h-7 rounded-md border border-slate-200 overflow-hidden relative flex items-center shadow-inner">
                            {/* Líneas guía verticales tenue cada 1000 casos */}
                            {escalaTicks.map((tick) => {
                              const tickPct = (tick / maxEscala) * 100;
                              return (
                                <div
                                  key={`guide-${item.mes}-${tick}`}
                                  className="absolute top-0 bottom-0 border-l border-slate-200/90 pointer-events-none"
                                  style={{ left: `${tickPct}%` }}
                                ></div>
                              );
                            })}

                            {/* Barra en Degradado Azul Tipo Cilindro con Brillo 3D */}
                            <div
                              className="h-full rounded-r-md transition-all duration-700 flex items-center justify-end pr-2.5 relative overflow-hidden"
                              style={{
                                width: `${barPct}%`,
                                background:
                                  'linear-gradient(180deg, #93c5fd 0%, #3b82f6 28%, #1d4ed8 72%, #0f172a 100%)',
                                boxShadow:
                                  'inset 0 2px 4px rgba(255, 255, 255, 0.55), inset 0 -2px 4px rgba(0, 0, 0, 0.45)',
                              }}
                            >
                              {/* Reflejo de luz cilíndrico superior */}
                              <div className="absolute top-0 left-0 right-0 h-[35%] bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>

                              {/* Sombra de borde cilíndrico inferior */}
                              <div className="absolute bottom-0 left-0 right-0 h-[25%] bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>

                              {/* Porcentaje interno en barras con suficiente ancho */}
                              {barPct > 45 && (
                                <span className="text-[10px] font-mono font-black text-white/95 drop-shadow-xs relative z-10 hidden sm:inline">
                                  {item.pct}
                                </span>
                              )}
                            </div>

                            {/* Cifra Numérica al Final de la Barra */}
                            <div className="pl-2 shrink-0 flex items-center gap-1.5 font-mono">
                              <span
                                className={`text-xs font-black ${
                                  isTop
                                    ? 'text-rose-700'
                                    : 'text-[#0b2447]'
                                }`}
                              >
                                {item.total.toLocaleString()}
                              </span>
                              <span className="text-[10px] text-slate-500 font-bold hidden sm:inline">
                                casos
                              </span>
                              {isTop && (
                                <span className="px-1 py-0.2 rounded bg-rose-100 text-rose-800 text-[9px] font-black uppercase">
                                  Pico Máximo
                                </span>
                              )}
                              {isBottom && (
                                <span className="px-1 py-0.2 rounded bg-slate-200 text-slate-700 text-[9px] font-black uppercase">
                                  Mínimo
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 4. Escala Inferior de 0 a 6,000 Casos */}
                  <div className="mt-3 pt-2 border-t-2 border-slate-400 flex items-center">
                    <div className="w-24 sm:w-28 text-right pr-2 text-[9.5px] font-black text-slate-500 uppercase tracking-wider shrink-0 font-mono">
                      Escala (Casos):
                    </div>
                    <div className="flex-1 relative h-6">
                      {escalaTicks.map((tick) => {
                        const tickPct = (tick / maxEscala) * 100;
                        return (
                          <div
                            key={`axis-${tick}`}
                            className="absolute -top-2 flex flex-col items-center -translate-x-1/2"
                            style={{ left: `${tickPct}%` }}
                          >
                            <div className="w-0.5 h-2 bg-slate-600"></div>
                            <span className="text-[10px] font-mono font-black text-slate-700 mt-0.5">
                              {tick === 0 ? '0' : tick.toLocaleString()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. Tarjetas de Resumen Ejecutivo de la Evolución Mensual */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-center">
                  <div className="text-[10px] font-black uppercase text-rose-700">Pico Máximo Operativo</div>
                  <div className="text-lg font-black font-mono text-rose-800 mt-0.5">ABRIL &bull; 5,301</div>
                  <div className="text-[9.5px] text-rose-600 font-semibold">10.94% del consolidado anual</div>
                </div>

                <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-center">
                  <div className="text-[10px] font-black uppercase text-blue-700">Segundo Mayor Volumen</div>
                  <div className="text-lg font-black font-mono text-blue-900 mt-0.5">JULIO &bull; 4,897</div>
                  <div className="text-[9.5px] text-blue-600 font-semibold">10.11% del consolidado anual</div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
                  <div className="text-[10px] font-black uppercase text-slate-600">Promedio Mensual</div>
                  <div className="text-lg font-black font-mono text-slate-800 mt-0.5">4,037 CASOS</div>
                  <div className="text-[9.5px] text-slate-500 font-semibold">Media operativa distrital</div>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
                  <div className="text-[10px] font-black uppercase text-emerald-700">Mínimo Anual Registrado</div>
                  <div className="text-lg font-black font-mono text-emerald-800 mt-0.5">FEBRERO &bull; 2,844</div>
                  <div className="text-[9.5px] text-emerald-600 font-semibold">5.87% del consolidado anual</div>
                </div>
              </div>
            </div>

            {/* 6. Pie de Página Institucional del C2 - MDNCH */}
            <div className="mt-auto pt-3 border-t-2 border-slate-900 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-700 gap-2">
              <div className="flex items-center gap-2">
                <div className="px-2 py-0.5 bg-[#0b2447] text-white rounded font-mono font-black text-[11px] tracking-wider">
                  C2 - MDNCH
                </div>
                <div>
                  <strong>CENTRO DE COMANDO Y CONTROL C2 - MDNCH</strong> &bull; Subgerencia de Seguridad Ciudadana y Serenazgo
                </div>
              </div>
              <div className="font-mono font-bold text-slate-600 text-right">
                <div>Municipalidad Distrital de Nuevo Chimbote &bull; Gestión 2026</div>
                <div className="text-slate-400">Pág. 02 de 02 &bull; Documento Oficial de Evaluación Operativa</div>
              </div>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* PIE DEL MODAL CON BOTONES VISIBLES (OCULTO EN IMPRESIÓN)                  */}
        {/* ========================================================================= */}
        <div className="bg-slate-50 border-t border-slate-300 px-4 py-2.5 flex items-center justify-between shrink-0 print:hidden">
          <span className="text-[11px] text-slate-600 font-medium">
            Formato oficial de 2 hojas: Pág. 01 Matriz Anual &bull; Pág. 02 Gráfico de Evolución Mensual (Abril 5301 a Febrero 2844)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Exportar Excel</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="px-3.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Exportar a PDF (2 Hojas)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
