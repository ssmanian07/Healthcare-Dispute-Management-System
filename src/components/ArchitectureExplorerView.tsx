import React, { useState } from 'react';
import { ARCHITECTURE_SNIPPETS } from '../data/architectureSnippets';
import { 
  Copy, 
  Check, 
  Database, 
  Cpu, 
  Radio, 
  Layers, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  ArrowRightLeft 
} from 'lucide-react';

export const ArchitectureExplorerView: React.FC = () => {
  const [selectedSnippetId, setSelectedSnippetId] = useState<string>(ARCHITECTURE_SNIPPETS[0].id);
  const [copied, setCopied] = useState<boolean>(false);

  const activeSnippet = ARCHITECTURE_SNIPPETS.find((s) => s.id === selectedSnippetId) || ARCHITECTURE_SNIPPETS[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeSnippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Enterprise Architectural Comparison Overview */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div className="max-w-3xl mb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
              Cloud-Scale Healthcare Architectural Blueprint
            </span>
            <span className="text-xs text-slate-500 font-mono">Azure + .NET 9 + React 19</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            High-Volume System Architecture & Technical Specifications
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Engineered to sustain 1,000,000+ EDI 835 claims per ingestion batch without memory starvation, browser HTTP timeouts, or Azure SQL reader/writer locking deadlocks.
          </p>
        </div>

        {/* 3 Key Architectural Innovations vs Traditional Designs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-800 mb-2">
              <Zap className="w-4 h-4 text-blue-600" />
              <span>Direct SAS vs. API Proxy</span>
            </div>
            <div className="text-xs text-slate-600 leading-relaxed">
              <strong className="text-slate-800">Why:</strong> 250MB+ EDI files crash Web API gateways with Out-Of-Memory (OOM) and 504 timeouts.
            </div>
            <div className="mt-2 text-xs text-emerald-700 bg-emerald-50 p-2 rounded border border-emerald-200 font-medium">
              ✓ Client uploads directly to Azure Blob Storage via 15-min SAS token. Zero gateway buffering.
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-800 mb-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>5k Queue Leveling vs. Monolith</span>
            </div>
            <div className="text-xs text-slate-600 leading-relaxed">
              <strong className="text-slate-800">Why:</strong> A 1M record single-threaded job fails entirely if a single record fails halfway through.
            </div>
            <div className="mt-2 text-xs text-emerald-700 bg-emerald-50 p-2 rounded border border-emerald-200 font-medium">
              ✓ Line-by-line unbuffered reader splits batch into 200 isolated 5k queues processed concurrently.
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-800 mb-2">
              <Database className="w-4 h-4 text-purple-600" />
              <span>RCSI & Columnstore vs. B-Tree</span>
            </div>
            <div className="text-xs text-slate-600 leading-relaxed">
              <strong className="text-slate-800">Why:</strong> Heavy bulk writes lock tables, freezing operational hospital dashboards.
            </div>
            <div className="mt-2 text-xs text-emerald-700 bg-emerald-50 p-2 rounded border border-emerald-200 font-medium">
              ✓ RCSI maintains non-locking snapshots for readers; Clustered Columnstore compresses records 10x.
            </div>
          </div>
        </div>
      </div>

      {/* Code Snippet Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Snippet Navigation */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 px-1">
            Production Artifacts & Codebase
          </div>

          {ARCHITECTURE_SNIPPETS.map((snippet) => (
            <button
              key={snippet.id}
              onClick={() => setSelectedSnippetId(snippet.id)}
              className={`w-full p-4 rounded-xl border text-left transition-all cursor-pointer ${
                selectedSnippetId === snippet.id
                  ? 'bg-blue-50/70 border-blue-600 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  {snippet.layer}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {snippet.language.toUpperCase()}
                </span>
              </div>
              <div className="text-xs font-bold text-slate-900 mt-2">
                {snippet.title}
              </div>
              <div className="text-[11px] font-mono text-slate-500 mt-1 truncate">
                {snippet.filePath}
              </div>
            </button>
          ))}
        </div>

        {/* Right Code Content Pane */}
        <div className="lg:col-span-8 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-lg flex flex-col">
          {/* Header */}
          <div className="bg-slate-900 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white">
                {activeSnippet.title}
              </div>
              <div className="text-[11px] font-mono text-blue-400">
                {activeSnippet.filePath}
              </div>
            </div>

            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          {/* Description banner */}
          <div className="bg-slate-900/60 px-5 py-2.5 text-xs text-slate-300 border-b border-slate-800/60">
            {activeSnippet.description}
          </div>

          {/* Code block */}
          <div className="p-5 overflow-x-auto text-xs font-mono leading-relaxed text-slate-200 max-h-[520px] overflow-y-auto">
            <pre>
              <code>{activeSnippet.code}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
