import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { IngestionTelemetryView } from './components/IngestionTelemetryView';
import { DepartmentWorkspaceView } from './components/DepartmentWorkspaceView';
import { ProcessingErrorsView } from './components/ProcessingErrorsView';
import { ArchitectureExplorerView } from './components/ArchitectureExplorerView';
import { CarcMatrixView } from './components/CarcMatrixView';
import { ClaimDetailModal } from './components/ClaimDetailModal';
import { 
  INITIAL_DISPUTES, 
  INITIAL_INGESTION_BATCHES, 
  INITIAL_PROCESSING_ERRORS 
} from './data/mockData';
import { DenialDispute, IngestionBatch, DenialProcessingError, DepartmentWorkspace } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'ingestion' | 'workspaces' | 'errors' | 'architecture' | 'carc_matrix'>('ingestion');
  const [disputes, setDisputes] = useState<DenialDispute[]>(INITIAL_DISPUTES);
  const [batches, setBatches] = useState<IngestionBatch[]>(INITIAL_INGESTION_BATCHES);
  const [errors, setErrors] = useState<DenialProcessingError[]>(INITIAL_PROCESSING_ERRORS);
  const [selectedDispute, setSelectedDispute] = useState<DenialDispute | null>(null);

  // Aggregated totals
  const validClaimsCount = useMemo(() => {
    return batches.reduce((acc, b) => acc + b.validRecords, 0);
  }, [batches]);

  const errorClaimsCount = useMemo(() => {
    return batches.reduce((acc, b) => acc + b.errorRecords, 0);
  }, [batches]);

  const activeWorkers = useMemo(() => {
    return batches.find((b) => b.status === 'PARALLEL_PROCESSING')?.activeScaleWorkers || 16;
  }, [batches]);

  const totalDollarsDisputed = useMemo(() => {
    return disputes.reduce((sum, d) => sum + d.deniedAmount, 0);
  }, [disputes]);

  const handleUpdateDispute = (updated: DenialDispute) => {
    setDisputes((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
  };

  const handleBatchSimulatedNewClaims = (count: number) => {
    // Dynamically insert realistic claims to populate the 6 department workspaces during live ingestion
    if (Math.random() > 0.7) {
      const payers = [
        { id: 'BCBS-TX', name: 'Blue Cross Blue Shield of Texas' },
        { id: 'UHC-COMM', name: 'UnitedHealthcare Commercial' },
        { id: 'AETNA-01', name: 'Aetna Health Management' },
        { id: 'CIGNA-HLTH', name: 'Cigna Healthcare' },
        { id: 'HUMANA-MED', name: 'Humana Medicare Advantage' },
      ];
      const departments: DepartmentWorkspace[] = [
        'HUB_OPERATIONS',
        'TECHNICAL_REVIEW',
        'CLINICAL_REVIEW',
        'SUPPORT_REVIEW',
        'MANAGEMENT_GATE',
        'LEGAL_ARBITRATION',
      ];
      const randomPayer = payers[Math.floor(Math.random() * payers.length)];
      const randomDept = departments[Math.floor(Math.random() * departments.length)];
      const randomAmount = Math.round(1200 + Math.random() * 28000);
      const requiresMgmt = randomAmount > 10000;
      const isNSA = randomDept === 'LEGAL_ARBITRATION' || Math.random() > 0.8;

      const newDispute: DenialDispute = {
        id: `DSP-${Math.floor(100000 + Math.random() * 900000)}`,
        claimNumber: `CLM-2026-${Math.floor(80000 + Math.random() * 19999)}`,
        patientControlNumber: `PCN-${Math.floor(90000 + Math.random() * 9999)}`,
        patientName: `Patient ${Math.floor(100 + Math.random() * 900)}`,
        dateOfService: '2026-09-08',
        billedAmount: randomAmount,
        allowedAmount: Math.round(randomAmount * 0.15),
        deniedAmount: Math.round(randomAmount * 0.85),
        paidAmount: Math.round(randomAmount * 0.15),
        carcCode: randomDept === 'CLINICAL_REVIEW' ? '50' : randomDept === 'TECHNICAL_REVIEW' ? '4' : randomDept === 'SUPPORT_REVIEW' ? '22' : randomDept === 'MANAGEMENT_GATE' ? '29' : '96',
        carcDescription: 'Auto-categorized stream remittance line denial item.',
        rarcCode: 'N130',
        payerId: randomPayer.id,
        payerName: randomPayer.name,
        assignedDepartment: randomDept,
        status: 'INTAKE_PENDING',
        appealDeadline: '2026-11-15',
        writeOffRequiresManagement: requiresMgmt,
        isNoSurprisesActEligible: isNSA,
        batchId: 'BATCH-20260920-002',
        lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 19),
      };

      setDisputes((prev) => [newDispute, ...prev.slice(0, 50)]);
    }
  };

  const handleNewQuarantinedError = (newErr: DenialProcessingError) => {
    setErrors((prev) => [newErr, ...prev.slice(0, 50)]);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Enterprise System Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        validClaimsCount={validClaimsCount}
        errorClaimsCount={errorClaimsCount}
        activeWorkers={activeWorkers}
        totalDollarsDisputed={totalDollarsDisputed}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'ingestion' && (
          <IngestionTelemetryView
            batches={batches}
            setBatches={setBatches}
            onBatchSimulatedNewClaims={handleBatchSimulatedNewClaims}
            onNewQuarantinedError={handleNewQuarantinedError}
          />
        )}

        {activeTab === 'workspaces' && (
          <DepartmentWorkspaceView
            disputes={disputes}
            onUpdateDispute={handleUpdateDispute}
            onSelectDisputeForDetail={(d) => setSelectedDispute(d)}
          />
        )}

        {activeTab === 'errors' && (
          <ProcessingErrorsView
            errors={errors}
          />
        )}

        {activeTab === 'architecture' && (
          <ArchitectureExplorerView />
        )}

        {activeTab === 'carc_matrix' && (
          <CarcMatrixView />
        )}
      </main>

      {/* Claim Detail & Resolution Drawer/Modal */}
      {selectedDispute && (
        <ClaimDetailModal
          dispute={selectedDispute}
          onClose={() => setSelectedDispute(null)}
          onUpdateDispute={handleUpdateDispute}
        />
      )}
    </div>
  );
}
