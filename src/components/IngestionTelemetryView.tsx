import React, { useState, useEffect, useRef } from 'react';
import { IngestionBatch, DenialProcessingError } from '../types';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Server, 
  Layers, 
  ArrowRight, 
  Zap, 
  Cpu, 
  HardDrive,
  FileSpreadsheet
} from 'lucide-react';

interface IngestionTelemetryViewProps {
  batches: IngestionBatch[];
  setBatches: React.Dispatch<React.SetStateAction<IngestionBatch[]>>;
  onBatchSimulatedNewClaims: (count: number) => void;
  onNewQuarantinedError: (error: DenialProcessingError) => void;
}

export const IngestionTelemetryView: React.FC<IngestionTelemetryViewProps> = ({
  batches,
  setBatches,
  onBatchSimulatedNewClaims,
  onNewQuarantinedError,
}) => {
  const [selectedBatchId, setSelectedBatchId] = useState<string>(batches[0]?.id || '');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [streamSpeedMultiplier, setStreamSpeedMultiplier] = useState<number>(1);
  const [eventLogs, setEventLogs] = useState<Array<{ id: string; time: string; type: 'info' | 'success' | 'warn' | 'error'; message: string }>>([
    {
      id: 'log-1',
      time: '01:37:05',
      type: 'info',
      message: 'Azure SignalR WebSockets client handshake acknowledged: Hub=IngestionTelemetryHub',
    },
    {
      id: 'log-2',
      time: '01:37:12',
      type: 'success',
      message: 'Batch BATCH-20260920-001: 250 chunks of 5,000 records successfully committed via SqlBulkCopy.',
    },
    {
      id: 'log-3',
      time: '01:37:25',
      type: 'info',
      message: 'Azure Queue rcm-denial-chunks depth: 23 messages remaining across 24 active worker instances.',
    },
  ]);

  const activeBatch = batches.find((b) => b.id === selectedBatchId) || batches[0];
  const streamIntervalRef = useRef<number | null>(null);

  // Simulation loop for high-volume ingestion
  useEffect(() => {
    if (!isStreaming || !activeBatch || activeBatch.status === 'COMPLETED') {
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current);
        streamIntervalRef.current = null;
      }
      return;
    }

    streamIntervalRef.current = window.setInterval(() => {
      setBatches((prevBatches) => {
        return prevBatches.map((b) => {
          if (b.id !== activeBatch.id) return b;

          const recordsPerTick = 5000 * streamSpeedMultiplier;
          const newProcessed = Math.min(b.totalRecords, b.processedRecords + recordsPerTick);
          const chunkIncrement = Math.ceil(recordsPerTick / 5000);
          const newProcessedChunks = Math.min(b.totalChunks, b.processedChunks + chunkIncrement);
          
          // Realistic healthcare error rate: ~0.65% error rate
          const errorRatio = 0.0065;
          const newErrorsIncrement = Math.round(recordsPerTick * errorRatio);
          const newValidIncrement = recordsPerTick - newErrorsIncrement;

          const isNowCompleted = newProcessed >= b.totalRecords;
          const newThroughput = Math.round(18000 + Math.random() * 8000);

          if (isNowCompleted) {
            setIsStreaming(false);
          }

          // Emit claims and occasional error
          if (!isNowCompleted && Math.random() > 0.4) {
            onBatchSimulatedNewClaims(newValidIncrement);
            
            if (Math.random() > 0.6) {
              const mockErr: DenialProcessingError = {
                id: `ERR-${Date.now().toString().slice(-5)}`,
                batchId: b.id,
                rawRecordIndex: newProcessed,
                claimNumber: `CLM-EDI-${Math.floor(100000 + Math.random() * 900000)}`,
                errorCategory: Math.random() > 0.5 ? 'Invalid CARC Code' : 'Malformed EDI 835 CLP',
                errorDetail: 'EDI 835 parsing exception on CAS segment: amount exceeds total billed header.',
                rawLineSnippet: `CLP*SIM-${newProcessed}*1*${(Math.random() * 20000).toFixed(2)}*0.00**12~`,
                timestamp: new Date().toLocaleTimeString(),
              };
              onNewQuarantinedError(mockErr);
            }
          }

          return {
            ...b,
            processedRecords: newProcessed,
            validRecords: b.validRecords + (isNowCompleted ? (b.totalRecords - b.processedRecords) : newValidIncrement),
            errorRecords: b.errorRecords + (isNowCompleted ? 0 : newErrorsIncrement),
            processedChunks: newProcessedChunks,
            recordsPerSecond: isNowCompleted ? 0 : newThroughput,
            activeScaleWorkers: isNowCompleted ? 0 : Math.min(32, 16 + Math.floor(Math.random() * 12)),
            status: isNowCompleted ? 'COMPLETED' : 'PARALLEL_PROCESSING',
            completedAt: isNowCompleted ? new Date().toISOString().replace('T', ' ').slice(0, 19) : b.completedAt,
          };
        });
      });

      // Add SignalR stream log entry
      if (Math.random() > 0.5) {
        const time = new Date().toLocaleTimeString();
        setEventLogs((prev) => [
          {
            id: `log-${Date.now()}`,
            time,
            type: 'info',
            message: `[SignalR Broadcast] Chunk #${activeBatch.processedChunks + 1} processed: 5,000 records committed to Azure SQL (RCSI Snapshot active).`,
          },
          ...prev.slice(0, 40),
        ]);
      }
    }, 400);

    return () => {
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current);
        streamIntervalRef.current = null;
      }
    };
  }, [isStreaming, activeBatch?.id, activeBatch?.status, streamSpeedMultiplier]);

  const handleStartFresh1MBatch = () => {
    const newId = `BATCH-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;
    const newBatch: IngestionBatch = {
      id: newId,
      fileName: 'EDI835_NATIONAL_PAYERS_1M_STREAM.dat',
      fileSizeBytes: 215_400_000,
      totalRecords: 1_000_000,
      processedRecords: 0,
      validRecords: 0,
      errorRecords: 0,
      totalChunks: 200,
      processedChunks: 0,
      status: 'BLOB_STREAMING',
      recordsPerSecond: 22_500,
      activeScaleWorkers: 24,
      startedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      blobSasUri: 'https://rcmblobs.blob.core.windows.net/edi-raw/incoming?sp=cw&se=2026-09-20T04:30:00Z',
    };

    setBatches((prev) => [newBatch, ...prev]);
    setSelectedBatchId(newId);
    setIsStreaming(true);

    setEventLogs((prev) => [
      {
        id: `log-init-${Date.now()}`,
        time: new Date().toLocaleTimeString(),
        type: 'success',
        message: `Generated Shared Access Signature (SAS) Token for direct browser-to-blob streaming: ${newBatch.fileName} (1,000,000 records).`,
      },
      ...prev,
    ]);
  };

  const progressPct = activeBatch
    ? Math.min(100, Math.round((activeBatch.processedRecords / activeBatch.totalRecords) * 100))
    : 0;

  return (
    <div className="space-y-6">
      {/* Overview & Architecture Ingestion banner */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                1M+ Claim Records Stream Architecture
              </span>
              <span className="text-xs text-slate-400">EDI 835 & Remittance Advice</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              High-Volume Async Ingestion & Live Telemetry Engine
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Direct Azure Blob SAS Upload &rarr; Serverless Line-by-Line Chunker (5k records) &rarr; Azure Storage Queue Leveling &rarr; Parallel Scaled Workers with <code className="text-blue-300 bg-slate-800 px-1 py-0.5 rounded font-mono text-xs">SqlBulkCopy</code> &rarr; Split-Target Routing (Valid vs. Quarantined Errors).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="btn-start-1m-batch"
              onClick={handleStartFresh1MBatch}
              className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              Stream New 1,000,000 EDI Batch
            </button>

            {activeBatch && activeBatch.status !== 'COMPLETED' && (
              <button
                id="btn-toggle-streaming"
                onClick={() => setIsStreaming(!isStreaming)}
                className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer ${
                  isStreaming
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {isStreaming ? (
                  <>
                    <Pause className="w-4 h-4" />
                    Pause Ingestion
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Resume Ingestion
                  </>
                )}
              </button>
            )}

            <button
              id="btn-speed-toggle"
              onClick={() => setStreamSpeedMultiplier((prev) => (prev === 1 ? 2 : prev === 2 ? 4 : 1))}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono font-medium text-slate-200 border border-slate-700 cursor-pointer"
              title="Change ingestion processing simulation multiplier"
            >
              Speed: {streamSpeedMultiplier}x
            </button>
          </div>
        </div>

        {/* 6-Stage Pipeline Flow Architecture Diagram */}
        <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
              <HardDrive className="w-4 h-4" />
              <span>1. Direct Blob SAS</span>
            </div>
            <div className="mt-2 text-xs text-slate-300">
              Bypasses API Gateway payload limits. Direct streaming.
            </div>
            <div className="mt-2 text-[10px] font-mono text-emerald-400">
              ✓ SAS Validated
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400">
              <Cpu className="w-4 h-4" />
              <span>2. Unbuffered Chunk</span>
            </div>
            <div className="mt-2 text-xs text-slate-300">
              Line-by-line StreamReader. 5,000 records / chunk.
            </div>
            <div className="mt-2 text-[10px] font-mono text-indigo-300">
              Zero Memory Bloat
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
              <Layers className="w-4 h-4" />
              <span>3. Queue Leveling</span>
            </div>
            <div className="mt-2 text-xs text-slate-300">
              Azure Storage Queues prevent spikes from overwhelming DB.
            </div>
            <div className="mt-2 text-[10px] font-mono text-amber-300">
              Load Leveled
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
              <Server className="w-4 h-4" />
              <span>4. Elastic Workers</span>
            </div>
            <div className="mt-2 text-xs text-slate-300">
              Scaled Azure Functions validate CARC/RARC domain rules.
            </div>
            <div className="mt-2 text-[10px] font-mono text-cyan-300">
              {activeBatch?.activeScaleWorkers || 16} Instances Active
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <Zap className="w-4 h-4" />
              <span>5. SqlBulkCopy</span>
            </div>
            <div className="mt-2 text-xs text-slate-300">
              Bulk stream writes to <code className="text-white">DenialDisputes</code> with RCSI.
            </div>
            <div className="mt-2 text-[10px] font-mono text-emerald-300">
              No Row/Page Locks
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-400">
              <AlertTriangle className="w-4 h-4" />
              <span>6. Error Quarantine</span>
            </div>
            <div className="mt-2 text-xs text-slate-300">
              Unvalidated records routed to <code className="text-white">DenialProcessingErrors</code>.
            </div>
            <div className="mt-2 text-[10px] font-mono text-rose-300">
              Split Target Active
            </div>
          </div>
        </div>
      </div>

      {/* Real-time telemetry metrics cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Ingestion Progress
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-slate-900">
              {activeBatch?.processedRecords.toLocaleString()}
              <span className="text-xs font-normal text-slate-500 ml-1">
                / {activeBatch?.totalRecords.toLocaleString()} recs
              </span>
            </div>
            <span className="text-sm font-semibold text-blue-600">{progressPct}%</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            ></div>
          </div>
          <div className="mt-2 flex justify-between text-xs text-slate-500">
            <span>{activeBatch?.processedChunks} / {activeBatch?.totalChunks} Chunks (5k/chunk)</span>
            <span className="font-semibold text-slate-700">{activeBatch?.status}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Throughput Velocity
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-slate-900">
              {activeBatch?.recordsPerSecond.toLocaleString()}
            </div>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
              Records / Sec
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
            <span>Active Worker Nodes:</span>
            <span className="font-semibold text-slate-900 font-mono">
              {activeBatch?.activeScaleWorkers} Functions
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
            <span>Average Chunk Ingestion:</span>
            <span className="font-semibold text-emerald-600 font-mono">~180ms / 5k</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Valid Claims Stream (DenialDisputes)
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-emerald-700">
              {activeBatch?.validRecords.toLocaleString()}
            </div>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
              {activeBatch?.processedRecords ? ((activeBatch.validRecords / activeBatch.processedRecords) * 100).toFixed(1) : 100}%
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
            <span>Destination:</span>
            <span className="font-mono text-slate-800 font-medium">dbo.DenialDisputes</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
            <span>Indexing:</span>
            <span className="font-medium text-blue-700">Clustered Columnstore</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Quarantined (DenialProcessingErrors)
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-rose-600">
              {activeBatch?.errorRecords.toLocaleString()}
            </div>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-rose-50 text-rose-700">
              {activeBatch?.processedRecords ? ((activeBatch.errorRecords / activeBatch.processedRecords) * 100).toFixed(2) : 0}% error rate
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
            <span>Destination:</span>
            <span className="font-mono text-slate-800 font-medium">dbo.DenialProcessingErrors</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
            <span>Schema Enforcement:</span>
            <span className="font-medium text-amber-700">CARC/RARC/Payer Validated</span>
          </div>
        </div>
      </div>

      {/* Batch Selector & Live Telemetry Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Batches list */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-blue-600" />
              Active Ingestion Batches
            </h3>
            <span className="text-xs font-medium text-slate-500">
              {batches.length} Batches
            </span>
          </div>

          <div className="space-y-3">
            {batches.map((b) => (
              <div
                key={b.id}
                onClick={() => setSelectedBatchId(b.id)}
                className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all ${
                  selectedBatchId === b.id
                    ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-slate-900">{b.id}</span>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      b.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : b.status === 'PARALLEL_PROCESSING'
                        ? 'bg-blue-100 text-blue-800 animate-pulse'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {b.status}
                  </span>
                </div>

                <div className="text-xs text-slate-600 font-medium mt-1 truncate">
                  {b.fileName}
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{b.processedRecords.toLocaleString()} / {b.totalRecords.toLocaleString()} recs</span>
                  <span>{b.processedChunks}/{b.totalChunks} chunks</span>
                </div>

                <div className="mt-1.5 w-full bg-slate-200 rounded-full h-1 overflow-hidden">
                  <div
                    className="bg-blue-600 h-1 rounded-full"
                    style={{ width: `${Math.min(100, Math.round((b.processedRecords / b.totalRecords) * 100))}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live SignalR Event Log Terminal */}
        <div className="lg:col-span-2 bg-slate-950 rounded-xl p-5 border border-slate-800 text-slate-200 font-mono text-xs flex flex-col shadow-inner">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="font-semibold text-slate-100 text-xs">
                Azure SignalR Real-Time Telemetry Stream
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              Hub: IngestionTelemetryHub &bull; WebSocket: WSS (TLS 1.3)
            </span>
          </div>

          <div className="flex-1 overflow-y-auto max-h-72 space-y-1.5 pr-2">
            {eventLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                <span className="text-slate-500 shrink-0">{log.time}</span>
                <span
                  className={`font-semibold shrink-0 ${
                    log.type === 'success'
                      ? 'text-emerald-400'
                      : log.type === 'warn'
                      ? 'text-amber-400'
                      : log.type === 'error'
                      ? 'text-rose-400'
                      : 'text-blue-400'
                  }`}
                >
                  [{log.type.toUpperCase()}]
                </span>
                <span className="text-slate-300">{log.message}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <span>Buffer: 5,000-record JSON chunks &bull; Read Committed Snapshot Isolation (RCSI) Active</span>
            <button
              onClick={() => setEventLogs([])}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Clear Log
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
