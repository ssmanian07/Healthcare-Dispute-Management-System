import React from 'react';
import { Activity, ShieldCheck, Database, Radio, Building2 } from 'lucide-react';

interface HeaderProps {
  activeTab: 'ingestion' | 'workspaces' | 'errors' | 'architecture' | 'carc_matrix';
  setActiveTab: (tab: 'ingestion' | 'workspaces' | 'errors' | 'architecture' | 'carc_matrix') => void;
  validClaimsCount: number;
  errorClaimsCount: number;
  activeWorkers: number;
  totalDollarsDisputed: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  validClaimsCount,
  errorClaimsCount,
  activeWorkers,
  totalDollarsDisputed,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
      {/* Top tier brand and architecture status bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs font-semibold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                ApexHealth RCM
              </h1>
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                1M+ EDI Stream Engine
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              High-Volume Healthcare Dispute & Denial Management System
            </p>
          </div>
        </div>

        {/* Live Azure Infrastructure Indicators */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <Radio className="w-3.5 h-3.5" />
            <span>Azure SignalR Live</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 text-slate-700 border border-slate-200 font-medium">
            <Database className="w-3.5 h-3.5 text-blue-600" />
            <span>Azure SQL: RCSI Active</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 text-slate-700 border border-slate-200 font-medium">
            <Activity className="w-3.5 h-3.5 text-indigo-600" />
            <span>{activeWorkers} Azure Func Workers</span>
          </div>

          <div className="px-3 py-1 rounded-md bg-blue-50 text-blue-800 border border-blue-200 font-semibold">
            ${totalDollarsDisputed.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Disputed
          </div>
        </div>
      </div>

      {/* Navigation Sub-bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100 flex overflow-x-auto space-x-1 sm:space-x-4">
        <button
          id="nav-tab-ingestion"
          onClick={() => setActiveTab('ingestion')}
          className={`py-3 px-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'ingestion'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>1M+ Stream Ingestion</span>
          <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 font-semibold">
            {validClaimsCount.toLocaleString()}
          </span>
        </button>

        <button
          id="nav-tab-workspaces"
          onClick={() => setActiveTab('workspaces')}
          className={`py-3 px-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'workspaces'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>6-Department Workspaces</span>
        </button>

        <button
          id="nav-tab-errors"
          onClick={() => setActiveTab('errors')}
          className={`py-3 px-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'errors'
              ? 'border-rose-600 text-rose-600'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Quarantined Errors</span>
          <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-rose-100 text-rose-700 font-semibold">
            {errorClaimsCount.toLocaleString()}
          </span>
        </button>

        <button
          id="nav-tab-architecture"
          onClick={() => setActiveTab('architecture')}
          className={`py-3 px-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'architecture'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Architecture & Code (.NET 9 / Azure)</span>
        </button>

        <button
          id="nav-tab-carc-matrix"
          onClick={() => setActiveTab('carc_matrix')}
          className={`py-3 px-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'carc_matrix'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <span className="font-mono text-xs font-bold px-1.5 py-0.5 bg-slate-100 rounded text-slate-700">CARC/RARC</span>
          <span>Rules Matrix</span>
        </button>
      </div>
    </header>
  );
};
