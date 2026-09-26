import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Receipt,
  X,
  PlusCircle,
  ExternalLink
} from 'lucide-react';
import { formatCurrency, formatDate, getStatusStyle, getPriorityStyle } from '../utils/formatters';
import ReceiptModal from './ReceiptModal';

export default function ExpensesView({ 
  expenses = [], 
  departments = [], 
  categories = [], 
  onOpenNewExpense,
  onViewApproval
}) {
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [activeExpense, setActiveExpense] = useState(null);
  const [inspectReceiptExpense, setInspectReceiptExpense] = useState(null);

  // Filter expenses
  const filtered = expenses.filter(e => {
    if (selectedStatus !== 'ALL' && e.status.toUpperCase() !== selectedStatus) {
      return false;
    }
    if (selectedDept && e.departmentId !== selectedDept) {
      return false;
    }
    if (selectedCategory && e.category !== selectedCategory) {
      return false;
    }
    if (selectedPriority && e.priority.toUpperCase() !== selectedPriority.toUpperCase()) {
      return false;
    }
    if (search) {
      const q = search.toLowerCase();
      const match = (
        e.expenseId.toLowerCase().includes(q) ||
        (e.description && e.description.toLowerCase().includes(q)) ||
        (e.vendor && e.vendor.toLowerCase().includes(q)) ||
        (e.employeeId && e.employeeId.toLowerCase().includes(q))
      );
      if (!match) return false;
    }
    return true;
  });

  const statusCounts = {
    ALL: expenses.length,
    PENDING: expenses.filter(e => e.status.toUpperCase() === 'PENDING').length,
    APPROVED: expenses.filter(e => e.status.toUpperCase() === 'APPROVED').length,
    'UNDER REVIEW': expenses.filter(e => e.status.toUpperCase() === 'UNDER REVIEW').length,
    REJECTED: expenses.filter(e => e.status.toUpperCase() === 'REJECTED').length,
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      
      {/* Header & Submit CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Expense Operations Ledger
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Audit-ready view of all incurred, pending, and approved corporate expenditures.
          </p>
        </div>
        <button
          onClick={onOpenNewExpense}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all hover:scale-[1.02]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Expense Claim</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 overflow-x-auto">
        {['ALL', 'PENDING', 'APPROVED', 'UNDER REVIEW', 'REJECTED'].map(tab => (
          <button
            key={tab}
            onClick={() => setSelectedStatus(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              selectedStatus === tab
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {tab} <span className="opacity-70 ml-1">({statusCounts[tab] || 0})</span>
          </button>
        ))}
      </div>

      {/* Search & Select Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by ID, Vendor, or Purpose..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Department Filter */}
        <div>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Departments</option>
            {departments.map(d => (
              <option key={d.departmentId} value={d.departmentId}>
                {d.name} ({d.departmentId})
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.categoryId} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Normal">Normal</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="glass-panel rounded-xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Expense ID</th>
                <th className="py-3.5 px-4">Employee / Dept</th>
                <th className="py-3.5 px-4">Category & Vendor</th>
                <th className="py-3.5 px-4">Purpose</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Receipt</th>
                <th className="py-3.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-slate-500">
                    No matching expenses found.
                  </td>
                </tr>
              ) : (
                filtered.slice(0, 50).map(expense => (
                  <tr 
                    key={expense.expenseId}
                    onClick={() => setActiveExpense(expense)}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-400">
                      {expense.expenseId}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-200">{expense.employeeId}</div>
                      <div className="text-[10px] text-slate-400">{expense.departmentId}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-200 font-medium">{expense.category}</div>
                      <div className="text-[10px] text-slate-400">{expense.vendor || '—'}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate" title={expense.description}>
                      {expense.description}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      {formatDate(expense.expenseDate)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                      {formatCurrency(expense.amount, expense.currency)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getPriorityStyle(expense.priority)}`}>
                        {expense.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {expense.receiptAvailable ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setInspectReceiptExpense(expense);
                          }}
                          className="inline-flex items-center text-emerald-400 hover:text-emerald-300 gap-1 text-[11px] font-medium bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/20 transition-colors"
                          title="Inspect Digital Tax Invoice"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                      ) : (
                        <span className="inline-flex items-center text-rose-400 gap-1 text-[11px]" title="Receipt missing">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Missing</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(expense.status)}`}>
                        {expense.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-3 bg-slate-900/60 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span>Showing {Math.min(50, filtered.length)} of {filtered.length} total records</span>
          <span className="text-[11px]">Click any row for complete audit details</span>
        </div>
      </div>

      {/* Slide-out Expense Details Drawer */}
      {activeExpense && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in-50">
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-6 overflow-y-auto space-y-6 shadow-2xl">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono font-bold text-blue-400">{activeExpense.expenseId}</span>
                <h3 className="text-lg font-bold text-white mt-0.5">{activeExpense.description}</h3>
              </div>
              <button 
                onClick={() => setActiveExpense(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Total Claim Amount</span>
                <span className="text-xl font-bold text-white">
                  {formatCurrency(activeExpense.amount, activeExpense.currency)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-700/60">
                <span className="text-xs text-slate-400">Workflow Status</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getStatusStyle(activeExpense.status)}`}>
                  {activeExpense.status}
                </span>
              </div>
            </div>

            {/* Core Details */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Employee ID</span>
                <span className="text-slate-200 font-mono">{activeExpense.employeeId}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Department</span>
                <span className="text-slate-200">{activeExpense.departmentId}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Cost Center</span>
                <span className="text-slate-200 font-mono">{activeExpense.costCenter || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Category</span>
                <span className="text-slate-200 font-semibold">{activeExpense.category}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Vendor / Merchant</span>
                <span className="text-slate-200">{activeExpense.vendor || '—'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Payment Method</span>
                <span className="text-slate-200">{activeExpense.paymentMethod}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Expense Incurred Date</span>
                <span className="text-slate-200">{formatDate(activeExpense.expenseDate)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Submitted Date</span>
                <span className="text-slate-200">{formatDate(activeExpense.submittedDate)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Priority Tier</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getPriorityStyle(activeExpense.priority)}`}>
                  {activeExpense.priority}
                </span>
              </div>
            </div>

            {/* Receipt Verification Box */}
            <div className={`p-4 rounded-xl border text-xs ${
              activeExpense.receiptAvailable
                ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                : 'bg-rose-950/20 border-rose-800/40 text-rose-300'
            }`}>
              <div className="flex items-center gap-2 font-bold">
                <Receipt className="w-4 h-4" />
                <span>{activeExpense.receiptAvailable ? 'Itemized Receipt Verified' : 'Receipt Not Attached'}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {activeExpense.receiptAvailable
                  ? 'Digital invoice was uploaded and OCR parsed against company tax & GST rules.'
                  : 'Policy alert: Approvals above ₹1,000 without receipt require formal finance justification.'}
              </p>
              {activeExpense.receiptAvailable && (
                <button
                  type="button"
                  onClick={() => setInspectReceiptExpense(activeExpense)}
                  className="mt-3 w-full py-1.5 px-3 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>View Itemized Digital Invoice</span>
                </button>
              )}
            </div>

            {/* Quick Action */}
            <button
              onClick={() => {
                onViewApproval(activeExpense.expenseId);
                setActiveExpense(null);
              }}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
            >
              <span>View in Approvals Workflow</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

          </div>
        </div>
      )}

      {/* Itemized Digital Receipt Lightbox */}
      <ReceiptModal
        isOpen={Boolean(inspectReceiptExpense)}
        onClose={() => setInspectReceiptExpense(null)}
        expense={inspectReceiptExpense}
      />

    </div>
  );
}
