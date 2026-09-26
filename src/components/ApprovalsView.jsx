import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  ShieldAlert, 
  Search, 
  Filter,
  Layers,
  ArrowUpRight,
  MessageSquare,
  Sparkles,
  Receipt,
  UserCheck
} from 'lucide-react';
import { formatCurrency, formatDate, getStatusStyle, getPriorityStyle } from '../utils/formatters';
import ReceiptModal from './ReceiptModal';

export default function ApprovalsView({ 
  approvals = [], 
  currentPersona, 
  onActionApproval,
  onBatchAction
}) {
  const [activeTab, setActiveTab] = useState('PENDING');
  const [search, setSearch] = useState('');
  const [filterMyRoleOnly, setFilterMyRoleOnly] = useState(true); // Default to true so role switching is immediately obvious!
  const [selectedIds, setSelectedIds] = useState([]);
  const [inspectExpense, setInspectExpense] = useState(null);
  
  // Rejection reason dialog state
  const [rejectionModal, setRejectionModal] = useState({ isOpen: false, approvalId: null, comments: '' });

  const role = currentPersona?.role || '';
  const isEmployee = role.includes('Senior Engineer') || role.includes('Employee');
  const isDeptHead = role.includes('Department Head');
  const isFinance = role.includes('Finance');
  const isCFO = role.includes('Chief Financial Officer') || role.includes('Executive');

  // 1. First filter by persona role and search query (before tab filter)
  const roleFiltered = approvals.filter(item => {
    // If Employee, show claims submitted by them!
    if (isEmployee && filterMyRoleOnly) {
      if (item.expense?.employeeId !== currentPersona.employeeId) {
        return false;
      }
    } else if (filterMyRoleOnly && currentPersona) {
      if (isDeptHead && (item.expense?.departmentId !== currentPersona.departmentId && item.approverRole !== 'DEPARTMENT_MANAGER')) {
        return false;
      }
      if (isFinance && (item.approvalLevel < 2 && item.approverRole !== 'FINANCE_AUDITOR')) {
        return false;
      }
      if (isCFO && (!item.escalationRequired && Number(item.expense?.amount || 0) < 50000)) {
        return false;
      }
    }

    // Search filter
    if (search) {
      const q = search.toLowerCase();
      const match = (
        item.approvalId.toLowerCase().includes(q) ||
        item.expenseId.toLowerCase().includes(q) ||
        (item.departmentName && item.departmentName.toLowerCase().includes(q)) ||
        (item.employeeName && item.employeeName.toLowerCase().includes(q)) ||
        (item.expense?.vendor && item.expense.vendor.toLowerCase().includes(q))
      );
      if (!match) return false;
    }

    return true;
  });

  // 2. Compute accurate, stable counts for each tab pill based on role/search context
  const pendingCount = roleFiltered.filter(a => a.status.toUpperCase() === 'PENDING').length;
  const escalatedCount = roleFiltered.filter(a => a.escalationRequired).length;
  const approvedCount = roleFiltered.filter(a => a.status.toUpperCase() === 'APPROVED').length;
  const rejectedCount = roleFiltered.filter(a => a.status.toUpperCase() === 'REJECTED').length;

  // 3. Finally filter rows for the selected activeTab
  const filtered = roleFiltered.filter(item => {
    if (activeTab === 'PENDING') return item.status.toUpperCase() === 'PENDING';
    if (activeTab === 'ESCALATED') return item.escalationRequired;
    if (activeTab === 'APPROVED') return item.status.toUpperCase() === 'APPROVED';
    if (activeTab === 'REJECTED') return item.status.toUpperCase() === 'REJECTED';
    return true;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map(f => f.approvalId));
    }
  };

  const toggleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBatchApprove = () => {
    if (selectedIds.length === 0) return;
    onBatchAction(selectedIds, 'APPROVE');
    setSelectedIds([]);
  };

  const confirmRejection = () => {
    if (!rejectionModal.approvalId) return;
    onActionApproval(
      rejectionModal.approvalId, 
      'REJECT', 
      rejectionModal.comments || 'Rejected: Does not meet departmental expense policy criteria.'
    );
    setRejectionModal({ isOpen: false, approvalId: null, comments: '' });
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Multi-Tier Approvals & Escalation Engine
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {isEmployee && `Viewing approval progress for your personal submitted claims.`}
            {isDeptHead && `Reviewing pending approval requests for ${currentPersona.departmentName} (DEPT001).`}
            {isFinance && `Auditing Level 2 dual sign-offs and tax/compliance verification.`}
            {isCFO && `Authorizing high-value expenditures (>₹50,000) and executive escalations.`}
          </p>
        </div>
        
        {/* Active Role Indicator */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-850 border border-slate-800 text-xs">
          <span className="text-slate-400">Current Role Mode:</span>
          <span className="font-bold text-white">{currentPersona.avatar} {currentPersona.name}</span>
          <span className="text-indigo-400 font-semibold">({currentPersona.role})</span>
        </div>
      </div>

      {/* Role Filter Status Alert */}
      <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-2 text-blue-200">
          <UserCheck className="w-4 h-4 text-blue-400 shrink-0" />
          <span>
            {filterMyRoleOnly ? (
              <>
                <strong>Filtered to {currentPersona.role} Mode:</strong>{' '}
                {isEmployee && `Showing only claims submitted by you (${currentPersona.employeeId}).`}
                {isDeptHead && `Showing expenses belonging to your department (${currentPersona.departmentName}).`}
                {isFinance && `Showing claims requiring Level 2 Finance sign-off.`}
                {isCFO && `Showing claims requiring Executive/CFO sign-off.`}
              </>
            ) : (
              <span><strong>Enterprise Mode:</strong> Viewing all 150 approval records across all company departments.</span>
            )}
          </span>
        </div>
        <button
          onClick={() => setFilterMyRoleOnly(!filterMyRoleOnly)}
          className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white transition-colors shrink-0"
        >
          {filterMyRoleOnly ? 'Switch to All Company Queues' : `Filter to My ${currentPersona.role} Queue`}
        </button>
      </div>

      {/* Tabs & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        
        <div className="flex items-center space-x-2 overflow-x-auto">
          {[
            { id: 'PENDING', label: 'Pending Action', count: pendingCount, color: 'text-amber-400' },
            { id: 'ESCALATED', label: 'Escalations Flagged', count: escalatedCount, color: 'text-rose-400' },
            { id: 'APPROVED', label: 'Approved', count: approvedCount, color: 'text-emerald-400' },
            { id: 'REJECTED', label: 'Rejected', count: rejectedCount, color: 'text-slate-400' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSelectedIds([]);
              }}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label} <span className={`ml-1 font-bold ${activeTab === tab.id ? 'text-white' : tab.color}`}>({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Batch Action CTA */}
        {!isEmployee && activeTab === 'PENDING' && selectedIds.length > 0 && (
          <button
            onClick={handleBatchApprove}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Batch Approve ({selectedIds.length}) Claims</span>
          </button>
        )}

      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <input
          type="text"
          placeholder="Search approval ID, employee, vendor, or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Approvals Table */}
      <div className="glass-panel rounded-xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                {!isEmployee && activeTab === 'PENDING' && (
                  <th className="py-3.5 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filtered.length && filtered.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-0"
                    />
                  </th>
                )}
                <th className="py-3.5 px-4">Approval ID</th>
                <th className="py-3.5 px-4">Expense Details</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Tier / Level</th>
                <th className="py-3.5 px-4">SLA / Status</th>
                <th className="py-3.5 px-4">Comments / Audit</th>
                <th className="py-3.5 px-4 text-right">{isEmployee ? 'Reviewer' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={!isEmployee && activeTab === 'PENDING' ? 9 : 8} className="py-12 text-center text-slate-500">
                    No approval workflows match this filter.
                  </td>
                </tr>
              ) : (
                filtered.slice(0, 50).map(item => (
                  <tr key={item.approvalId} className="hover:bg-slate-800/40 transition-colors">
                    
                    {!isEmployee && activeTab === 'PENDING' && (
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.approvalId)}
                          onChange={() => toggleSelectOne(item.approvalId)}
                          className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-0"
                        />
                      </td>
                    )}

                    <td className="py-3.5 px-4 font-mono font-bold text-blue-400">
                      {item.approvalId}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-200">
                        {item.expense?.description || item.expenseId}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span>Vendor: {item.expense?.vendor || '—'}</span>
                        <span>•</span>
                        <span>By {item.employeeName}</span>
                        {item.expense?.receiptAvailable ? (
                          <>
                            <span>•</span>
                            <button
                              type="button"
                              onClick={() => setInspectExpense(item.expense)}
                              className="text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-0.5 underline cursor-pointer"
                            >
                              <Receipt className="w-3 h-3" />
                              <span>Receipt</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <span>•</span>
                            <span className="text-amber-400/80 inline-flex items-center gap-0.5" title="No receipt attached">
                              <AlertTriangle className="w-3 h-3" />
                              <span>No Receipt</span>
                            </span>
                          </>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-200 font-medium">{item.departmentName}</div>
                      <div className="text-[10px] text-slate-400">{item.expense?.departmentId}</div>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                      {formatCurrency(item.expense?.amount || 0)}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-300">Level {item.approvalLevel || 1}</div>
                      <div className="text-[10px] text-indigo-400 font-mono">{item.approverRole || 'MANAGER'}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      {item.escalationRequired ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                          <AlertTriangle className="w-3 h-3" /> Escalation Flagged
                        </span>
                      ) : (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusStyle(item.status)}`}>
                          {item.status}
                        </span>
                      )}
                      <div className="text-[10px] text-slate-500 mt-1">
                        Submitted: {formatDate(item.submittedDate)}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate text-[11px]" title={item.comments}>
                      {item.comments || (item.status === 'Pending' ? 'Awaiting sign-off' : '—')}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {isEmployee ? (
                        <span className="text-slate-300 text-xs">
                          {item.status === 'Approved' ? '✅ Signed off' : `Awaiting ${item.approverRole}`}
                        </span>
                      ) : item.status.toUpperCase() === 'PENDING' ? (
                        <div className="inline-flex items-center space-x-1.5">
                          <button
                            onClick={() => onActionApproval(item.approvalId, 'ESCALATE')}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-900/40 text-slate-400 hover:text-indigo-300 transition-colors"
                            title="Escalate to Senior Approver"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setRejectionModal({ isOpen: true, approvalId: item.approvalId, comments: '' })}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-400 font-medium transition-colors"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => onActionApproval(item.approvalId, 'APPROVE')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md shadow-emerald-600/20"
                          >
                            Approve
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500">
                          Actioned on {formatDate(item.actionDate)}
                        </span>
                      )}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rejection Reason Modal */}
      {rejectionModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-5 space-y-4 shadow-2xl">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-400" />
              Provide Rejection Reason
            </h3>
            <p className="text-xs text-slate-400">
              Audit compliance requires a mandatory reason when rejecting an employee expenditure.
            </p>
            <div className="space-y-1">
              {['Receipt missing or illegible', 'Expense exceeds policy limit', 'Insufficient business justification', 'Duplicate claim'].map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setRejectionModal({ ...rejectionModal, comments: preset })}
                  className="w-full text-left px-2.5 py-1.5 rounded bg-slate-800/80 hover:bg-slate-800 text-[11px] text-slate-300"
                >
                  • {preset}
                </button>
              ))}
            </div>
            <textarea
              value={rejectionModal.comments}
              onChange={(e) => setRejectionModal({ ...rejectionModal, comments: e.target.value })}
              placeholder="Enter audit notes for rejection..."
              rows={3}
              className="w-full p-2.5 bg-slate-850 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-rose-500"
            />
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setRejectionModal({ isOpen: false, approvalId: null, comments: '' })}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={confirmRejection}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/30"
              >
                Confirm Rejection & Release Budget
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Itemized Digital Receipt Lightbox */}
      <ReceiptModal
        isOpen={Boolean(inspectExpense)}
        onClose={() => setInspectExpense(null)}
        expense={inspectExpense}
      />

    </div>
  );
}
