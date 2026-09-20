import React, { useState } from 'react';
import { DenialDispute, DepartmentWorkspace, DenialStatus } from '../types';
import { 
  X, 
  Clock, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  ShieldAlert, 
  Scale, 
  Send, 
  ArrowRight, 
  User, 
  Building2,
  Stethoscope,
  DollarSign
} from 'lucide-react';

interface ClaimDetailModalProps {
  dispute: DenialDispute | null;
  onClose: () => void;
  onUpdateDispute: (updated: DenialDispute) => void;
}

export const ClaimDetailModal: React.FC<ClaimDetailModalProps> = ({
  dispute,
  onClose,
  onUpdateDispute,
}) => {
  if (!dispute) return null;

  const [notes, setNotes] = useState(dispute.reviewerNotes || '');
  const [selectedStatus, setSelectedStatus] = useState<DenialStatus>(dispute.status);
  const [targetDept, setTargetDept] = useState<DepartmentWorkspace>(dispute.assignedDepartment);

  const handleSave = () => {
    onUpdateDispute({
      ...dispute,
      status: selectedStatus,
      assignedDepartment: targetDept,
      reviewerNotes: notes,
      lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 19),
    });
    onClose();
  };

  const handleApproveWriteOff = () => {
    onUpdateDispute({
      ...dispute,
      status: 'WRITE_OFF_APPROVED',
      reviewerNotes: `${notes ? notes + '\n' : ''}[Management Gate Approval] Authorized write-off of $${dispute.deniedAmount.toLocaleString()} per CFO hospital policy on ${new Date().toLocaleDateString()}.`,
      lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 19),
    });
    onClose();
  };

  const handleEscalateNSA = () => {
    onUpdateDispute({
      ...dispute,
      assignedDepartment: 'LEGAL_ARBITRATION',
      status: 'ESCALATED_NSA_IDR',
      isNoSurprisesActEligible: true,
      reviewerNotes: `${notes ? notes + '\n' : ''}[Legal/Arbitration] Formal federal CMS IDR petition bundle compiled. Initiating 30-day open negotiation.`,
      lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 19),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-slate-900 text-sm">
                {dispute.claimNumber}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800">
                {dispute.assignedDepartment.replace(/_/g, ' ')}
              </span>
              {dispute.writeOffRequiresManagement && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" /> &gt;$10k Gate
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Patient: <strong className="text-slate-800">{dispute.patientName}</strong> ({dispute.patientControlNumber}) &bull; DOS: {dispute.dateOfService}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          {/* Financial Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-slate-500 font-medium">Billed Amount</div>
              <div className="text-base font-bold text-slate-900 mt-0.5">
                ${dispute.billedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-slate-500 font-medium">Payer Allowed</div>
              <div className="text-base font-bold text-slate-900 mt-0.5">
                ${dispute.allowedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
              <div className="text-rose-700 font-semibold">Denied Exposure</div>
              <div className="text-base font-bold text-rose-700 mt-0.5">
                ${dispute.deniedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="text-emerald-700 font-semibold">Paid Amount</div>
              <div className="text-base font-bold text-emerald-700 mt-0.5">
                ${dispute.paidAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Denial Reason & Codes */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md font-mono font-bold text-xs bg-amber-200 text-amber-900">
                  CARC {dispute.carcCode}
                </span>
                {dispute.rarcCode && (
                  <span className="px-2 py-1 rounded-md font-mono text-xs bg-amber-100 text-amber-800">
                    RARC {dispute.rarcCode}
                  </span>
                )}
              </div>
              <span className="text-amber-800 font-semibold">
                Payer: {dispute.payerName} ({dispute.payerId})
              </span>
            </div>
            <div className="text-amber-950 font-medium leading-relaxed">
              {dispute.carcDescription}
            </div>
          </div>

          {/* Clinical Context & Diagnoses */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-emerald-600" />
              Clinical Summary & Coding
            </h4>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 leading-relaxed">
              {dispute.clinicalSummary || 'Standard EDI 835 remittance intake. No manual clinical annotations attached.'}
            </div>
            <div className="flex flex-wrap gap-4 pt-1">
              {dispute.icd10Codes && dispute.icd10Codes.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-600">ICD-10 Diagnoses:</span>
                  {dispute.icd10Codes.map((code) => (
                    <span key={code} className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono border border-blue-200">
                      {code}
                    </span>
                  ))}
                </div>
              )}
              {dispute.cptCodes && dispute.cptCodes.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-600">CPT / HCPCS:</span>
                  {dispute.cptCodes.map((cpt) => (
                    <span key={cpt} className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono border border-indigo-200">
                      {cpt}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Workflow Routing & State Modification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Assigned Operational Workspace
              </label>
              <select
                value={targetDept}
                onChange={(e) => setTargetDept(e.target.value as DepartmentWorkspace)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white"
              >
                <option value="HUB_OPERATIONS">1. HUB Operations (Intake)</option>
                <option value="TECHNICAL_REVIEW">2. Technical Review (Coding/EDI)</option>
                <option value="CLINICAL_REVIEW">3. Clinical Review (Medical Necessity)</option>
                <option value="SUPPORT_REVIEW">4. Support Review (Demographics/COB)</option>
                <option value="MANAGEMENT_GATE">5. Management Gate (&gt;$10k Write-Off)</option>
                <option value="LEGAL_ARBITRATION">6. Legal / Arbitration Node (NSA IDR)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Review Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as DenialStatus)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white"
              >
                <option value="INTAKE_PENDING">Intake Pending</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="CODING_CORRECTION">Coding Correction</option>
                <option value="EHR_DOCUMENTATION_ATTACHED">EHR Documentation Attached</option>
                <option value="COB_UPDATED">COB Updated</option>
                <option value="APPEAL_SUBMITTED">Appeal Submitted</option>
                <option value="WRITE_OFF_REQUESTED">Write-Off Requested</option>
                <option value="WRITE_OFF_APPROVED">Write-Off Approved</option>
                <option value="ESCALATED_NSA_IDR">Escalated to NSA IDR</option>
                <option value="SETTLED">Settled</option>
                <option value="OVERTURNED">Overturned</option>
              </select>
            </div>
          </div>

          {/* Reviewer Audit Notes */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Reviewer Notes & Audit Trail
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add clinical findings, peer-to-peer discussions, or legal notes..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {dispute.writeOffRequiresManagement && dispute.status !== 'WRITE_OFF_APPROVED' && (
              <button
                onClick={handleApproveWriteOff}
                className="px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <ShieldAlert className="w-4 h-4" />
                Executive Approval: Authorize Write-off
              </button>
            )}

            {!dispute.isNoSurprisesActEligible && (
              <button
                onClick={handleEscalateNSA}
                className="px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Scale className="w-4 h-4" />
                Escalate to Federal NSA IDR
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs"
            >
              Save Changes & Route
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
