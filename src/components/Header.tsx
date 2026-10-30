import React, { useEffect, useState, useRef } from 'react';
import { ActiveTab, IncidentRecord, MesType } from '../types';
import {
  BarChart3,
  FileSpreadsheet,
  Layers,
  MapPin,
  FileText,
  Clock,
  ShieldCheck,
  Lock,
  LogOut,
  RotateCcw,
  Upload,
  Download,
  ChevronDown,
  Table,
} from 'lucide-react';
import { useAuth } from '../utils/authContext';
import { SerenazgoLogo } from './SerenazgoLogo';
import { MESES_LIST } from '../data/mockData';
import {
  getAnnualConsolidatedData,
  exportAnnualConsolidatedExcel,
  exportAnnualConsolidatedPDF,
  exportMonthlyReportByMonth,
} from '../utils/reportGenerator';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  records?: IncidentRecord[];
  onResetFilters?: () => void;
  onOpenAnnualConsolidated?: () => void;
  onOpenReportModal?: () => void;
  onOpenExcelModal?: () => void;
  onOpenMonthlyReport?: (mes: MesType) => void;
  activeFiltersCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  records = [],
  onResetFilters,
  onOpenAnnualConsolidated,
  onOpenReportModal,
  onOpenExcelModal,
  onOpenMonthlyReport,
  activeFiltersCount = 0,
}) => {
  const { isAdmin, openAuthModal, logoutToViewer } = useAuth();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
      );
      setCurrentDate(
        now.toLocaleDateString('es-PE', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsExportDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'VISTA_RESUMEN', label: 'DASHBOARD EJECUTIVO', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'MAPA_CALOR', label: 'RADAR GEOESPACIAL', icon: <MapPin className="w-4 h-4" /> },
    { id: 'PLAN_OPERATIVOS', label: 'PLAN DE OPERATIVOS', icon: <Layers className="w-4 h-4" /> },
    { id: 'COMPARATIVO', label: 'COMPARATIVO 2025-2026', icon: <FileText className="w-4 h-4" /> },
    { id: 'DETALLE_INCIDENCIAS', label: 'DETALLE INCIDENCIAS', icon: <FileText className="w-4 h-4" /> },
    { id: 'BD', label: 'BD / EXCEL', icon: <FileSpreadsheet className="w-4 h-4" /> },
  ];

  // Handlers para el dropdown de exportación
  const handleExportAnnualPDF = () => {
    setIsExportDropdownOpen(false);
    const annualData = getAnnualConsolidatedData(records);
    exportAnnualConsolidatedPDF(annualData);
  };

  const handleExportAnnualExcel = () => {
    setIsExportDropdownOpen(false);
    const annualData = getAnnualConsolidatedData(records);
    exportAnnualConsolidatedExcel(annualData);
  };

  const handleExportMonthPDF = (mes: MesType) => {
    setIsExportDropdownOpen(false);
    if (onOpenMonthlyReport) {
      onOpenMonthlyReport(mes);
    } else {
      exportMonthlyReportByMonth(records, mes);
    }
  };

  return (
    <header className="bg-[#1e293b] text-white border-b border-slate-700 shadow-md sticky top-0 z-30">
      {/* ========================================================================= */}
      {/* TIER 1: CABECERA INSTITUCIONAL Y BOTONES DE ACCIÓN PRINCIPALES            */}
      {/* ========================================================================= */}
      <div className="px-4 sm:px-6 py-2.5 border-b border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          
          {/* Lado Izquierdo: Identidad Oficial Serenazgo Nuevo Chimbote */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center shrink-0">
              <SerenazgoLogo className="w-11 h-11 sm:w-12 sm:h-12 hover:scale-105 transition-transform drop-shadow" />
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500 border border-slate-900 shadow"></span>
              </span>
            </div>

            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-black tracking-wider text-white uppercase truncate font-sans">
                DASHBOARD EJECUTIVO DE SEGURIDAD CIUDADANA Y SERENAZGO
              </h1>
              <p className="text-[11px] text-slate-300 font-medium truncate mt-0.5">
                MUNICIPALIDAD DISTRITAL DE NUEVO CHIMBOTE &bull; MDNCH 2026 &bull; BASE CONSOLIDADA ({records.length > 0 ? records.length.toLocaleString() : '22,058'} REGISTROS)
              </p>
            </div>
          </div>

          {/* Lado Derecho: Botones de Acción Oficiales */}
          <div className="flex items-center gap-2 flex-wrap justify-between lg:justify-end">
            
            {/* Botón 1: "Borrar Filtros" */}
            {onResetFilters && (
              <button
                type="button"
                id="btn-header-reset-filters"
                onClick={onResetFilters}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm cursor-pointer"
                title={`Restablecer al instante todos los filtros (Mes, Comisaría, Zona, Turno) a los ${records.length > 0 ? records.length.toLocaleString() : '22,058'} casos originales`}
              >
                <RotateCcw className="w-3.5 h-3.5 text-teal-400" />
                <span>Borrar Filtros</span>
                {activeFiltersCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse ml-0.5"></span>
                )}
              </button>
            )}

            {/* Botón 2: DROPDOWN UNIFICADO "Exportar Reportes" */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                id="btn-header-export-reports"
                onClick={() => setIsExportDropdownOpen((prev) => !prev)}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 hover:from-teal-600 hover:to-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-sm border border-teal-400/50 cursor-pointer"
                title="Centro unificado de descargas y exportación de reportes"
              >
                <Download className="w-3.5 h-3.5 text-teal-200" />
                <span>Exportar Reportes</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-teal-200 transition-transform duration-200 ${
                    isExportDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Panel Desplegable del Dropdown */}
              {isExportDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-300 p-3.5 z-50 animate-fadeIn font-sans">
                  {/* Encabezado del Dropdown */}
                  <div className="px-2 pb-2 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-teal-700" />
                      <span className="text-xs font-black uppercase text-[#1e293b] tracking-wide">
                        Centro de Exportación de Reportes
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      MDNCH 2026
                    </span>
                  </div>

                  {/* SUBSECCIÓN 1: CONSOLIDADO ANUAL */}
                  <div className="pt-2.5 pb-1">
                    <div className="text-[10px] font-black uppercase text-slate-400 px-2 pb-1.5 flex items-center justify-between">
                      <span>Consolidado General Anual (12 Meses)</span>
                      <span className="text-[9px] text-slate-400 font-mono">
                        {records.length > 0 ? `${records.length.toLocaleString()} atenciones` : '22,058 atenciones'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 px-1">
                      {/* Opción 1: Exportar Anual a PDF */}
                      <button
                        type="button"
                        id="btn-dropdown-export-annual-pdf"
                        onClick={handleExportAnnualPDF}
                        className="w-full px-3 py-2 rounded-xl bg-gradient-to-r from-rose-50 to-rose-100/70 hover:from-rose-100 hover:to-rose-200/80 border border-rose-200 text-rose-950 text-left transition-all flex items-center gap-2 shadow-xs cursor-pointer group"
                      >
                        <div className="p-1.5 bg-rose-600 text-white rounded-lg shrink-0 group-hover:scale-105 transition-transform">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-black uppercase tracking-tight text-rose-950">
                            Exportar Anual a PDF
                          </div>
                          <div className="text-[9.5px] text-rose-700 font-medium">
                            Pág. 01 Matriz + Pág. 02 Gráfico
                          </div>
                        </div>
                      </button>

                      {/* Opción 2: Exportar Anual a Excel */}
                      <button
                        type="button"
                        id="btn-dropdown-export-annual-excel"
                        onClick={handleExportAnnualExcel}
                        className="w-full px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100/70 hover:from-emerald-100 hover:to-emerald-200/80 border border-emerald-200 text-emerald-950 text-left transition-all flex items-center gap-2 shadow-xs cursor-pointer group"
                      >
                        <div className="p-1.5 bg-emerald-600 text-white rounded-lg shrink-0 group-hover:scale-105 transition-transform">
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-black uppercase tracking-tight text-emerald-950">
                            Exportar Anual a Excel
                          </div>
                          <div className="text-[9.5px] text-emerald-700 font-medium">
                            Hoja de cálculo .xlsx completa
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* SUBSECCIÓN 2: REPORTES MENSUALES INDIVIDUALES (PDF - 2 HOJAS) */}
                  <div className="pt-2.5 mt-2 border-t border-slate-200">
                    <div className="px-2 pb-1.5 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-slate-600 font-bold">
                        Reporte Mensual Individual (PDF de 2 Hojas)
                      </span>
                      <span className="text-[9px] text-teal-700 font-bold bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                        Hoja 1 Matriz + Hoja 2 Gráfico Azul
                      </span>
                    </div>

                    <p className="px-2 text-[10px] text-slate-500 mb-2">
                      Haz clic en cualquier mes para previsualizar y descargar su reporte oficial en PDF (2 Hojas):
                    </p>

                    {/* Grilla interactiva de los 12 meses */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 px-1">
                      {MESES_LIST.map((mes) => {
                        const isSetiembre = mes === 'SETIEMBRE';
                        return (
                          <button
                            key={mes}
                            type="button"
                            onClick={() => handleExportMonthPDF(mes)}
                            className={`py-1.5 px-2 rounded-lg text-center transition-all flex flex-col items-center justify-center border cursor-pointer active:scale-95 shadow-xs ${
                              isSetiembre
                                ? 'bg-blue-600 text-white border-blue-700 hover:bg-blue-500'
                                : 'bg-slate-50 hover:bg-teal-50 text-slate-800 hover:text-teal-900 border-slate-200 hover:border-teal-300'
                            }`}
                            title={`Exportar Ficha Oficial en PDF de ${mes} (Hoja 1 Matriz de Casos + Hoja 2 Gráfico de Barras Azul)`}
                          >
                            <span className="text-[10px] font-mono font-black uppercase tracking-tight">
                              {mes.slice(0, 3)}
                            </span>
                            <span className={`text-[8.5px] font-bold ${isSetiembre ? 'text-blue-100' : 'text-slate-400'}`}>
                              {mes}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Accesos directos a visualizadores en pantalla */}
                  {(onOpenAnnualConsolidated || onOpenReportModal) && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between px-2 text-[10.5px]">
                      {onOpenAnnualConsolidated && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsExportDropdownOpen(false);
                            onOpenAnnualConsolidated();
                          }}
                          className="text-teal-700 hover:text-teal-900 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Table className="w-3 h-3" />
                          <span>Ver Matriz Anual</span>
                        </button>
                      )}
                      {onOpenReportModal && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsExportDropdownOpen(false);
                            onOpenReportModal();
                          }}
                          className="text-rose-700 hover:text-rose-900 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Visor A4 (4 Hojas)</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Botón 3: Modo Administrador / Subir Excel Supabase */}
            {isAdmin ? (
              <div className="flex items-center gap-1.5 bg-emerald-950 border border-emerald-500/80 rounded-xl px-2.5 py-1 text-xs shadow-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-[10.5px] font-black text-emerald-300 uppercase">
                  ADMIN ACTIVO
                </span>
                {onOpenExcelModal && (
                  <button
                    type="button"
                    onClick={onOpenExcelModal}
                    className="ml-1 px-2 py-0.5 rounded bg-emerald-800 hover:bg-emerald-700 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    title="Subir y sincronizar Excel en Supabase"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Subir Excel</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={logoutToViewer}
                  title="Cerrar sesión de Administrador"
                  className="p-1 text-emerald-400 hover:text-white rounded hover:bg-emerald-900 transition-colors ml-0.5 cursor-pointer"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                id="btn-header-admin-login"
                onClick={() => openAuthModal('Acceso a sincronización y subida a Supabase')}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 font-bold transition-all shadow-sm cursor-pointer"
                title="Acceso protegido por credenciales de administrador para sincronizar archivos con Supabase"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-[11px]">Modo Admin</span>
              </button>
            )}

            {/* Reloj Oficial */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/80 rounded-xl border border-slate-700 text-xs">
              <Clock className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <div className="flex flex-col text-right leading-none">
                <span className="font-mono font-bold text-teal-300">{currentTime}</span>
                <span className="text-[8.5px] text-slate-400 uppercase font-medium">{currentDate}</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TIER 2: PESTAÑAS DE VISTA                                                 */}
      {/* ========================================================================= */}
      <div className="px-4 sm:px-6 py-1.5 bg-[#0f172a] flex items-center justify-start overflow-x-auto scrollbar-none">
        <nav className="flex items-center gap-1.5 min-w-max">
          {navItems.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id.toLowerCase()}`}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-lg text-xs font-black uppercase transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-sm'
                    : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
