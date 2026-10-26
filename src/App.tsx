/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  IncidentRecord,
  ActiveTab,
  PatrolUnit,
  ZonaType,
  TurnoType,
  ComisariaType,
  MesType,
} from './types';
import { INITIAL_PATROL_UNITS, generateInitialRecords } from './data/mockData';
import { soundManager } from './utils/audioAlert';
import { AuthProvider, useAuth } from './utils/authContext';
import { AdminAuthModal } from './components/AdminAuthModal';
import {
  supabase,
  fetchAllRegistrosFromSupabase,
  uploadExcelFileToSupabase,
  UploadProgressInfo,
  SUPABASE_TABLE,
} from './utils/supabaseClient';

// Municipal Dashboard Components
import { Header } from './components/Header';
import { ExecutiveDashboardView } from './components/ExecutiveDashboardView';
import { TacticalMapView } from './components/TacticalMapView';
import { MapErrorBoundary } from './components/MapErrorBoundary';
import { PlanOperativosView } from './components/PlanOperativosView';
import { ComparativoView } from './components/ComparativoView';
import { DetalleIncidenciasView } from './components/DetalleIncidenciasView';
import { DatabaseExcelHub } from './components/DatabaseExcelHub';
import { Footer } from './components/Footer';
import { IntroOverlay } from './components/IntroOverlay';

// Modals
import { ExcelUploadModal } from './components/ExcelUploadModal';
import { ReportPrintModal } from './components/ReportPrintModal';
import { AnnualConsolidatedModal } from './components/AnnualConsolidatedModal';
import { SaveConfirmationToast } from './components/SaveConfirmationToast';
import {
  saveAllDataToStorage,
  clearAllSavedData,
} from './utils/persistenceHelper';
import { RefreshCw, HardDrive, Database, AlertTriangle, CheckCircle2 } from 'lucide-react';

