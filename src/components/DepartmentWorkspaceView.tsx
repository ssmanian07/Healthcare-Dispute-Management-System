import React, { useState } from 'react';
import { DepartmentWorkspace, DenialDispute, DenialStatus } from '../types';
import { 
  Building2, 
  Code, 
  Stethoscope, 
  UserCheck, 
  ShieldAlert, 
  Scale, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  ChevronRight, 
  DollarSign,
  FileText
} from 'lucide-react';

interface DepartmentWorkspaceViewProps {
  disputes: DenialDispute[];
  onUpdateDispute: (updated: DenialDispute) => void;
  onSelectDisputeForDetail: (dispute: DenialDispute) => void;
}

interface WorkspaceConfig {
  id: DepartmentWorkspace;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  description: string;
  primaryResponsibilities: string[];
}

export const WORKSPACE_CONFIGS: WorkspaceConfig[] = [
  {
    id: 'HUB_OPERATIONS',
    label: '1. HUB Operations',
    shortLabel: 'HUB Ops',
    icon: Building2,
    color: 'blue',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    description: 'Central intake, bulk EDI 835 triage, automatic CARC/RARC categorization, and multi-department task routing.',
    primaryResponsibilities: ['Initial intake triage', 'Automated CARC rule matching', 'Department queue routing', 'Batch tracking'],
  },
  {
    id: 'TECHNICAL_REVIEW',
    label: '2. Technical Review',
    shortLabel: 'Technical',
    icon: Code,
    color: 'indigo',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    textColor: 'text-indigo-700',
    description: 'Coding validation, modifier -25/-59 mismatches, NCCI Procedure-to-Procedure (PTP) edits, and 837P/I re-submissions.',
    primaryResponsibilities: ['HIM coding audit', 'Modifier adjustments (-59, -25)', 'NCCI edit resolution', 'EDI clearinghouse re-file'],
  },
  {
    id: 'CLINICAL_REVIEW',
    label: '3. Clinical Review',
    shortLabel: 'Clinical',
    icon: Stethoscope,
    color: 'emerald',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-700',
    description: 'Medical necessity denials (CARC 50), experimental treatment challenges, EHR documentation extraction, and MD Peer-to-Peer.',
    primaryResponsibilities: ['Medical necessity dossiers', 'Operative report extraction', 'Physician peer-to-peer review', 'Letter of medical necessity'],
  },
  {
    id: 'SUPPORT_REVIEW',
    label: '4. Support Review',
    shortLabel: 'Support',
    icon: UserCheck,
    color: 'amber',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-800',
    description: 'Missing patient demographics, insurance primary/secondary Coordination of Benefits (COB CARC 22), and eligibility re-checks.',
    primaryResponsibilities: ['COB order clarification', 'Patient eligibility verification', 'Medicare secondary payer lookup', 'Demographic corrections'],
  },
  {
    id: 'MANAGEMENT_GATE',
    label: '5. Management Gate',
    shortLabel: 'Mgmt Gate',
    icon: ShieldAlert,
    color: 'rose',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    textColor: 'text-rose-700',
    description: 'Mandatory executive authorization gate for high-dollar write-offs exceeding $10,000 threshold or expired timely filing.',
    primaryResponsibilities: ['High-dollar write-off sign-off (>$10,000)', 'Timely filing loss mitigation', 'Financial risk audit trail', 'Vendor clearinghouse escalations'],
  },
  {
    id: 'LEGAL_ARBITRATION',
    label: '6. Legal / Arbitration Node',
    shortLabel: 'Legal / NSA',
    icon: Scale,
    color: 'purple',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700',
    description: 'Federal No Surprises Act (NSA) compliance, Independent Dispute Resolution (IDR) portal submissions, and arbitration bundles.',
    primaryResponsibilities: ['No Surprises Act IDR petitions', 'Qualifying Payment Amount (QPA) dispute', '30-day open negotiation window', 'Arbitration documentation bundles'],
  },
];

