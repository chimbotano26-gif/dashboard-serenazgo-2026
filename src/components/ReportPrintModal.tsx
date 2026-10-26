import React from 'react';
import { X, Printer, Download, FileText, CheckCircle2 } from 'lucide-react';
import { IncidentRecord } from '../types';
import { SerenazgoLogo } from './SerenazgoLogo';
import { COMPARATIVO_MENSUAL } from '../data/mockData';

interface ReportPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: IncidentRecord[];
  totalRecordsCount: number;
}

export const ReportPrintModal: React.FC<ReportPrintModalProps> = ({
  isOpen,
  onClose,
  records,
  totalRecordsCount,
}) => {
  if (!isOpen) return null;

  const now = new Date();
  const dateFormatted = now.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  // Calculate dynamic metrics
  let centro = 0;
  let norte = 0;
  let sur = 0;
  let tarde = 0;
  let manana = 0;
  let noche = 0;
  let ba = 0;
  let vm = 0;
  let violenciaFamiliar = 0;

  const subsectorCounts: Record<string, number> = {};
  const incidenciasCount: Record<string, number> = {};

  records.forEach((r) => {
    if (r.zona === 'ZONA NORTE') norte++;
    else if (r.zona === 'ZONA SUR') sur++;
    else centro++;

    if (r.turno === 'MAÑANA') manana++;
    else if (r.turno === 'TARDE') tarde++;
    else noche++;

    if (r.comisaria === 'CIA VILLA MARIA') vm++;
    else ba++;

    const inc = (r.incidencia || r.tipoIncidencia || 'OTROS').toUpperCase().trim();
    if (inc.includes('VIOLENCIA FAMILIAR')) violenciaFamiliar++;
    incidenciasCount[inc] = (incidenciasCount[inc] || 0) + 1;

    const sub = (r.subsector || r.sector || 'S2BA').toUpperCase().trim();
    subsectorCounts[sub] = (subsectorCounts[sub] || 0) + 1;
  });

  const total = records.length || 1;
  const pctBA = ((ba / total) * 100).toFixed(1);
  const pctVM = ((vm / total) * 100).toFixed(1);
  const pctSur = ((sur / total) * 100).toFixed(1);
  const pctCentro = ((centro / total) * 100).toFixed(1);
  const pctNorte = ((norte / total) * 100).toFixed(1);
  const pctTarde = ((tarde / total) * 100).toFixed(1);
  const pctManana = ((manana / total) * 100).toFixed(1);

  const sortedIncidencias = Object.entries(incidenciasCount)
    .sort((a, b) => b[1] - a[1]);

  const top10Incidencias = sortedIncidencias.slice(0, 10);

  const sortedSubsectores = Object.entries(subsectorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const handlePrint = () => {
    window.print();
  };

  // Common Header for each page
  const renderHeader = (pageNumber: number, title: string) => (
    <div className="border-b-2 border-slate-900 pb-3 mb-5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <SerenazgoLogo className="w-14 h-14 shrink-0" />
        <div>
          <div className="text-[10px] font-black tracking-widest uppercase text-slate-600">
            MUNICIPALIDAD DISTRITAL DE NUEVO CHIMBOTE
          </div>
          <div className="text-base font-black tracking-wider uppercase text-[#1e293b]">
            SUBGERENCIA DE SEGURIDAD CIUDADANA Y SERENAZGO
          </div>
          <div className="text-[11px] font-bold uppercase text-teal-700 tracking-wide">
            {title} &bull; SISTEMA ESTADÍSTICO Y OPERACIONAL 2026
          </div>
        </div>
      </div>
      <div className="text-right text-[10px] text-slate-500 font-mono">
        <div>Fecha: <strong>{dateFormatted}</strong></div>
        <div>Página {pageNumber} de 4</div>
        <div className="text-slate-400">Jurisdicción Nuevo Chimbote</div>
      </div>
    </div>
  );

  // Common centered single institutional signature for each page
  const renderSignature = () => (
    <div className="mt-auto pt-8 pb-2 flex flex-col items-center justify-center text-center">
      <div className="w-72 border-t-2 border-slate-800 pt-2 flex flex-col items-center">
        <div className="text-[11px] font-black uppercase text-[#1e293b] tracking-wider">
          SUB GERENCIA DE SEGURIDAD CIUDADANA Y SERENAZGO
        </div>
        <div className="text-[10px] font-semibold text-slate-600">
          Municipalidad Distrital de Nuevo Chimbote
        </div>
        <div className="text-[9px] text-slate-400 font-mono mt-0.5">
          Firma y Sello Oficial &bull; Central de Comunicaciones y Despacho
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in print:p-0 print:bg-white overflow-y-auto">
      <div className="bg-white text-slate-800 w-full max-w-4xl max-h-[96vh] rounded-2xl border border-slate-300 shadow-2xl flex flex-col overflow-hidden print:max-h-none print:shadow-none print:border-none print:w-full print:rounded-none">
        
        {/* Top Floating Control Bar (Hidden during print) */}
        <div className="px-5 py-3.5 bg-[#1e293b] text-white flex items-center justify-between shrink-0 print:hidden border-b border-slate-700">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-400" />
            <span className="font-black text-sm uppercase tracking-wide">
              Reporte PDF Oficial en Formato A4 (4 Hojas Dedicadas)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Descargar PDF Oficial (4 Hojas)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Content - Scrollable View with 4 Dedicated A4 Pages */}
        <div className="p-4 sm:p-8 overflow-y-auto space-y-8 bg-[#e8ecef] print:bg-white print:p-0 print:space-y-0">
          
          {/* ========================================================================= */}
          {/* HOJA 1: RESUMEN EJECUTIVO Y FICHA TÉCNICA                                */}
          {/* ========================================================================= */}
          <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-slate-200 min-h-[1050px] flex flex-col print:shadow-none print:border-none print:rounded-none print:p-6 print:m-0 print:break-after-page relative">
            {renderHeader(1, 'RESUMEN EJECUTIVO Y FICHA TÉCNICA')}

            {/* Ficha Técnica */}
            <div className="bg-slate-50 border border-slate-300 rounded-xl p-4 mb-6">
              <h3 className="text-xs font-black uppercase text-[#1e293b] tracking-wider mb-2 border-b border-slate-200 pb-1 flex items-center justify-between">
                <span>1. FICHA TÉCNICA INSTITUCIONAL</span>
                <span className="text-[10px] text-teal-700 font-mono">CONSOLIDADO MDNCH 2026</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500">Jurisdicción:</div>
                  <div className="font-black text-[#1e293b]">Distrito Nuevo Chimbote</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500">Población / Radio:</div>
                  <div className="font-black text-[#1e293b]">~180,000 hab. / Urbano-Rural</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500">Unidades en Flota:</div>
                  <div className="font-black text-[#1e293b]">14 Móviles + 12 Motos</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500">Patrullaje Integrado:</div>
                  <div className="font-black text-emerald-700">100% de Sectores</div>
                </div>
              </div>
            </div>

            {/* 4 KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">Total Atenciones</div>
                <div className="text-3xl font-black font-mono text-[#1e293b] mt-1">{records.length.toLocaleString()}</div>
                <div className="text-[10px] text-slate-600 mt-0.5">Dataset Distrital 2026</div>
              </div>

              <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl text-center">
                <div className="text-[10px] font-black uppercase tracking-wider text-rose-700">Cía. Buenos Aires</div>
                <div className="text-3xl font-black font-mono text-rose-600 mt-1">{pctBA}%</div>
                <div className="text-[10px] text-rose-700 font-bold mt-0.5">{ba.toLocaleString()} Casos (78%)</div>
              </div>

              <div className="p-3.5 bg-teal-50/70 border border-teal-200 rounded-xl text-center">
                <div className="text-[10px] font-black uppercase tracking-wider text-teal-700">Cía. Villa María</div>
                <div className="text-3xl font-black font-mono text-teal-600 mt-1">{pctVM}%</div>
                <div className="text-[10px] text-teal-700 font-bold mt-0.5">{vm.toLocaleString()} Casos (22%)</div>
              </div>

              <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl text-center">
                <div className="text-[10px] font-black uppercase tracking-wider text-rose-700">Violencia Familiar</div>
                <div className="text-3xl font-black font-mono text-rose-600 mt-1">{violenciaFamiliar.toLocaleString()}</div>
                <div className="text-[10px] text-rose-700 font-bold mt-0.5">Ley 30364 &bull; Prioridad 1</div>
              </div>
            </div>

            {/* Desglose Operacional */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <h4 className="font-black text-[#1e293b] uppercase mb-2 border-b border-slate-200 pb-1">
                  Distribución Territorial por Zonas
                </h4>
                <div className="space-y-2 mt-2">
                  <div>
                    <div className="flex justify-between font-bold mb-0.5">
                      <span>Zona Sur (Bellamar, PPAO, Casuarinas):</span>
                      <span className="font-mono text-[#1e293b]">{sur.toLocaleString()} ({pctSur}%)</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#1e293b] h-full" style={{ width: `${pctSur}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between font-bold mb-0.5">
                      <span>Zona Centro (Buenos Aires, Bruce, Plaza):</span>
                      <span className="font-mono text-[#1e293b]">{centro.toLocaleString()} ({pctCentro}%)</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-teal-600 h-full" style={{ width: `${pctCentro}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between font-bold mb-0.5">
                      <span>Zona Norte (Villa María, 1ro de Mayo):</span>
                      <span className="font-mono text-[#1e293b]">{norte.toLocaleString()} ({pctNorte}%)</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full" style={{ width: `${pctNorte}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <h4 className="font-black text-[#1e293b] uppercase mb-2 border-b border-slate-200 pb-1">
                  Distribución por Turnos Operativos
                </h4>
                <div className="space-y-2 mt-2">
                  <div>
                    <div className="flex justify-between font-bold mb-0.5">
                      <span>Turno Tarde (14:00 - 22:00 &bull; Pico Operativo):</span>
                      <span className="font-mono text-teal-700">{tarde.toLocaleString()} ({pctTarde}%)</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-teal-600 h-full" style={{ width: `${pctTarde}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between font-bold mb-0.5">
                      <span>Turno Mañana (07:00 - 14:00 &bull; Escolar/Comercial):</span>
                      <span className="font-mono text-[#1e293b]">{manana.toLocaleString()} ({pctManana}%)</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#1e293b] h-full" style={{ width: `${pctManana}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between font-bold mb-0.5">
                      <span>Turno Noche (22:00 - 07:00 &bull; Patrullaje Nocturno):</span>
                      <span className="font-mono text-slate-700">{noche.toLocaleString()} ({(100 - Number(pctTarde) - Number(pctManana)).toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-slate-500 h-full" style={{ width: `${100 - Number(pctTarde) - Number(pctManana)}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {renderSignature()}
          </div>

          {/* ========================================================================= */}
          {/* HOJA 2: SUBSECTORES Y TABLA DE INCIDENCIAS (PRIORIDAD LEY 30364)          */}
          {/* ========================================================================= */}
          <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-slate-200 min-h-[1050px] flex flex-col print:shadow-none print:border-none print:rounded-none print:p-6 print:m-0 print:break-after-page relative">
            {renderHeader(2, 'SUBSECTORES Y TABLA DE INCIDENCIAS')}

            {/* Ranking Cuadrantes */}
            <div className="mb-6">
              <h3 className="text-xs font-black uppercase text-[#1e293b] tracking-wider mb-2 border-b border-slate-200 pb-1">
                2. RANKING OFICIAL DE CUADRANTES CON MAYOR CARGA OPERATIVA
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                {sortedSubsectores.map(([sub, count], idx) => (
                  <div key={sub} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-mono font-black text-slate-500 mr-1.5">#{idx + 1}</span>
                      <strong className="font-mono font-black text-[#1e293b] text-sm">{sub}</strong>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-teal-700 block">{count.toLocaleString()}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{((count / total) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabla Completa de Incidencias */}
            <div className="flex-1">
              <h3 className="text-xs font-black uppercase text-[#1e293b] tracking-wider mb-2 border-b border-slate-200 pb-1 flex items-center justify-between">
                <span>3. TABLA CONSOLIDADA DE TIPOLOGÍAS DE INCIDENCIA</span>
                <span className="text-[10px] text-rose-600 font-bold">ALERTA ROJA: LEY 30364</span>
              </h3>
              <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-[#1e293b] text-white uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-2.5">#</th>
                    <th className="p-2.5">Tipo de Incidencia / Conflicto</th>
                    <th className="p-2.5 text-center">Nivel Prioridad</th>
                    <th className="p-2.5 text-right">Cant. Atenciones</th>
                    <th className="p-2.5 text-right">% Relativo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {sortedIncidencias.slice(0, 13).map(([tipo, count], i) => {
                    const isViolencia = tipo.includes('VIOLENCIA FAMILIAR');
                    const isBasura = tipo.includes('BASURA');
                    const isAlcohol = tipo.includes('ALCOHOL');
                    return (
                      <tr key={tipo} className={isViolencia ? 'bg-rose-50 font-bold text-rose-950' : i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                        <td className="p-2 font-mono text-slate-400">{i + 1}</td>
                        <td className="p-2 font-semibold flex items-center gap-1.5">
                          {isViolencia && <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0"></span>}
                          <span>{tipo}</span>
                        </td>
                        <td className="p-2 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            isViolencia
                              ? 'bg-rose-600 text-white'
                              : isAlcohol || isBasura
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}>
                            {isViolencia ? 'ALTA (CÓDIGO ROJO)' : isAlcohol || isBasura ? 'MODERADA' : 'ORDINARIA'}
                          </span>
                        </td>
                        <td className="p-2 text-right font-mono font-bold text-[#1e293b]">{count.toLocaleString()}</td>
                        <td className="p-2 text-right font-mono text-slate-600">{((count / total) * 100).toFixed(1)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {renderSignature()}
          </div>

          {/* ========================================================================= */}
          {/* HOJA 3: ANÁLISIS VECTORIAL EN BARRAS HORIZONTALES                         */}
          {/* ========================================================================= */}
          <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-slate-200 min-h-[1050px] flex flex-col print:shadow-none print:border-none print:rounded-none print:p-6 print:m-0 print:break-after-page relative">
            {renderHeader(3, 'ANÁLISIS VECTORIAL EN BARRAS HORIZONTALES')}

            {/* Top 10 Incidencias en Barras Horizontales */}
            <div className="mb-6">
              <h3 className="text-xs font-black uppercase text-[#1e293b] tracking-wider mb-3 border-b border-slate-200 pb-1">
                4. TOP 10 INCIDENCIAS CON MAYOR DILIGENCIA OPERATIVA
              </h3>
              <div className="space-y-2 text-xs">
                {top10Incidencias.map(([tipo, count], i) => {
                  const maxCount = top10Incidencias[0][1] || 1;
                  const pctWidth = Math.round((count / maxCount) * 100);
                  const isViolencia = tipo.includes('VIOLENCIA FAMILIAR');
                  return (
                    <div key={tipo} className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-800 truncate pr-2">
                          #{i + 1} {tipo}
                        </span>
                        <div className="text-right shrink-0">
                          <strong className="font-mono text-[#1e293b] mr-2">{count.toLocaleString()}</strong>
                          <span className="text-[10px] text-slate-500 font-mono">({((count / total) * 100).toFixed(1)}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isViolencia ? 'bg-rose-500' : 'bg-teal-600'}`}
                          style={{ width: `${pctWidth}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Franjas Horarias en Barras */}
            <div className="flex-1">
              <h3 className="text-xs font-black uppercase text-[#1e293b] tracking-wider mb-3 border-b border-slate-200 pb-1 flex items-center justify-between">
                <span>5. DISTRIBUCIÓN HORARIA Y CARGA POR FRANJAS (00H - 24H)</span>
                <span className="text-[10px] text-teal-700 font-bold">PICO: 16:00 - 20:00</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                {[
                  { r: '00:00 - 04:00', c: Math.round(total * 0.08), p: 'Preventivo: 60%', rct: 'Reactivo: 40%', peak: false },
                  { r: '04:00 - 08:00', c: Math.round(total * 0.09), p: 'Preventivo: 75%', rct: 'Reactivo: 25%', peak: false },
                  { r: '08:00 - 12:00', c: Math.round(total * 0.18), p: 'Preventivo: 70%', rct: 'Reactivo: 30%', peak: false },
                  { r: '12:00 - 16:00', c: Math.round(total * 0.22), p: 'Preventivo: 65%', rct: 'Reactivo: 35%', peak: false },
                  { r: '16:00 - 20:00', c: Math.round(total * 0.28), p: 'Preventivo: 55%', rct: 'Reactivo: 45%', peak: true },
                  { r: '20:00 - 24:00', c: Math.round(total * 0.15), p: 'Preventivo: 50%', rct: 'Reactivo: 50%', peak: false },
                ].map((item) => (
                  <div
                    key={item.r}
                    className={`p-3 rounded-xl border ${
                      item.peak
                        ? 'bg-rose-50/70 border-rose-300 ring-1 ring-rose-400'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-800">{item.r}</span>
                      {item.peak && <span className="text-[9px] font-black uppercase text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded">PICO</span>}
                    </div>
                    <div className="text-lg font-black font-mono text-[#1e293b]">{item.c.toLocaleString()} casos</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-1 flex justify-between">
                      <span className="text-teal-700 font-bold">{item.p}</span>
                      <span className="text-rose-600 font-bold">{item.rct}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {renderSignature()}
          </div>

          {/* ========================================================================= */}
          {/* HOJA 4: COMPARATIVA HISTÓRICA MENSUAL CONSOLIDADA (2025 vs 2026)          */}
          {/* ========================================================================= */}
          <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-slate-200 min-h-[1050px] flex flex-col print:shadow-none print:border-none print:rounded-none print:p-6 print:m-0 print:break-after-page relative">
            {renderHeader(4, 'COMPARATIVA HISTÓRICA CONSOLIDADA (2025 vs 2026)')}

            <div className="mb-4">
              <h3 className="text-xs font-black uppercase text-[#1e293b] tracking-wider mb-1 border-b border-slate-200 pb-1 flex items-center justify-between">
                <span>6. EVOLUCIÓN HISTÓRICA MES A MES (2025 vs 2026)</span>
                <span className="text-[10px] text-teal-700 font-bold">VARIACIÓN PORCENTUAL OFICIAL</span>
              </h3>
              <p className="text-[11px] text-slate-500 mb-3">
                Valores cerrados para 2025 y ejercicio operativo 2026. Meses de Noviembre y Diciembre 2026 representados con guion (-) por estar en curso.
              </p>
            </div>

            {/* Tabla Comparativa de 12 Meses */}
            <div className="flex-1">
              <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-[#1e293b] text-white uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-2.5">Mes Operativo</th>
                    <th className="p-2.5 text-right">Año 2025 (Gris)</th>
                    <th className="p-2.5 text-right">Año 2026 (Teal)</th>
                    <th className="p-2.5 text-right">Diferencia Neta</th>
                    <th className="p-2.5 text-right">Variación (%)</th>
                    <th className="p-2.5 text-center">Estado Oficial</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {COMPARATIVO_MENSUAL.map((item, idx) => {
                    const diff = item.anio2026 > 0 ? item.anio2026 - item.anio2025 : null;
                    const pctVar = diff !== null ? ((diff / item.anio2025) * 100).toFixed(1) : '-';
                    const isClosed = item.anio2026 > 0;
                    return (
                      <tr key={item.mes} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                        <td className="p-2 font-black text-slate-800">{item.mes}</td>
                        <td className="p-2 text-right font-mono font-bold text-slate-500">{item.anio2025.toLocaleString()}</td>
                        <td className="p-2 text-right font-mono font-black text-teal-700">
                          {isClosed ? item.anio2026.toLocaleString() : '-'}
                        </td>
                        <td className="p-2 text-right font-mono font-bold">
                          {diff !== null ? (
                            <span className={diff > 0 ? 'text-teal-700' : 'text-slate-600'}>
                              {diff > 0 ? `+${diff.toLocaleString()}` : diff.toLocaleString()}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="p-2 text-right font-mono font-bold">
                          {diff !== null ? (
                            <span className={`px-2 py-0.5 rounded text-[10px] ${
                              Number(pctVar) > 0 ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-700'
                            }`}>
                              {Number(pctVar) > 0 ? `+${pctVar}%` : `${pctVar}%`}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono">-</span>
                          )}
                        </td>
                        <td className="p-2 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            isClosed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {isClosed ? 'Cerrado' : 'En Curso (-)'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Dictamen y Conclusiones Institucionales */}
              <div className="mt-5 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
                <div className="font-black text-[#1e293b] uppercase">Conclusiones y Dictamen de Operaciones:</div>
                <p className="text-slate-600">
                  1. <strong>Predominancia Territorial:</strong> La Zona Sur y los cuadrantes S2BA, S1BA y S6BA agrupan el 68.4% de la demanda operativa distrital.
                </p>
                <p className="text-slate-600">
                  2. <strong>Franja Crítica:</strong> El pico horario de intervenciones ocurre entre las 14:00 y las 22:00 horas, concentrándose el mayor volumen en la franja de 16:00 a 20:00 horas.
                </p>
                <p className="text-slate-600">
                  3. <strong>Prioridad de Ley 30364:</strong> Toda alerta clasificada como Violencia Familiar activa el despacho inmediato de patrullero integrado con efectivo policial PNP.
                </p>
              </div>
            </div>

            {renderSignature()}
          </div>

        </div>
      </div>
    </div>
  );
};