function DashboardInner() {
  const { requireAdmin, isAdmin } = useAuth();

  // 1. Base oficial de datos inicializada de inmediato con el dataset cerrado de 21,144 registros
  const [baseDeDatos, setBaseDeDatos] = useState<IncidentRecord[]>(() => generateInitialRecords());
  const records = baseDeDatos;
  const setRecords = setBaseDeDatos;

  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);
  const [fileLoadError, setFileLoadError] = useState<string | null>(null);
  const [isCustomDataLoaded, setIsCustomDataLoaded] = useState<boolean>(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>('Dataset Cerrado 2026 (21,144 atenciones)');

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [justSaved, setJustSaved] = useState<boolean>(false);
  const [isSaveToastOpen, setIsSaveToastOpen] = useState<boolean>(false);

  // Patrol Units
  const [patrolUnits] = useState<PatrolUnit[]>(INITIAL_PATROL_UNITS);

  // 2. Active Tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('VISTA_RESUMEN');

  // 3. Slicers y Filtros Matriciales
  const [selectedMes, setSelectedMes] = useState<MesType | null>(null);
  const [selectedComisaria, setSelectedComisaria] = useState<ComisariaType | null>(null);
  const [selectedZona, setSelectedZona] = useState<ZonaType | null>(null);
  const [selectedTurno, setSelectedTurno] = useState<TurnoType | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 4. Modals y Cinemática
  const [showIntro, setShowIntro] = useState<boolean>(true);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isAnnualConsolidatedModalOpen, setIsAnnualConsolidatedModalOpen] = useState(false);

  const [dataSourceType, setDataSourceType] = useState<'SUPABASE' | 'DATASET_OFICIAL'>('DATASET_OFICIAL');

  // Sincronización en vivo con Supabase (tablas atenciones_2026, atenciones o registros)
  const loadSupabaseData = async (silent: boolean = false) => {
    if (!silent) setIsLoadingFile(true);
    setFileLoadError(null);

    try {
      const result = await fetchAllRegistrosFromSupabase();

      if (result.status === 'ERROR') {
        const errMsg = result.error?.message || 'Error al conectar con Supabase';
        console.warn('Aviso Supabase:', errMsg);
        setFileLoadError(errMsg);
        setIsLoadingFile(false);
        return;
      }

      if (result.records && result.records.length > 0) {
        setBaseDeDatos(result.records);
        setIsCustomDataLoaded(true);
        setLastSavedAt(`Supabase en Vivo: ${result.records.length.toLocaleString()} registros sincronizados`);
        setDataSourceType('SUPABASE');
        setIsLoadingFile(false);
        return;
      }

      // Si Supabase devuelve 0 filas, mantener el dataset oficial de 21,144 registros
      setIsLoadingFile(false);
    } catch (err: unknown) {
      console.warn('Aviso conexión Supabase:', err);
      setIsLoadingFile(false);
    }
  };

  // Carga inicial y escucha de cambios en Supabase
  useEffect(() => {
    loadSupabaseData(true);

    const channel = supabase
      .channel('schema-db-changes-atenciones')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        () => {
          loadSupabaseData(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 5. Cálculo dinámico de registros filtrados según los Slicers
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (selectedMes && r.mes !== selectedMes) return false;
      if (selectedComisaria && r.comisaria !== selectedComisaria) return false;
      if (selectedZona && r.zona !== selectedZona) return false;
      if (selectedTurno && r.turno !== selectedTurno) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const match =
          (r.ubicacion && r.ubicacion.toLowerCase().includes(q)) ||
          (r.lugar && r.lugar.toLowerCase().includes(q)) ||
          (r.columna1 && r.columna1.toLowerCase().includes(q)) ||
          (r.observacion && r.observacion.toLowerCase().includes(q)) ||
          (r.tipoIncidencia && r.tipoIncidencia.toLowerCase().includes(q)) ||
          (r.subsector && r.subsector.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [records, selectedMes, selectedComisaria, selectedZona, selectedTurno, searchQuery]);

  // Restablece al instante todos los filtros a sus 21,144 casos originales
  const handleResetFilters = () => {
    setSelectedMes(null);
    setSelectedComisaria(null);
    setSelectedZona(null);
    setSelectedTurno(null);
    setSearchQuery('');
    soundManager.playClick();
  };

  const activeFiltersCount =
    (selectedMes ? 1 : 0) +
    (selectedComisaria ? 1 : 0) +
    (selectedZona ? 1 : 0) +
    (selectedTurno ? 1 : 0);

  // Subir y sincronizar archivo con Supabase
  const handleUploadFileToSupabase = async (file: File) => {
    requireAdmin('Sincronización oficial de base de datos a Supabase', async () => {
      setIsLoadingFile(true);
      try {
        const res = await uploadExcelFileToSupabase(file, (info: UploadProgressInfo) => {
          if (info.stage === 'COMPLETED') {
            soundManager.playSuccess();
          }
        });

        if (res.success) {
          await loadSupabaseData(true);
          setIsExcelModalOpen(false);
          setIsSaveToastOpen(true);
        } else {
          alert(`Error al sincronizar con Supabase: ${res.error || 'Desconocido'}`);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error desconocido';
        alert(`Fallo en la sincronización: ${msg}`);
      } finally {
        setIsLoadingFile(false);
      }
    });
  };

  const handleDataImported = async (newRecords: IncidentRecord[], _append?: boolean) => {
    setRecords(newRecords);
    setIsCustomDataLoaded(true);
    handleResetFilters();
    try {
      await saveAllDataToStorage(newRecords);
    } catch (e) {
      console.warn('Storage save warning:', e);
    }
    soundManager.playSuccess();
    setIsSaveToastOpen(true);
    setActiveTab('VISTA_RESUMEN');
  };

  const handleDeleteRecord = (id: string) => {
    requireAdmin('Eliminar registro oficial de atención', () => {
      setRecords((prev) => prev.filter((r) => r.id !== id && r.codigo !== id));
      setHasUnsavedChanges(true);
      soundManager.playClick();
    });
  };

  const handleSaveChanges = async () => {
    try {
      const res = await saveAllDataToStorage(records);
      if (res.success) {
        setLastSavedAt(res.timestamp);
        setHasUnsavedChanges(false);
        setJustSaved(true);
        soundManager.playSuccess();
        setIsSaveToastOpen(true);
        setTimeout(() => setJustSaved(false), 4000);
      }
    } catch (err: unknown) {
      console.warn('Save notice:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#e8ecef] text-slate-800 antialiased font-sans">
      
      {/* Intro Cinemático Oficial de la Fiera de Fuego con Escudo de Serenazgo */}
      {showIntro && (
        <IntroOverlay onEnter={() => setShowIntro(false)} />
      )}

      {/* Top Header Institucional Marino #1e293b con Botones de Acción */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onResetFilters={handleResetFilters}
        onOpenAnnualConsolidated={() => setIsAnnualConsolidatedModalOpen(true)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenExcelModal={() => setIsExcelModalOpen(true)}
        onReplayIntro={() => setShowIntro(true)}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Main Container */}
      <main className="flex-1 p-3 sm:p-5 flex flex-col w-full max-w-[1920px] mx-auto">
        
        {/* Banner Informativo de Sincronización Supabase / Dataset Oficial */}
        <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-white rounded-xl border border-[#e2e8f0] shadow-xs text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
            </span>
            <span>
              {dataSourceType === 'SUPABASE' ? (
                <>
                  <strong className="text-teal-700 font-black">Supabase en Vivo:</strong> Sincronizando tabla "{SUPABASE_TABLE}" &bull;{' '}
                  <strong className="font-mono text-slate-900 font-black">{filteredRecords.length.toLocaleString()}</strong> de{' '}
                  <strong className="font-mono">{records.length.toLocaleString()}</strong> registros
                </>
              ) : (
                <>
                  <strong className="text-[#1e293b] font-black">Dataset Oficial Cerrado 2026:</strong> Mostrando{' '}
                  <strong className="font-mono text-teal-700 font-black">{filteredRecords.length.toLocaleString()}</strong> de{' '}
                  <strong className="font-mono font-black">{records.length.toLocaleString()}</strong> atenciones oficiales
                </>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-300 font-bold text-[11px] flex items-center gap-1">
                <span>Filtros Activos ({activeFiltersCount})</span>
                <button
                  onClick={handleResetFilters}
                  className="text-amber-900 font-black hover:underline cursor-pointer"
                >
                  &times; Borrar
                </button>
              </span>
            )}
            <button
              onClick={() => loadSupabaseData()}
              className="text-[11px] font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 hover:underline cursor-pointer"
              title="Volver a consultar registros en vivo en Supabase"
            >
              <RefreshCw className={`w-3 h-3 ${isLoadingFile ? 'animate-spin' : ''}`} />
              <span>Sincronizar Supabase</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VISTA 1: DASHBOARD EJECUTIVO (MODELO VISUAL EXCEL HECHO FÁCIL)            */}
        {/* ========================================================================= */}
        {activeTab === 'VISTA_RESUMEN' && (
          <ExecutiveDashboardView
            records={filteredRecords}
            allRecords={records}
            selectedMes={selectedMes}
            selectedComisaria={selectedComisaria}
            selectedZona={selectedZona}
            selectedTurno={selectedTurno}
            onSelectMes={setSelectedMes}
            onSelectComisaria={setSelectedComisaria}
            onSelectZona={setSelectedZona}
            onSelectTurno={setSelectedTurno}
          />
        )}

        {/* VISTA 2: RADAR GEOESPACIAL Y MAPA TÁCTICO */}
        {activeTab === 'MAPA_CALOR' && (
          <div className="flex-1 flex flex-col min-h-[680px] rounded-2xl overflow-hidden border border-[#e2e8f0] shadow-sm bg-slate-950">
            <MapErrorBoundary fallbackTitle="Radar Geoespacial y Mapa de Calor Leaflet">
              <TacticalMapView
                records={filteredRecords}
                patrolUnits={patrolUnits}
                onSelectIncident={() => {}}
                onDispatchUnit={(unitId, loc) => {
                  soundManager.playEmergency();
                  alert(`¡Unidad ${unitId} despachada hacia ${loc}! Notificación enviada.`);
                }}
              />
            </MapErrorBoundary>
          </div>
        )}

        {/* VISTA 3: PLAN DE OPERATIVOS */}
        {activeTab === 'PLAN_OPERATIVOS' && <PlanOperativosView />}

        {/* VISTA 4: COMPARATIVO */}
        {activeTab === 'COMPARATIVO' && <ComparativoView records={filteredRecords} />}

        {/* VISTA 5: DETALLE DE INCIDENCIAS */}
        {activeTab === 'DETALLE_INCIDENCIAS' && (
          <DetalleIncidenciasView
            records={filteredRecords}
            onDeleteRecord={handleDeleteRecord}
            onViewOnMap={() => setActiveTab('MAPA_CALOR')}
            onSaveChanges={handleSaveChanges}
            hasUnsavedChanges={hasUnsavedChanges}
            lastSavedAt={lastSavedAt}
          />
        )}

        {/* VISTA 6: BASE DE DATOS / EXCEL */}
        {activeTab === 'BD' && (
          <DatabaseExcelHub
            records={filteredRecords}
            isCustomDataLoaded={isCustomDataLoaded}
            onDataImported={handleDataImported}
            onResetToDefault={() => loadSupabaseData()}
            onDeleteRecord={handleDeleteRecord}
            onViewOnMap={() => setActiveTab('MAPA_CALOR')}
            onSaveChanges={handleSaveChanges}
            lastSavedAt={lastSavedAt}
            hasUnsavedChanges={hasUnsavedChanges}
            onOpenUploadModal={() => setIsExcelModalOpen(true)}
          />
        )}

      </main>

      {/* Pie de Página Institucional con Créditos de Desarrollador */}
      <Footer />

      {/* ========================================================================= */}
      {/* MODALES DEL SISTEMA                                                       */}
      {/* ========================================================================= */}

      {/* Modal 1: Reporte PDF Oficial en Formato A4 (4 Hojas Dedicadas) */}
      <ReportPrintModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        records={filteredRecords}
        totalRecordsCount={records.length}
      />

      {/* Modal 2: Consolidado General Anual 2026 (Matriz Completa con '-' en Nov/Dic) */}
      <AnnualConsolidatedModal
        isOpen={isAnnualConsolidatedModalOpen}
        onClose={() => setIsAnnualConsolidatedModalOpen(false)}
        records={records}
      />

      {/* Modal 3: Subida y Sincronización Excel a Supabase */}
      <ExcelUploadModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        onDataImported={handleDataImported}
        onResetToDefault={() => loadSupabaseData()}
        isCustomDataLoaded={isCustomDataLoaded}
        currentCount={records.length}
        onUploadFileToSupabase={handleUploadFileToSupabase}
      />

      {/* Modal 4: Autenticación de Administrador */}
      <AdminAuthModal />

      {/* Toast de Confirmación de Guardado */}
      <SaveConfirmationToast
        isOpen={isSaveToastOpen}
        onClose={() => setIsSaveToastOpen(false)}
        recordsCount={records.length}
        records={records}
        lastSavedAt={lastSavedAt}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DashboardInner />
    </AuthProvider>
  );
}