export const DepartmentWorkspaceView: React.FC<DepartmentWorkspaceViewProps> = ({
  disputes,
  onUpdateDispute,
  onSelectDisputeForDetail,
}) => {
  const [selectedDept, setSelectedDept] = useState<DepartmentWorkspace>('HUB_OPERATIONS');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [payerFilter, setPayerFilter] = useState<string>('ALL');

  const currentConfig = WORKSPACE_CONFIGS.find((c) => c.id === selectedDept)!;

  // Filtered disputes for this department
  const deptDisputes = disputes.filter((d) => {
    if (d.assignedDepartment !== selectedDept) return false;
    if (statusFilter !== 'ALL' && d.status !== statusFilter) return false;
    if (payerFilter !== 'ALL' && d.payerId !== payerFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchClaim = d.claimNumber.toLowerCase().includes(q);
      const matchPatient = d.patientName.toLowerCase().includes(q);
      const matchPayer = d.payerName.toLowerCase().includes(q);
      const matchCarc = d.carcCode.toLowerCase().includes(q) || d.carcDescription.toLowerCase().includes(q);
      return matchClaim || matchPatient || matchPayer || matchCarc;
    }
    return true;
  });

  const uniquePayers = Array.from(new Set(disputes.map((d) => d.payerId)));
  const totalDeptDollars = deptDisputes.reduce((sum, d) => sum + d.deniedAmount, 0);

  const handleQuickStatusChange = (dispute: DenialDispute, newStatus: DenialStatus) => {
    onUpdateDispute({
      ...dispute,
      status: newStatus,
      lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 19),
    });
  };

  const handleRouteDepartment = (dispute: DenialDispute, targetDept: DepartmentWorkspace) => {
    onUpdateDispute({
      ...dispute,
      assignedDepartment: targetDept,
      status: 'IN_REVIEW',
      lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 19),
    });
  };

  return (
    <div className="space-y-6">
      {/* 6 Department Nodes Header Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {WORKSPACE_CONFIGS.map((config) => {
          const Icon = config.icon;
          const count = disputes.filter((d) => d.assignedDepartment === config.id).length;
          const dollars = disputes
            .filter((d) => d.assignedDepartment === config.id)
            .reduce((sum, d) => sum + d.deniedAmount, 0);
          const isSelected = selectedDept === config.id;

          return (
            <button
              key={config.id}
              onClick={() => setSelectedDept(config.id)}
              className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? 'bg-white border-blue-600 shadow-md ring-2 ring-blue-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${config.bgColor} ${config.textColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {count}
                </span>
              </div>

              <div className="mt-3">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {config.shortLabel}
                </div>
                <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
                  ${dollars.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </div>
              </div>

              {isSelected && (
                <div className="absolute bottom-0 left-3 right-3 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Workspace Information Banner */}
      <div className={`p-5 rounded-xl border ${currentConfig.borderColor} ${currentConfig.bgColor} flex flex-col md:flex-row md:items-center justify-between gap-4`}>
        <div className="flex items-start gap-3.5">
          <div className={`p-3 rounded-xl bg-white shadow-xs ${currentConfig.textColor}`}>
            <currentConfig.icon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">
                {currentConfig.label}
              </h2>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white border ${currentConfig.borderColor} ${currentConfig.textColor}`}>
                {deptDisputes.length} Active Records
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl">
              {currentConfig.description}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-slate-700">Key Focus:</span>
          {currentConfig.primaryResponsibilities.map((resp, i) => (
            <span
              key={i}
              className="px-2 py-1 rounded-md bg-white/80 border border-slate-200 text-slate-700 font-medium"
            >
              {resp}
            </span>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Claim #, Patient Name, CARC code, Payer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-medium text-slate-600">Payer:</span>
            <select
              value={payerFilter}
              onChange={(e) => setPayerFilter(e.target.value)}
              className="bg-transparent text-slate-800 font-semibold focus:outline-hidden"
            >
              <option value="ALL">All Payers</option>
              {uniquePayers.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <span className="font-medium text-slate-600">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-800 font-semibold focus:outline-hidden"
            >
              <option value="ALL">All Statuses</option>
              <option value="INTAKE_PENDING">Intake Pending</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="APPEAL_SUBMITTED">Appeal Submitted</option>
              <option value="WRITE_OFF_REQUESTED">Write-Off Requested</option>
              <option value="WRITE_OFF_APPROVED">Write-Off Approved</option>
              <option value="ESCALATED_NSA_IDR">Escalated to NSA IDR</option>
            </select>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
            Filtered: ${totalDeptDollars.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Claims List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Claim & Patient</th>
                <th className="py-3 px-4">Payer & DOS</th>
                <th className="py-3 px-4">CARC / Denial Code</th>
                <th className="py-3 px-4">Financials</th>
                <th className="py-3 px-4">State & Compliance</th>
                <th className="py-3 px-4">Deadline</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {deptDisputes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500">
                    <AlertCircle className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                    No claims found matching current filters in {currentConfig.shortLabel}.
                  </td>
                </tr>
              ) : (
                deptDisputes.map((dispute) => (
                  <tr key={dispute.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Claim & Patient */}
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900 text-xs">
                        {dispute.claimNumber}
                      </div>
                      <div className="text-slate-700 font-medium mt-0.5">
                        {dispute.patientName}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {dispute.patientControlNumber}
                      </div>
                    </td>

                    {/* Payer & DOS */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">
                        {dispute.payerName}
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        Payer ID: <span className="font-mono">{dispute.payerId}</span>
                      </div>
                      <div className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" /> DOS: {dispute.dateOfService}
                      </div>
                    </td>

                    {/* CARC / Denial Code */}
                    <td className="py-3 px-4 max-w-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded font-mono font-bold bg-amber-100 text-amber-900 text-xs">
                          CARC {dispute.carcCode}
                        </span>
                        {dispute.rarcCode && (
                          <span className="px-1.5 py-0.5 rounded font-mono bg-slate-100 text-slate-700 text-[10px]">
                            {dispute.rarcCode}
                          </span>
                        )}
                      </div>
                      <div className="text-slate-600 text-[11px] mt-1 line-clamp-2" title={dispute.carcDescription}>
                        {dispute.carcDescription}
                      </div>
                    </td>

                    {/* Financials */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-rose-700 text-sm">
                        ${dispute.deniedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        Billed: ${dispute.billedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      {dispute.paidAmount > 0 && (
                        <div className="text-emerald-600 text-[11px]">
                          Paid: ${dispute.paidAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                      )}
                    </td>

                    {/* State & Compliance Badges */}
                    <td className="py-3 px-4">
                      <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-800">
                        {dispute.status.replace(/_/g, ' ')}
                      </span>

                      <div className="mt-1.5 flex flex-col gap-1">
                        {dispute.writeOffRequiresManagement && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <ShieldAlert className="w-3 h-3" />
                            &gt;$10k Mgmt Gate
                          </span>
                        )}
                        {dispute.isNoSurprisesActEligible && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                            <Scale className="w-3 h-3" />
                            NSA IDR Eligible
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Deadline */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">
                        {dispute.appealDeadline}
                      </div>
                      <span className="text-[10px] text-slate-500">
                        Timely appeal window
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex flex-col items-end gap-1.5">
                        <button
                          onClick={() => onSelectDisputeForDetail(dispute)}
                          className="px-2.5 py-1 text-xs font-semibold rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          View Dossier
                        </button>

                        {/* Node-specific workflow shortcut buttons */}
                        {selectedDept === 'MANAGEMENT_GATE' && dispute.status === 'WRITE_OFF_REQUESTED' && (
                          <button
                            onClick={() => handleQuickStatusChange(dispute, 'WRITE_OFF_APPROVED')}
                            className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-600 text-white hover:bg-emerald-500 transition-colors cursor-pointer"
                          >
                            Approve Write-off
                          </button>
                        )}

                        {selectedDept === 'CLINICAL_REVIEW' && dispute.status !== 'APPEAL_SUBMITTED' && (
                          <button
                            onClick={() => handleQuickStatusChange(dispute, 'EHR_DOCUMENTATION_ATTACHED')}
                            className="px-2 py-0.5 text-[11px] font-medium rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 cursor-pointer"
                          >
                            + Attach EHR Notes
                          </button>
                        )}

                        {selectedDept === 'HUB_OPERATIONS' && (
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-slate-500">Route to:</span>
                            <select
                              onChange={(e) => handleRouteDepartment(dispute, e.target.value as DepartmentWorkspace)}
                              defaultValue=""
                              className="text-[11px] bg-white border border-slate-200 rounded px-1.5 py-0.5 text-slate-700 focus:outline-hidden"
                            >
                              <option value="" disabled>Select...</option>
                              <option value="TECHNICAL_REVIEW">Technical</option>
                              <option value="CLINICAL_REVIEW">Clinical</option>
                              <option value="SUPPORT_REVIEW">Support</option>
                              <option value="MANAGEMENT_GATE">Mgmt Gate</option>
                              <option value="LEGAL_ARBITRATION">Legal / NSA</option>
                            </select>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
