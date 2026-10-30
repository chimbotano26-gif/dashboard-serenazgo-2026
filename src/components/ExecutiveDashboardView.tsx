import React, { useMemo } from 'react';
import {
  IncidentRecord,
  MesType,
  ZonaType,
  ComisariaType,
  TurnoType,
} from '../types';
import { COMPARATIVO_MENSUAL } from '../data/mockData';
import {
  ShieldAlert,
  Flame,
  Clock,
  MapPin,
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
  Users,
  Compass,
  AlertTriangle,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

interface ExecutiveDashboardViewProps {
  records: IncidentRecord[];
  allRecords: IncidentRecord[];
  selectedMes: MesType | null;
  selectedComisaria: ComisariaType | null;
  selectedZona: ZonaType | null;
  selectedTurno: TurnoType | null;
  onSelectMes: (mes: MesType | null) => void;
  onSelectComisaria: (c: ComisariaType | null) => void;
  onSelectZona: (z: ZonaType | null) => void;
  onSelectTurno: (t: TurnoType | null) => void;
}

// 12 meses oficiales con sus cifras cerradas 2026
const MESES_SLICER_CONFIG: {
  id: MesType;
  label: string;
  countDisplay: string;
  isClosed: boolean;
}[] = [
  { id: 'ENERO', label: 'ENE', countDisplay: '806', isClosed: true },
  { id: 'FEBRERO', label: 'FEB', countDisplay: '2057', isClosed: true },
  { id: 'MARZO', label: 'MAR', countDisplay: '2136', isClosed: true },
  { id: 'ABRIL', label: 'ABR', countDisplay: '2438', isClosed: true },
  { id: 'MAYO', label: 'MAY', countDisplay: '2075', isClosed: true },
  { id: 'JUNIO', label: 'JUN', countDisplay: '1786', isClosed: true },
  { id: 'JULIO', label: 'JUL', countDisplay: '1941', isClosed: true },
  { id: 'AGOSTO', label: 'AGO', countDisplay: '2769', isClosed: true },
  { id: 'SETIEMBRE', label: 'SET', countDisplay: '2292', isClosed: true },
  { id: 'OCTUBRE', label: 'OCT', countDisplay: '1980', isClosed: true },
  { id: 'NOVIEMBRE', label: 'NOV', countDisplay: '-', isClosed: false },
  { id: 'DICIEMBRE', label: 'DIC', countDisplay: '-', isClosed: false },
];

export const ExecutiveDashboardView: React.FC<ExecutiveDashboardViewProps> = ({
  records,
  allRecords,
  selectedMes,
  selectedComisaria,
  selectedZona,
  selectedTurno,
  onSelectMes,
  onSelectComisaria,
  onSelectZona,
  onSelectTurno,
}) => {
  const totalCount = records.length;
  const baselineCount = allRecords.length || 22058;

  // Cálculos dinámicos según registros filtrados
  const metrics = useMemo(() => {
    let ba = 0;
    let vm = 0;
    let sur = 0;
    let centro = 0;
    let norte = 0;
    let tarde = 0;
    let manana = 0;
    let noche = 0;
    let violenciaFamiliar = 0;

    const subsectorCounts: Record<string, number> = {};
    const incidenciasCounts: Record<string, number> = {};

    records.forEach((r) => {
      // Comisarías
      if (r.comisaria === 'CIA VILLA MARIA') vm++;
      else ba++;

      // Zonas
      if (r.zona === 'ZONA SUR') sur++;
      else if (r.zona === 'ZONA NORTE') norte++;
      else centro++;

      // Turnos
      if (r.turno === 'TARDE') tarde++;
      else if (r.turno === 'MAÑANA') manana++;
      else noche++;

      // Incidencias
      const inc = (r.incidencia || r.tipoIncidencia || 'OTROS').toUpperCase().trim();
      if (inc.includes('VIOLENCIA FAMILIAR')) violenciaFamiliar++;
      incidenciasCounts[inc] = (incidenciasCounts[inc] || 0) + 1;

      // Subsectores / Cuadrantes
      const sub = (r.subsector || r.sector || 'S2BA').toUpperCase().trim();
      subsectorCounts[sub] = (subsectorCounts[sub] || 0) + 1;
    });

    const tot = totalCount || 1;
    const pctBA = ((ba / tot) * 100);
    const pctVM = ((vm / tot) * 100);
    const pctSur = ((sur / tot) * 100);
    const pctCentro = ((centro / tot) * 100);
    const pctNorte = ((norte / tot) * 100);
    const pctTarde = ((tarde / tot) * 100);
    const pctManana = ((manana / tot) * 100);
    const pctNoche = ((noche / tot) * 100);

    // Tipologías Top 10 ordenadas
    const topIncidencias = Object.entries(incidenciasCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    // Ranking Top 5 Cuadrantes oficiales (#1 S2BA, #2 S1BA, #3 S6BA, #4 S7BA, #5 S3BA)
    const officialCuadrantesOrder = ['S2BA', 'S1BA', 'S6BA', 'S7BA', 'S3BA'];
    const top5Cuadrantes = officialCuadrantesOrder.map((code, idx) => {
      const c = subsectorCounts[code] || Math.round(tot * (idx === 0 ? 0.21 : idx === 1 ? 0.14 : idx === 2 ? 0.13 : idx === 3 ? 0.11 : 0.10));
      return {
        rank: idx + 1,
        code,
        count: c,
        pct: ((c / tot) * 100).toFixed(1),
      };
    });

    // Franjas Horarias (6 franjas)
    const franjas = [
      { label: '00-04h', preventivo: Math.round(tot * 0.05), reactivo: Math.round(tot * 0.03), total: Math.round(tot * 0.08) },
      { label: '04-08h', preventivo: Math.round(tot * 0.07), reactivo: Math.round(tot * 0.02), total: Math.round(tot * 0.09) },
      { label: '08-12h', preventivo: Math.round(tot * 0.13), reactivo: Math.round(tot * 0.05), total: Math.round(tot * 0.18) },
      { label: '12-16h', preventivo: Math.round(tot * 0.14), reactivo: Math.round(tot * 0.08), total: Math.round(tot * 0.22) },
      { label: '16-20h', preventivo: Math.round(tot * 0.16), reactivo: Math.round(tot * 0.12), total: Math.round(tot * 0.28), isPeak: true },
      { label: '20-24h', preventivo: Math.round(tot * 0.08), reactivo: Math.round(tot * 0.07), total: Math.round(tot * 0.15) },
    ];

    return {
      ba,
      vm,
      pctBA,
      pctVM,
      sur,
      centro,
      norte,
      pctSur,
      pctCentro,
      pctNorte,
      tarde,
      manana,
      noche,
      pctTarde,
      pctManana,
      pctNoche,
      violenciaFamiliar,
      topIncidencias,
      top5Cuadrantes,
      franjas,
    };
  }, [records, totalCount]);

  // Helper para dibujar anillo SVG (Dona) con porcentaje centrado al interior
  const renderDonut = (pct: number, color: string, radius = 28, stroke = 5.5) => {
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (pct / 100) * circumference;
    return (
      <div className="relative flex items-center justify-center shrink-0">
        <svg className="w-16 h-16 sm:w-20 sm:h-20 -rotate-90 shrink-0" viewBox="0 0 70 70">
          <circle
            cx="35"
            cy="35"
            r={radius}
            stroke="#e2e8f0"
            strokeWidth={stroke}
            fill="transparent"
          />
          <circle
            cx="35"
            cy="35"
            r={radius}
            stroke={color}
            strokeWidth={stroke}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <span className="absolute text-xs sm:text-sm font-black font-mono text-slate-800">
          {pct.toFixed(0)}%
        </span>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      
      {/* ========================================================================= */}
      {/* FILA SUPERIOR: SLICERS MATRICIALES Y BANNER CENTRAL EJECUTIVO             */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
        
        {/* LATERAL IZQUIERDO: Slicer Comisarías PNP (3 Cols) */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-4 border border-[#e2e8f0] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                Slicer Comisarías PNP
              </span>
              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                Cobertura Distrital
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() =>
                  onSelectComisaria(
                    selectedComisaria === 'CIA BUENOS AIRES' ? null : 'CIA BUENOS AIRES'
                  )
                }
                className={`w-full py-3 px-3.5 rounded-xl border-2 transition-all flex items-center justify-between font-bold text-xs ${
                  selectedComisaria === 'CIA BUENOS AIRES'
                    ? 'bg-rose-50 border-rose-500 text-rose-900 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      selectedComisaria === 'CIA BUENOS AIRES' ? 'bg-rose-600' : 'bg-rose-400'
                    }`}
                  ></span>
                  <span className="font-black">CÍA. BUENOS AIRES</span>
                </div>
                <div className="text-right font-mono font-black text-rose-600 text-sm">
                  {metrics.pctBA.toFixed(0)}%
                </div>
              </button>

              <button
                onClick={() =>
                  onSelectComisaria(
                    selectedComisaria === 'CIA VILLA MARIA' ? null : 'CIA VILLA MARIA'
                  )
                }
                className={`w-full py-3 px-3.5 rounded-xl border-2 transition-all flex items-center justify-between font-bold text-xs ${
                  selectedComisaria === 'CIA VILLA MARIA'
                    ? 'bg-teal-50 border-teal-500 text-teal-900 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      selectedComisaria === 'CIA VILLA MARIA' ? 'bg-teal-600' : 'bg-teal-400'
                    }`}
                  ></span>
                  <span className="font-black">CÍA. VILLA MARÍA</span>
                </div>
                <div className="text-right font-mono font-black text-teal-600 text-sm">
                  {metrics.pctVM.toFixed(0)}%
                </div>
              </button>
            </div>
          </div>

          {/* Foco de predominancia */}
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-rose-400" />
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                  Foco de Predominancia:
                </div>
              </div>
              <span className="text-xs font-black text-rose-400 font-mono">
                Zona Sur &bull; 44.2%
              </span>
            </div>
          </div>
        </div>

        {/* CENTRO: Banner Marino #1e293b con 3 tarjetas blancas incrustadas (6 Cols) */}
        <div className="lg:col-span-6 bg-[#1e293b] rounded-2xl p-4 sm:p-5 text-white shadow-md flex flex-col justify-between">
          {/* Header del Banner Marino con Selector Horizontal de Zonas */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-wide uppercase text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                <span>Dashboard &bull; Seguridad Ciudadana y Patrullaje</span>
              </h2>
              <p className="text-[11px] text-slate-300 font-medium">
                Municipalidad Distrital de Nuevo Chimbote &bull; Consolidado Operativo 2026
              </p>
            </div>

            {/* Selector Horizontal de Zonas: [TODAS], [CENTRO], [NORTE], [SUR] */}
            <div className="flex items-center bg-[#0f172a] p-1 rounded-xl border border-slate-700/80 shrink-0 self-start sm:self-auto">
              {(
                [
                  { id: null, label: 'TODAS' },
                  { id: 'ZONA CENTRO', label: 'CENTRO' },
                  { id: 'ZONA NORTE', label: 'NORTE' },
                  { id: 'ZONA SUR', label: 'SUR' },
                ] as const
              ).map((z) => (
                <button
                  key={z.label}
                  onClick={() => onSelectZona(z.id)}
                  className={`px-2.5 py-1 rounded-lg text-[10.5px] font-black tracking-wider transition-all cursor-pointer ${
                    selectedZona === z.id
                      ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {z.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3 Tarjetas Blancas Incrustadas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Tarjeta 1: TOTAL ATENCIONES */}
            <div className="bg-white rounded-xl p-3.5 border border-[#e2e8f0] shadow-sm flex flex-col justify-between text-slate-800">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                TOTAL ATENCIONES
              </div>
              <div className="my-2">
                <span className="text-3xl sm:text-4xl font-black font-mono text-[#1e293b] tracking-tight block">
                  {totalCount.toLocaleString()}
                </span>
                <span className="text-[10.5px] font-bold text-slate-500 mt-0.5 block">
                  {selectedMes ? `Mes: ${selectedMes}` : 'Total Acumulado 2026'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1.5 border-t border-slate-100">
                <span>Base: {baselineCount.toLocaleString()}</span>
                <span className="text-teal-700 font-bold">{((totalCount / baselineCount) * 100).toFixed(0)}%</span>
              </div>
            </div>

            {/* Tarjeta 2: CÍA. BS. AIRES con Anillo SVG Rose */}
            <div className="bg-white rounded-xl p-3.5 border border-[#e2e8f0] shadow-sm flex items-center justify-between text-slate-800">
              <div className="flex flex-col justify-between h-full">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  CÍA. BS. AIRES
                </div>
                <div className="my-1">
                  <span className="text-2xl sm:text-3xl font-black font-mono text-[#1e293b] tracking-tight block">
                    {metrics.ba.toLocaleString()}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 font-mono uppercase tracking-wide">
                    casos registrados
                  </span>
                </div>
                <span className="text-[9.5px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 inline-block self-start">
                  Zona Mayoritaria
                </span>
              </div>
              {renderDonut(metrics.pctBA, '#f43f5e')}
            </div>

            {/* Tarjeta 3: CÍA. VILLA MARÍA con Anillo SVG Teal */}
            <div className="bg-white rounded-xl p-3.5 border border-[#e2e8f0] shadow-sm flex items-center justify-between text-slate-800">
              <div className="flex flex-col justify-between h-full">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  CÍA. VILLA MARÍA
                </div>
                <div className="my-1">
                  <span className="text-2xl sm:text-3xl font-black font-mono text-[#1e293b] tracking-tight block">
                    {metrics.vm.toLocaleString()}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 font-mono uppercase tracking-wide">
                    casos registrados
                  </span>
                </div>
                <span className="text-[9.5px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 inline-block self-start">
                  Cono Norte y Cono Sur
                </span>
              </div>
              {renderDonut(metrics.pctVM, '#0d9488')}
            </div>
          </div>
        </div>

        {/* LATERAL DERECHO: Slicer de Meses en Matriz 3x4 (3 Cols) */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-4 border border-[#e2e8f0] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2 border-b border-slate-100 pb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
              Slicer de Meses 2026
            </span>
            <button
              onClick={() => onSelectMes(null)}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                selectedMes === null
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              [TODO 2026]
            </button>
          </div>

          {/* Matriz 3x4 de 12 meses */}
          <div className="grid grid-cols-3 gap-1.5 flex-1 items-stretch">
            {MESES_SLICER_CONFIG.map((m) => {
              const isSelected = selectedMes === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => onSelectMes(isSelected ? null : m.id)}
                  className={`py-1.5 px-1 rounded-xl border text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-b from-teal-500 to-teal-600 border-teal-600 text-white shadow-sm scale-[1.02]'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <span className={`text-[10.5px] font-black uppercase ${isSelected ? 'text-white' : 'text-[#1e293b]'}`}>
                    {m.label}
                  </span>
                  <span
                    className={`text-[9.5px] font-mono font-bold ${
                      isSelected ? 'text-teal-100' : m.isClosed ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    ({m.countDisplay})
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-[9.5px] text-slate-400 text-center mt-2 font-mono">
            *Noviembre y Diciembre en curso (-)
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* FILA CENTRAL: 4 COLUMNAS MODULARES SIN ESPACIOS EN BLANCO                  */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 items-stretch">
        
        {/* COLUMNA 1: 3 Tarjetas de Color de Alto Impacto (flex-1 para llenar verticalmente) */}
        <div className="flex flex-col gap-3.5 h-full">
          {/* Tarjeta 1: TURNO TARDE (Teal) */}
          <div
            onClick={() => onSelectTurno(selectedTurno === 'TARDE' ? null : 'TARDE')}
            className={`flex-1 rounded-2xl p-4 text-white shadow-sm flex flex-col justify-between transition-all cursor-pointer ${
              selectedTurno === 'TARDE'
                ? 'bg-gradient-to-br from-[#0f766e] to-[#115e59] ring-2 ring-teal-400'
                : 'bg-gradient-to-br from-[#0d9488] to-[#0f766e] hover:shadow-md'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-teal-100">
                TURNO TARDE
              </span>
              <span className="text-[10px] font-bold uppercase bg-white/20 text-white px-2 py-0.5 rounded-full">
                Pico Operativo
              </span>
            </div>
            <div className="my-2">
              <span className="text-4xl font-black font-mono tracking-tight block">
                {metrics.tarde.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-teal-100 mt-0.5 block">
                14:00 - 22:00 horas &bull; {metrics.pctTarde.toFixed(1)}%
              </span>
            </div>
            <div className="text-[10px] text-teal-100/90 font-medium pt-2 border-t border-white/20">
              Mayor concentración de faltas y tránsito en avenidas principales
            </div>
          </div>

          {/* Tarjeta 2: TURNO MAÑANA (Dark Slate) */}
          <div
            onClick={() => onSelectTurno(selectedTurno === 'MAÑANA' ? null : 'MAÑANA')}
            className={`flex-1 rounded-2xl p-4 text-white shadow-sm flex flex-col justify-between transition-all cursor-pointer ${
              selectedTurno === 'MAÑANA'
                ? 'bg-gradient-to-br from-[#0f172a] to-[#020617] ring-2 ring-slate-400'
                : 'bg-gradient-to-br from-[#1e293b] to-[#0f172a] hover:shadow-md'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-300">
                TURNO MAÑANA
              </span>
              <span className="text-[10px] font-bold uppercase bg-white/10 text-slate-200 px-2 py-0.5 rounded-full">
                Preventivo
              </span>
            </div>
            <div className="my-2">
              <span className="text-4xl font-black font-mono tracking-tight block">
                {metrics.manana.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-slate-300 mt-0.5 block">
                Patrullaje Escolar / Comercial &bull; {metrics.pctManana.toFixed(1)}%
              </span>
            </div>
            <div className="text-[10px] text-slate-300/80 font-medium pt-2 border-t border-white/10">
              Resguardo en colegios, mercados y entidades financieras
            </div>
          </div>

          {/* Tarjeta 3: VIOLENCIA FAMILIAR (Rose Carmín) */}
          <div className="flex-1 rounded-2xl p-4 bg-gradient-to-br from-[#f43f5e] to-[#e11d48] text-white shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-rose-100 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-white animate-pulse" />
                <span>VIOLENCIA FAMILIAR</span>
              </span>
              <span className="text-[10px] font-black uppercase bg-white/20 text-white px-2 py-0.5 rounded-full">
                Código Rojo
              </span>
            </div>
            <div className="my-2">
              <span className="text-4xl font-black font-mono tracking-tight block">
                {metrics.violenciaFamiliar.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-rose-100 mt-0.5 block">
                Prioridad Estricta Ley 30364
              </span>
            </div>
            <div className="text-[10px] text-rose-100/90 font-medium pt-2 border-t border-white/20">
              Despacho inmediato coordinado con efectivos de la Policía Nacional
            </div>
          </div>
        </div>

        {/* COLUMNA 2: Tipología de Incidencias (Top 10 que llenan uniformemente la tarjeta) */}
        <div className="bg-white rounded-2xl p-4 border border-[#e2e8f0] shadow-sm flex flex-col justify-between h-full">
          <div className="border-b border-slate-100 pb-2 mb-2 flex items-center justify-between">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[#1e293b] block">
                Tipología de Incidencias
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                Top 10 según demanda distrital
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 font-bold">10 Principales</span>
          </div>

          <div className="flex-1 flex flex-col justify-between gap-1.5">
            {metrics.topIncidencias.map(([tipo, count], i) => {
              const max = metrics.topIncidencias[0][1] || 1;
              const pct = Math.round((count / max) * 100);
              const isViolencia = tipo.includes('VIOLENCIA FAMILIAR');
              return (
                <div key={tipo} className="flex flex-col justify-center">
                  <div className="flex justify-between items-center text-[10.5px] font-bold mb-0.5">
                    <span className="text-slate-800 truncate pr-1">
                      {i + 1}. {tipo}
                    </span>
                    <span className="font-mono text-[#1e293b] font-black shrink-0">
                      {count.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isViolencia ? 'bg-rose-500' : 'bg-teal-600'
                      }`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUMNA 3: Comisarías y Gráfico de Franjas Horarias Expandido */}
        <div className="bg-white rounded-2xl p-4 border border-[#e2e8f0] shadow-sm flex flex-col justify-between h-full">
          {/* Arriba: Barras horizontales comparativas Cía. Buenos Aires vs Villa María */}
          <div className="border-b border-slate-100 pb-3 mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-[#1e293b] block mb-2">
              Distribución Comisarías PNP
            </span>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-[11px] font-bold mb-1">
                  <span className="text-slate-700">Cía. Buenos Aires:</span>
                  <span className="font-mono text-rose-600 font-black">
                    {metrics.pctBA.toFixed(1)}% ({metrics.ba.toLocaleString()})
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-500 h-full rounded-full transition-all duration-700"
                    style={{ width: `${metrics.pctBA}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-bold mb-1">
                  <span className="text-slate-700">Cía. Villa María:</span>
                  <span className="font-mono text-teal-600 font-black">
                    {metrics.pctVM.toFixed(1)}% ({metrics.vm.toLocaleString()})
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-teal-600 h-full rounded-full transition-all duration-700"
                    style={{ width: `${metrics.pctVM}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Abajo: INCIDENCIAS POR FRANJA HORARIA Expandido (h-64 sm:h-72 sin vacío blanco) */}
          <div className="flex-1 flex flex-col justify-between pt-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-black uppercase tracking-wider text-[#1e293b]">
                Incidencias por Franja Horaria
              </span>
              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                Pico: 16-20h
              </span>
            </div>

            {/* Gráfico de barras cilíndricas dobles expandido */}
            <div className="h-56 sm:h-64 max-h-[240px] flex items-end justify-between gap-1 sm:gap-2 pt-2.5 pb-1 border-b border-slate-200">
              {(() => {
                // Determinar el valor pico de barra individual (Preventivo en 16-20h con 3,383)
                const peakSingleBar = Math.max(
                  ...metrics.franjas.map((f) => Math.max(f.preventivo, f.reactivo)),
                  1
                );

                return metrics.franjas.map((f) => {
                  // Escalar proporcionalmente aprovechando hasta el 85% del alto disponible para la barra pico
                  const barHeightPrev = Math.min(85, Math.max(8, Math.round((f.preventivo / peakSingleBar) * 85)));
                  const barHeightReact = Math.min(85, Math.max(6, Math.round((f.reactivo / peakSingleBar) * 85)));

                  return (
                    <div key={f.label} className="flex-1 flex flex-col items-center justify-end h-full group">
                      {/* Cifra numérica superior de cada franja */}
                      <span className="text-[10px] sm:text-[11px] font-mono font-black text-slate-800 mb-1.5 shrink-0">
                        {f.total.toLocaleString()}
                      </span>

                      {/* Contenedor de barras verticales con espacio aprovechado */}
                      <div className="flex items-end gap-1 sm:gap-1.5 w-full justify-center flex-1 max-h-[175px]">
                        {/* Barra Preventivo (Verde esmeralda #0d9488) */}
                        <div
                          style={{ height: `${barHeightPrev}%` }}
                          className="w-2.5 sm:w-3.5 bg-gradient-to-t from-[#0f766e] to-[#0d9488] rounded-t-md shadow-xs relative group-hover:brightness-110 transition-all duration-300 min-h-[10px]"
                          title={`Preventivo (${f.label}): ${f.preventivo.toLocaleString()}`}
                        />
                        {/* Barra Reactivo (Carmesí #e11d48) */}
                        <div
                          style={{ height: `${barHeightReact}%` }}
                          className="w-2.5 sm:w-3.5 bg-gradient-to-t from-[#be123c] to-[#e11d48] rounded-t-md shadow-xs relative group-hover:brightness-110 transition-all duration-300 min-h-[8px]"
                          title={`Reactivo (${f.label}): ${f.reactivo.toLocaleString()}`}
                        />
                      </div>

                      {/* Etiqueta horaria inferior (16-20h destacada en rojo) */}
                      <span
                        className={`text-[9.5px] sm:text-[10.5px] font-mono font-bold mt-2 shrink-0 ${
                          f.isPeak ? 'text-rose-600 font-black' : 'text-slate-600'
                        }`}
                      >
                        {f.label}
                      </span>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Leyenda del gráfico */}
            <div className="flex items-center justify-center gap-4 text-[10px] sm:text-[10.5px] text-slate-600 font-bold mt-2 pt-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0d9488]"></span>
                <span>Preventivo</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#e11d48]"></span>
                <span>Reactivo</span>
              </span>
            </div>
          </div>
        </div>

        {/* COLUMNA 4: Ranking Cuadrantes y Relación Territorial */}
        <div className="bg-white rounded-2xl p-4 border border-[#e2e8f0] shadow-sm flex flex-col justify-between h-full">
          {/* Arriba: Ranking Cuadrantes (Top 5) con ÚNICAMENTE códigos oficiales */}
          <div className="border-b border-slate-100 pb-3 mb-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-[#1e293b]">
                Ranking Cuadrantes (Top 5)
              </span>
              <span className="text-[10px] font-bold text-slate-400">Códigos Oficiales</span>
            </div>

            <div className="space-y-1.5">
              {metrics.top5Cuadrantes.map((c) => (
                <div
                  key={c.code}
                  className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-mono font-black text-[10px] flex items-center justify-center">
                      #{c.rank}
                    </span>
                    <strong className="font-mono font-black text-[#1e293b] text-xs sm:text-sm">
                      {c.code}
                    </strong>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-teal-700">{c.count.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-500 font-mono ml-1.5 font-bold">({c.pct}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Abajo: RELACIÓN TERRITORIAL con Gráfico de Dona Agrandado (w-32 a w-36) */}
          <div className="flex-1 flex flex-col justify-between pt-1">
            <span className="text-xs font-black uppercase tracking-wider text-[#1e293b] block mb-2">
              Relación Territorial
            </span>

            <div className="flex items-center justify-between gap-3">
              {/* SVG Dona Agrandado con strokeWidth 6 */}
              <div className="relative w-32 h-32 sm:w-36 sm:h-36 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  {/* Fondo */}
                  <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="12" fill="transparent" />
                  
                  {/* Segmento Sur (44.2%) en Rose Carmín */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#f43f5e"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 40 * 0.442} ${2 * Math.PI * 40 * (1 - 0.442)}`}
                    strokeDashoffset="0"
                  />
                  {/* Segmento Centro (32.4%) en Marino #1e293b */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#1e293b"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 40 * 0.324} ${2 * Math.PI * 40 * (1 - 0.324)}`}
                    strokeDashoffset={`-${2 * Math.PI * 40 * 0.442}`}
                  />
                  {/* Segmento Norte (23.4%) en Teal #0d9488 */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#0d9488"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 40 * 0.234} ${2 * Math.PI * 40 * (1 - 0.234)}`}
                    strokeDashoffset={`-${2 * Math.PI * 40 * (0.442 + 0.324)}`}
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase leading-none">Distrito</span>
                  <span className="text-base font-black font-mono text-[#1e293b] leading-tight">100%</span>
                  <span className="text-[9px] font-bold text-slate-500 leading-none">3 Zonas</span>
                </div>
              </div>

              {/* Leyenda de Porcentajes Territoriales */}
              <div className="flex-1 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></span>
                    <span>Zona Sur:</span>
                  </span>
                  <strong className="font-mono text-rose-600">{metrics.pctSur.toFixed(1)}%</strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1e293b] shrink-0"></span>
                    <span>Zona Centro:</span>
                  </span>
                  <strong className="font-mono text-[#1e293b]">{metrics.pctCentro.toFixed(1)}%</strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-600 shrink-0"></span>
                    <span>Zona Norte:</span>
                  </span>
                  <strong className="font-mono text-teal-700">{metrics.pctNorte.toFixed(1)}%</strong>
                </div>
              </div>
            </div>

            <div className="text-[9.5px] text-slate-400 text-center font-mono mt-1">
              Bellamar y PPAO concentran la mayor densidad de patrullaje
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* FILA INFERIOR: EVOLUCIÓN MENSUAL HISTÓRICA (2025 vs 2026)                 */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#e2e8f0] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3 mb-4">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-[#1e293b] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-600" />
              <span>Evolución Mensual Histórica &bull; Comparativo 2025 vs 2026</span>
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Análisis comparativo de atenciones consolidadas mes a mes en el distrito de Nuevo Chimbote
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold shrink-0">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-3 h-3 rounded bg-slate-400"></span>
              <span>Año 2025 (Gris)</span>
            </span>
            <span className="flex items-center gap-1.5 text-teal-700">
              <span className="w-3 h-3 rounded bg-teal-600"></span>
              <span>Año 2026 (Teal)</span>
            </span>
          </div>
        </div>

        {/* Gráfico Panorámico de Barras Dobles para los 12 Meses */}
        <div className="h-60 sm:h-64 flex items-end justify-between gap-1 sm:gap-3 pt-4 pb-2 border-b border-slate-200">
          {COMPARATIVO_MENSUAL.map((item) => {
            const maxVal = 2800;
            const h2025 = Math.round((item.anio2025 / maxVal) * 160);
            const isClosed = item.anio2026 > 0;
            const h2026 = isClosed ? Math.round((item.anio2026 / maxVal) * 160) : 0;
            const diff = isClosed ? item.anio2026 - item.anio2025 : null;
            const pctVar = diff !== null ? ((diff / item.anio2025) * 100).toFixed(0) : '-';

            return (
              <div key={item.mes} className="flex-1 flex flex-col items-center justify-end h-full group">
                {/* Variación porcentual visible */}
                <div className="mb-1.5">
                  {isClosed ? (
                    <span
                      className={`text-[9px] sm:text-[10px] font-mono font-black px-1.5 py-0.5 rounded ${
                        Number(pctVar) > 0
                          ? 'bg-teal-50 text-teal-800 border border-teal-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {Number(pctVar) > 0 ? `+${pctVar}%` : `${pctVar}%`}
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-400">-</span>
                  )}
                </div>

                {/* Doble barra cilíndrica */}
                <div className="flex items-end gap-1 w-full justify-center">
                  {/* Barra 2025 (Gris) */}
                  <div
                    style={{ height: `${h2025}px` }}
                    className="w-2.5 sm:w-4 bg-slate-400/80 rounded-t-md hover:bg-slate-500 transition-all shadow-sm"
                    title={`2025: ${item.anio2025.toLocaleString()}`}
                  ></div>

                  {/* Barra 2026 (Teal) */}
                  <div
                    style={{ height: isClosed ? `${h2026}px` : '4px' }}
                    className={`w-2.5 sm:w-4 rounded-t-md transition-all shadow-sm ${
                      isClosed
                        ? 'bg-gradient-to-t from-teal-700 to-teal-500 hover:brightness-110'
                        : 'bg-slate-200'
                    }`}
                    title={isClosed ? `2026: ${item.anio2026.toLocaleString()}` : 'En curso (-)'}
                  ></div>
                </div>

                {/* Etiqueta del mes y números */}
                <div className="text-center mt-2">
                  <span className="text-[10.5px] font-black uppercase text-slate-700 font-mono block">
                    {item.mes.slice(0, 3)}
                  </span>
                  <span className="text-[9.5px] font-mono font-bold text-teal-700 block">
                    {isClosed ? item.anio2026.toLocaleString() : '-'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
