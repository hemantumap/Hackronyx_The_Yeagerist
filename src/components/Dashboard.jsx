import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Layers,
  ArrowRight,
  Sparkles,
  Receipt,
  User,
  PlusCircle,
  Activity,
  FileCheck,
  AlertTriangle,
  UserPlus
} from 'lucide-react';
import { formatCurrency, formatDate, getStatusStyle, getPriorityStyle } from '../utils/formatters';

export default function Dashboard({ 
  summary, 
  alerts = [], 
  approvals = [], 
  expenses = [],
  currentPersona,
  accountRequests = [],
  onActionAccountRequest,
  onActionApproval,
  setActiveTab,
  onOpenNewExpense 
}) {
  if (!summary) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 text-sm">Loading budget intelligence...</p>
        </div>
      </div>
    );
  }

  const role = currentPersona?.role || '';
  const isEmployee = role.includes('Senior Engineer') || role.includes('Employee');
  const isDeptHead = role.includes('Department Head');
  const isFinance = role.includes('Finance');
  const isCFO = role.includes('Chief Financial Officer') || role.includes('Executive');

  const {
    totalAllocated,
    totalSpent,
    totalReserved,
    totalRemaining,
    overallUtilization,
    pendingApprovalsCount,
    departments = []
  } = summary;

  // Department-specific data for Department Head
  const deptInfo = departments.find(d => d.departmentId === currentPersona.departmentId) || departments[0] || {};
  const deptPendingApprovals = approvals.filter(
    a => a.status.toLowerCase() === 'pending' && 
    (a.expense?.departmentId === currentPersona.departmentId || a.approverId === currentPersona.employeeId)
  );

  // Employee-specific claims
  const myExpenses = expenses.filter(e => e.employeeId === currentPersona.employeeId);
  const myPendingExpenses = myExpenses.filter(e => e.status.toLowerCase() === 'pending');
  const myApprovedExpenses = myExpenses.filter(e => e.status.toLowerCase() === 'approved');
  const myTotalClaimed = myExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const myApprovedAmount = myApprovedExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const myPendingAmount = myPendingExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  // Finance-specific queue (Level 2 approvals or Dual Sign-off)
  const financeQueue = approvals.filter(
    a => a.status.toLowerCase() === 'pending' && (a.approvalLevel >= 2 || a.approverRole === 'FINANCE_AUDITOR')
  );

  // CFO-specific queue (Escalations or amount > 50,000)
  const cfoQueue = approvals.filter(
    a => a.status.toLowerCase() === 'pending' && (a.escalationRequired || (a.expense?.amount && Number(a.expense.amount) >= 50000))
  );

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-200">
      
      {/* Dynamic Persona Hero Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{currentPersona.avatar}</span>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {isEmployee && `My Employee Expense & Claims Portal`}
              {isDeptHead && `${currentPersona.departmentName} Department Command Center`}
              {isFinance && `Finance & Compliance Audit Command Center`}
              {isCFO && `Executive Suite & Enterprise Governance`}
            </h1>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            {isEmployee && `Welcome, ${currentPersona.name}. Track your personal submitted claims, reimbursement approvals, and view available ${currentPersona.departmentName} budget.`}
            {isDeptHead && `Managing ${currentPersona.departmentName} (${currentPersona.departmentId}) budget, reviewing team claims, and tracking pending authorizations.`}
            {isFinance && `Overseeing multi-department fiscal compliance, Level 2 dual sign-offs, and critical budget threshold alerts.`}
            {isCFO && `Enterprise-wide budget velocity, capital preservation, and high-value approvals (>₹50,000).`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isEmployee ? (
            <button
              onClick={onOpenNewExpense}
              className="px-4 py-2.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Submit New Claim</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('approvals')}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <span>View Approvals Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Critical Alerts Banner (shown for Manager/Finance/CFO) */}
      {!isEmployee && alerts.length > 0 && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-rose-950/40 via-amber-950/20 to-slate-900 border border-rose-800/40 text-slate-200 shadow-xl">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                  Active Department Budget Threshold Breaches ({alerts.length})
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  {alerts[0].title}: {alerts[0].message}
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('budgets')}
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 underline underline-offset-2 shrink-0 ml-4"
            >
              Inspect Budgets →
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 1. EMPLOYEE DASHBOARD VIEW                                    */}
      {/* ------------------------------------------------------------- */}
      {isEmployee && (
        <div className="space-y-6">
          {/* Employee KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="glass-panel p-5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Claims Filed</span>
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                  <Receipt className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-white">{formatCurrency(myTotalClaimed)}</div>
                <p className="text-xs text-slate-400 mt-1">{myExpenses.length} Total claims submitted</p>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Approved Reimbursements</span>
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-emerald-400">{formatCurrency(myApprovedAmount)}</div>
                <p className="text-xs text-slate-400 mt-1">{myApprovedExpenses.length} Claims processed & approved</p>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">In Review / Pending</span>
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-amber-400">{formatCurrency(myPendingAmount)}</div>
                <p className="text-xs text-slate-400 mt-1">{myPendingExpenses.length} Awaiting manager sign-off</p>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">{currentPersona.departmentName} Budget Headroom</span>
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <ShieldAlert className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-indigo-400">{formatCurrency(deptInfo.remaining || 0)}</div>
                <p className="text-xs text-slate-400 mt-1">Available for team expenses</p>
              </div>
            </div>

          </div>

          {/* Employee Claims Table & Quick Action */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass-panel p-6 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-blue-400" />
                    My Submitted Expense Claims
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Live status and approval trajectory</p>
                </div>
                <button
                  onClick={onOpenNewExpense}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
                >
                  + New Claim
                </button>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Expense ID</th>
                      <th className="py-2.5 px-3">Purpose & Vendor</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {myExpenses.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-slate-500">
                          You haven't submitted any expense claims yet. Click '+ Submit New Claim' above!
                        </td>
                      </tr>
                    ) : (
                      myExpenses.slice(0, 6).map(exp => (
                        <tr key={exp.expenseId} className="hover:bg-slate-800/40">
                          <td className="py-3 px-3 font-mono font-bold text-blue-400">{exp.expenseId}</td>
                          <td className="py-3 px-3">
                            <div className="font-semibold text-slate-200">{exp.description}</div>
                            <div className="text-[10px] text-slate-400">{exp.vendor} • {exp.category}</div>
                          </td>
                          <td className="py-3 px-3 text-slate-400 whitespace-nowrap">{formatDate(exp.expenseDate)}</td>
                          <td className="py-3 px-3 font-bold text-white">{formatCurrency(exp.amount)}</td>
                          <td className="py-3 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusStyle(exp.status)}`}>
                              {exp.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right: Employee Policy & Quick Submit Helper */}
            <div className="glass-panel p-6 rounded-xl border border-slate-800 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Smart Policy Reminders
                </h3>
                <div className="mt-3 space-y-2.5 text-xs text-slate-300">
                  <div className="p-2.5 rounded-lg bg-slate-850 border border-slate-800">
                    <span className="font-semibold text-emerald-400">⚡ Auto-Approval:</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">Claims under ₹250 with receipts are approved instantly by AI.</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-850 border border-slate-800">
                    <span className="font-semibold text-blue-400">📄 Receipts Required:</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">Always attach receipts for expenses over ₹1,000 to prevent audit holds.</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-850 border border-slate-800">
                    <span className="font-semibold text-purple-400">⏱️ Approval SLA:</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">Your manager Amit Verma typically reviews claims within 24–48 hours.</p>
                  </div>
                </div>
              </div>

              <button
                onClick={onOpenNewExpense}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Submit New Expense Claim</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. DEPARTMENT HEAD DASHBOARD VIEW                             */}
      {/* ------------------------------------------------------------- */}
      {isDeptHead && (
        <div className="space-y-6">
          {/* Department Head KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="glass-panel p-5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">{currentPersona.departmentName} Total Budget</span>
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-white">{formatCurrency(deptInfo.allocated || 0)}</div>
                <p className="text-xs text-slate-400 mt-1">Monthly allocation for {currentPersona.departmentId}</p>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Hard Spent (Approved)</span>
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-emerald-400">{formatCurrency(deptInfo.spent || 0)}</div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500"
                    style={{ width: `${Math.min(100, ((deptInfo.spent || 0) / (deptInfo.allocated || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Soft Reserved (Claims)</span>
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-amber-400">{formatCurrency(deptInfo.reserved || 0)}</div>
                <p className="text-xs text-slate-400 mt-1">{deptPendingApprovals.length} Team claims encumbered</p>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Remaining Safe Headroom</span>
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <ShieldAlert className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-indigo-400">{formatCurrency(deptInfo.remaining || 0)}</div>
                <p className="text-xs font-semibold text-emerald-400 mt-1">{deptInfo.utilization || 0}% Utilized ({deptInfo.status || 'Healthy'})</p>
              </div>
            </div>

          </div>

          {/* Employee Account Requests Requiring Head Approval */}
          {(() => {
            const pendingAccounts = accountRequests.filter(
              r => r.status === 'Pending Approval' &&
              (r.departmentId === currentPersona.departmentId || r.managerId === currentPersona.employeeId)
            );

            return (
              <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-white flex items-center gap-2">
                        Employee Account Requests Requiring Your Approval ({pendingAccounts.length})
                        {pendingAccounts.length > 0 && (
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-bold border border-amber-500/30 animate-pulse">
                            Authorization Required
                          </span>
                        )}
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        These users requested onboarding to {currentPersona.departmentName}. Accounts are created only when you approve.
                      </p>
                    </div>
                  </div>
                </div>

                {pendingAccounts.length === 0 ? (
                  <div className="py-4 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>All employee account requests have been authorized. No pending applicants.</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pendingAccounts.map(req => (
                      <div 
                        key={req.requestId}
                        className="p-4 rounded-xl bg-slate-850/80 border border-slate-700/80 flex flex-col justify-between space-y-3 text-xs shadow-md"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-bold text-white text-sm">{req.name}</div>
                              <div className="text-[11px] text-blue-300 font-semibold">{req.role}</div>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">{req.email}</div>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                              Awaiting Sign-off
                            </span>
                          </div>
                          {req.reason && (
                            <p className="text-[11px] text-slate-300 bg-slate-900/70 p-2.5 rounded-lg border border-slate-800">
                              "{req.reason}"
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-end space-x-2 pt-2.5 border-t border-slate-800">
                          <button
                            onClick={() => onActionAccountRequest(req.requestId, 'REJECT')}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 hover:text-rose-400 text-slate-300 font-medium transition-colors"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => onActionAccountRequest(req.requestId, 'APPROVE')}
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md shadow-emerald-600/25 flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve & Activate Account</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Department Head Pending Queue */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass-panel p-6 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    {currentPersona.departmentName} Team Pending Approvals ({deptPendingApprovals.length})
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Expenses awaiting your sign-off as Department Manager</p>
                </div>
                <button
                  onClick={() => setActiveTab('approvals')}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
                >
                  Full Approval Queue →
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {deptPendingApprovals.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 text-xs">
                    🎉 Great job! All approval requests for {currentPersona.departmentName} have been processed!
                  </div>
                ) : (
                  deptPendingApprovals.slice(0, 5).map(item => (
                    <div key={item.approvalId} className="p-3.5 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-between gap-4 text-xs">
                      <div>
                        <div className="font-semibold text-white">{item.expense?.description || item.expenseId}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Claimed by <span className="text-slate-300 font-medium">{item.employeeName}</span> • Vendor: {item.expense?.vendor}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-white text-sm">{formatCurrency(item.expense?.amount || 0)}</span>
                        <button
                          onClick={() => onActionApproval(item.approvalId, 'REJECT')}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-950/60 hover:text-rose-400 text-slate-300 font-medium transition-colors"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => onActionApproval(item.approvalId, 'APPROVE')}
                          className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md shadow-emerald-600/20"
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Department Summary Side Panel */}
            <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400" />
                Department Burn Rate
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Department</span>
                  <span className="text-white font-semibold">{currentPersona.departmentName}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Location</span>
                  <span className="text-slate-300">{deptInfo.location || 'Bangalore'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Manager ID</span>
                  <span className="text-slate-300 font-mono">{currentPersona.employeeId}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Utilization Status</span>
                  <span className={`font-bold ${deptInfo.status === 'Critical' ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {deptInfo.status || 'Healthy'} ({deptInfo.utilization}%)
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('budgets')}
                className="w-full mt-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Drill Down into Monthly History</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. FINANCE MANAGER DASHBOARD VIEW                             */}
      {/* ------------------------------------------------------------- */}
      {isFinance && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="glass-panel p-5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Enterprise Incurred</span>
                <DollarSign className="w-4 h-4 text-blue-400" />
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-white">{formatCurrency(totalSpent)}</div>
                <p className="text-xs text-slate-400 mt-1">Approved across 12 departments</p>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Finance Dual Sign-Off</span>
                <FileCheck className="w-4 h-4 text-amber-400" />
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-amber-400">{financeQueue.length}</div>
                <p className="text-xs text-slate-400 mt-1">Level 2 high-value compliance claims</p>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Threshold Alerts</span>
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-rose-400">{alerts.length}</div>
                <p className="text-xs text-slate-400 mt-1">Departments above 75% or 85% limit</p>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Encumbered</span>
                <Clock className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-indigo-400">{formatCurrency(totalReserved)}</div>
                <p className="text-xs text-slate-400 mt-1">Held in soft commitment</p>
              </div>
            </div>

          </div>

          {/* Finance Queue */}
          <div className="glass-panel p-6 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-amber-400" />
                Finance Level 2 Compliance Queue
              </h2>
              <button onClick={() => setActiveTab('approvals')} className="text-xs text-blue-400 font-semibold">
                Inspect All Approvals →
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {financeQueue.slice(0, 5).map(item => (
                <div key={item.approvalId} className="p-3.5 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="font-semibold text-white">{item.expense?.description || item.expenseId}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {item.departmentName} • {item.employeeName} • Vendor: {item.expense?.vendor}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-white text-sm">{formatCurrency(item.expense?.amount || 0)}</span>
                    <button
                      onClick={() => onActionApproval(item.approvalId, 'APPROVE')}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                    >
                      Audit & Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. CFO / EXECUTIVE DASHBOARD VIEW                             */}
      {/* ------------------------------------------------------------- */}
      {isCFO && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="glass-panel p-5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Enterprise Budget Cap</span>
                <DollarSign className="w-4 h-4 text-blue-400" />
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-white">{formatCurrency(totalAllocated)}</div>
                <p className="text-xs text-slate-400 mt-1">12 Departments • FY 2026-27</p>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Corporate Spent</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-emerald-400">{formatCurrency(totalSpent)}</div>
                <p className="text-xs text-slate-400 mt-1">{overallUtilization}% overall utilization</p>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">High-Value / Escalations</span>
                <AlertCircle className="w-4 h-4 text-rose-400" />
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-rose-400">{cfoQueue.length}</div>
                <p className="text-xs text-slate-400 mt-1">Requires CFO / VP sign-off</p>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Safe Reserves Remaining</span>
                <ShieldAlert className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-cyan-400">{formatCurrency(totalRemaining)}</div>
                <p className="text-xs text-slate-400 mt-1">Uncommitted enterprise funds</p>
              </div>
            </div>

          </div>

          {/* CFO Escalations & Department Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass-panel p-6 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-400" />
                  Enterprise Department Velocity Ranking
                </h2>
                <button onClick={() => setActiveTab('budgets')} className="text-xs text-blue-400 font-semibold">
                  All 12 Departments →
                </button>
              </div>
              <div className="mt-4 space-y-3">
                {departments.slice(0, 6).map(dept => (
                  <div key={dept.departmentId} className="p-3 rounded-lg bg-slate-850/60 border border-slate-800">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-white">{dept.departmentName}</span>
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        dept.status === 'Critical' ? 'text-rose-400' : 'text-emerald-400'
                      }`}>
                        {dept.utilization}% {dept.status}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full mt-2 overflow-hidden flex">
                      <div className="h-full bg-blue-500" style={{ width: `${(dept.spent / (dept.allocated || 1)) * 100}%` }} />
                      <div className="h-full bg-amber-500" style={{ width: `${(dept.reserved / (dept.allocated || 1)) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CFO Escalation Box */}
            <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                Executive Escalations
              </h3>
              <p className="text-xs text-slate-400">Claims exceeding policy threshold or flagged by department managers.</p>
              <div className="space-y-2 mt-2">
                {cfoQueue.slice(0, 3).map(item => (
                  <div key={item.approvalId} className="p-3 rounded-lg bg-slate-850 border border-slate-800 text-xs">
                    <div className="font-semibold text-white">{item.expense?.description}</div>
                    <div className="text-rose-400 font-bold mt-1">{formatCurrency(item.expense?.amount || 0)}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{item.departmentName} • Escalated</div>
                    <div className="mt-2 flex justify-end">
                      <button
                        onClick={() => onActionApproval(item.approvalId, 'APPROVE')}
                        className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px]"
                      >
                        Executive Sign-off
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
