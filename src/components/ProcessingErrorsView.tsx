import React, { useState } from 'react';
import { DenialProcessingError } from '../types';
import { 
  AlertTriangle, 
  ShieldAlert, 
  RotateCw, 
  Search, 
  Filter, 
  CheckCircle2, 
  Terminal, 
  Download 
} from 'lucide-react';

interface ProcessingErrorsViewProps {
  errors: DenialProcessingError[];
  onReprocessError?: (errorId: string) => void;
}

export const ProcessingErrorsView: React.FC<ProcessingErrorsViewProps> = ({
  errors,
  onReprocessError,
}) => {
  const [selectedError, setSelectedError] = useState<DenialProcessingError | null>(errors[0] || null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const filteredErrors = errors.filter((err) => {
    if (categoryFilter !== 'ALL' && err.errorCategory !== categoryFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        err.claimNumber.toLowerCase().includes(q) ||
        err.batchId.toLowerCase().includes(q) ||
        err.errorDetail.toLowerCase().includes(q) ||
        err.rawLineSnippet.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-rose-950">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-rose-600 text-white shadow-xs">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-rose-950">
                  Quarantined Denial Processing Errors (<code className="font-mono text-sm">DenialProcessingErrors</code>)
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-rose-200 text-rose-800">
                  {errors.length} Quarantined Records
                </span>
              </div>
              <p className="text-xs text-rose-700 mt-1 max-w-3xl">
                Records rejected during Azure Function parallel queue execution due to schema violations, corrupt EDI 835 segments, or unmapped Payer IDs. Quarantining protects the primary <code className="font-mono bg-rose-100 px-1 py-0.5 rounded text-rose-900">DenialDisputes</code> table from integrity failures.
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs font-semibold text-rose-800">Split-Target Policy</div>
            <div className="text-xs text-rose-600 font-mono mt-0.5">
              100% Zero-Loss Audit Trail
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search corrupted claim #, batch ID, or raw snippet..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-3 py-2 font-medium focus:outline-hidden"
          >
            <option value="ALL">All Error Categories</option>
            <option value="Malformed EDI 835 CLP">Malformed EDI 835 CLP</option>
            <option value="Invalid CARC Code">Invalid CARC Code</option>
            <option value="Unrecognized Payer ID">Unrecognized Payer ID</option>
            <option value="Schema Constraint">Schema Constraint</option>
          </select>
        </div>
      </div>

      {/* 2-Column Error List + Raw Segment Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Error Table */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
            Quarantine Log ({filteredErrors.length} entries)
          </div>

          <div className="divide-y divide-slate-200 max-h-[500px] overflow-y-auto">
            {filteredErrors.map((err) => {
              const isSelected = selectedError?.id === err.id;
              return (
                <div
                  key={err.id}
                  onClick={() => setSelectedError(err)}
                  className={`p-4 transition-all cursor-pointer ${
                    isSelected ? 'bg-rose-50/60 border-l-4 border-l-rose-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-rose-900">
                      {err.claimNumber}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-rose-100 text-rose-800">
                      {err.errorCategory}
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 font-medium mt-1">
                    {err.errorDetail}
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>Batch: {err.batchId}</span>
                    <span>Row Index #{err.rawRecordIndex.toLocaleString()} &bull; {err.timestamp}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Raw Line Inspector */}
        <div className="lg:col-span-5 bg-slate-950 rounded-xl border border-slate-800 p-5 text-slate-200 font-mono text-xs flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-rose-400" />
                <span className="font-bold text-white">Raw EDI 835 Segment Inspector</span>
              </div>
              <span className="text-[11px] text-slate-500">ASCII / UTF-8</span>
            </div>

            {selectedError ? (
              <div className="space-y-4">
                <div>
                  <div className="text-slate-400 text-[11px] uppercase tracking-wider mb-1">
                    Error ID & Batch Identifier
                  </div>
                  <div className="text-white font-bold">{selectedError.id} &bull; {selectedError.batchId}</div>
                </div>

                <div>
                  <div className="text-slate-400 text-[11px] uppercase tracking-wider mb-1">
                    Validation Failure Reason
                  </div>
                  <div className="text-rose-300 bg-rose-950/40 p-2.5 rounded border border-rose-900/50">
                    {selectedError.errorDetail}
                  </div>
                </div>

                <div>
                  <div className="text-slate-400 text-[11px] uppercase tracking-wider mb-1">
                    Raw Stream Line Snippet
                  </div>
                  <div className="bg-black p-3 rounded border border-slate-800 text-amber-300 break-all leading-relaxed">
                    {selectedError.rawLineSnippet}
                  </div>
                </div>

                <div className="text-slate-400 text-[11px]">
                  Offset / Record Index: <span className="text-white">Line #{selectedError.rawRecordIndex.toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <div className="text-slate-500 text-center py-12">
                Select an error record on the left to inspect raw EDI stream payload.
              </div>
            )}
          </div>

          {selectedError && (
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-2 mt-4">
              <span className="text-[11px] text-slate-500">Stored in Azure SQL error partition</span>
              <button
                onClick={() => alert(`Simulated reprocessing for ${selectedError.id}: parsed and re-enqueued to Azure Storage Queue.`)}
                className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-sans text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                Reprocess Chunk
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
