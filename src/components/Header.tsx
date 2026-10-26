import React, { useEffect, useState } from 'react';
import { ActiveTab } from '../types';
import {
  BarChart3,
  FileSpreadsheet,
  Layers,
  MapPin,
  FileText,
  Clock,
  Radio,
  ShieldCheck,
  Lock,
  Unlock,
  LogOut,
  RotateCcw,
  Upload,
  Printer,
  Table,
  Flame,
} from 'lucide-react';
import { useAuth } from '../utils/authContext';
import { SerenazgoLogo } from './SerenazgoLogo';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onResetFilters?: () => void;
  onOpenAnnualConsolidated?: () => void;
  onOpenReportModal?: () => void;
  onOpenExcelModal?: () => void;
  onReplayIntro?: () => void;
  activeFiltersCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onResetFilters,
  onOpenAnnualConsolidated,
  onOpenReportModal,
  onOpenExcelModal,
  onReplayIntro,
  activeFiltersCount = 0,
}) => {
  const { isAdmin, adminEmail, openAuthModal, logoutToViewer } = useAuth();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

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

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'VISTA_RESUMEN', label: 'DASHBOARD EJECUTIVO', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'MAPA_CALOR', label: 'RADAR GEOESPACIAL', icon: <MapPin className="w-4 h-4" /> },
    { id: 'PLAN_OPERATIVOS', label: 'PLAN DE OPERATIVOS', icon: <Layers className="w-4 h-4" /> },
    { id: 'COMPARATIVO', label: 'COMPARATIVO 2025-2026', icon: <FileText className="w-4 h-4" /> },
    { id: 'DETALLE_INCIDENCIAS', label: 'DETALLE INCIDENCIAS', icon: <FileText className="w-4 h-4" /> },
    { id: 'BD', label: 'BD / EXCEL', icon: <FileSpreadsheet className="w-4 h-4" /> },
  ];

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
                MUNICIPALIDAD DISTRITAL DE NUEVO CHIMBOTE &bull; MDNCH 2026 &bull; BASE CONSOLIDADA (21,144 REGISTROS)
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
                title="Restablecer al instante todos los filtros (Mes, Comisaría, Zona, Turno) a los 21,144 casos originales"
              >
                <RotateCcw className="w-3.5 h-3.5 text-teal-400" />
                <span>Borrar Filtros</span>
                {activeFiltersCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse ml-0.5"></span>
                )}
              </button>
            )}

            {/* Botón 2: "Consolidado Anual" */}
            {onOpenAnnualConsolidated && (
              <button
                type="button"
                id="btn-header-annual-consolidated"
                onClick={onOpenAnnualConsolidated}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-700 to-teal-600 hover:from-teal-600 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-sm border border-teal-500 cursor-pointer"
                title="Abrir matriz completa de tipologías desglosada mes a mes de ENE a DIC con buscador, Excel y PDF"
              >
                <Table className="w-3.5 h-3.5 text-teal-200" />
                <span>Consolidado Anual</span>
              </button>
            )}

            {/* Botón 3: "Reporte PDF Oficial" (4 Hojas A4) */}
            {onOpenReportModal && (
              <button
                type="button"
                id="btn-header-pdf-official"
                onClick={onOpenReportModal}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-600 hover:to-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-sm border border-rose-500 cursor-pointer"
                title="Abrir visor oficial en formato estricto A4 distribuido en 4 hojas dedicadas con firma institucional"
              >
                <Printer className="w-3.5 h-3.5 text-rose-200" />
                <span>Reporte PDF Oficial</span>
              </button>
            )}

            {/* Botón Intro Cinemático Fiera de Fuego */}
            {onReplayIntro && (
              <button
                type="button"
                id="btn-header-replay-intro"
                onClick={onReplayIntro}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 border border-slate-600 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm cursor-pointer"
                title="Reproducir animación cinemática de la Fiera de Fuego con el escudo oficial"
              >
                <Flame className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
                <span className="hidden sm:inline">Intro Fiera</span>
              </button>
            )}

            {/* Botón 4: Modo Administrador / Subir Excel Supabase */}
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
