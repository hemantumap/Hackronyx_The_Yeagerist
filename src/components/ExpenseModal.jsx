import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Receipt, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  DollarSign,
  ArrowRight,
  UploadCloud
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export default function ExpenseModal({ 
  isOpen, 
  onClose, 
  departments = [], 
  categories = [], 
  currentPersona, 
  onSubmitSuccess,
  budgets = []
}) {
  if (!isOpen) return null;

  const [employeeId, setEmployeeId] = useState(currentPersona?.employeeId || 'EMP001');
  const [departmentId, setDepartmentId] = useState(currentPersona?.departmentId || 'DEPT001');
  const [category, setCategory] = useState('Software');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [vendor, setVendor] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('Corporate Card');
  const [priority, setPriority] = useState('Normal');
  const [receiptAvailable, setReceiptAvailable] = useState(true);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ocrStatus, setOcrStatus] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Sync with persona when opened
  useEffect(() => {
    if (currentPersona) {
      setEmployeeId(currentPersona.employeeId);
      setDepartmentId(currentPersona.departmentId);
    }
  }, [currentPersona]);

  // Find department budget for soft-commitment preview
  const deptBudgets = budgets.filter(b => b.departmentId === departmentId);
  const activeBudget = deptBudgets[deptBudgets.length - 1]; // Latest month

  const currentSpent = activeBudget ? Number(activeBudget.spentAmount || 0) : 0;
  const currentReserved = activeBudget ? Number(activeBudget.reservedAmount || 0) : 0;
  const allocated = activeBudget ? Number(activeBudget.allocatedBudget || 1) : 1;
  const enteredAmount = Number(amount || 0);

  const projectedReserved = currentReserved + enteredAmount;
  const projectedRemaining = Math.max(0, allocated - (currentSpent + projectedReserved));
  const projectedUtilization = Number(((currentSpent + projectedReserved) / allocated * 100).toFixed(1));

  // OCR Sample simulation presets
  const ocrPresets = [
    {
      label: 'AWS Cloud Server',
      vendor: 'Amazon Web Services',
      amount: 18450,
      category: 'Software',
      description: 'Monthly cloud infrastructure cluster billing',
      priority: 'High'
    },
    {
      label: 'Client Strategy Lunch',
      vendor: 'Taj Palace Hotel',
      amount: 4800,
      category: 'Meals',
      description: 'Business quarterly alignment lunch with enterprise client',
      priority: 'Normal'
    },
    {
      label: 'Dell 4K Workstation',
      vendor: 'Dell Technologies',
      amount: 32900,
      category: 'Hardware',
      description: 'Dual monitor and docking station for new engineering lead',
      priority: 'Critical'
    }
  ];

  const handleApplyPreset = (preset) => {
    setVendor(preset.vendor);
    setAmount(preset.amount);
    setCategory(preset.category);
    setDescription(preset.description);
    setPriority(preset.priority);
    setReceiptAvailable(true);
    setOcrStatus(`AI OCR Matched: 98.6% confidence from digital receipt • ${preset.vendor}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!amount || Number(amount) <= 0) {
      setErrorMsg('Please enter a valid expense amount.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitSuccess({
        employeeId,
        departmentId,
        category,
        description: description || `${category} expense`,
        amount: Number(amount),
        currency: 'INR',
        expenseDate,
        priority,
        paymentMethod,
        receiptAvailable,
        vendor: vendor || 'Corporate Vendor'
      });
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in-50">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950/40 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Submit New Expense Claim</h2>
              <p className="text-xs text-slate-400">Intelligent policy validation & soft budget encumbrance</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs">
          
          {/* AI OCR Quick Extract Section */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-950/40 to-indigo-950/30 border border-blue-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-blue-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Simulated Smart Receipt OCR Extractor
              </span>
              <span className="text-[11px] text-slate-400">Click to autofill sample invoice:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {ocrPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="px-2.5 py-1.5 rounded-lg bg-blue-900/40 hover:bg-blue-800/60 border border-blue-700/50 text-blue-200 text-[11px] font-medium transition-all hover:scale-[1.02]"
                >
                  ⚡ {preset.label} (₹{preset.amount})
                </button>
              ))}
            </div>
            {ocrStatus && (
              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{ocrStatus}</span>
              </div>
            )}
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/50 text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Row 1: Employee & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Employee Submitter ID</label>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Department Allocation</label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
              >
                {departments.map(d => (
                  <option key={d.departmentId} value={d.departmentId}>
                    {d.name} ({d.departmentId})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Category & Vendor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Expense Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
              >
                {categories.map(c => (
                  <option key={c.categoryId} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Vendor / Merchant</label>
              <input
                type="text"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                placeholder="e.g. AWS, Microsoft, Uber, Taj"
                required
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Row 3: Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Amount (INR ₹)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="1"
                  required
                  className="w-full pl-8 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 font-bold text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Transaction Date</label>
              <input
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Row 4: Description */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Business Purpose & Justification</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Production database server scalability upgrade"
              required
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Row 5: Priority & Payment Method & Receipt */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="Corporate Card">Corporate Card</option>
                <option value="Purchase Order">Purchase Order</option>
                <option value="Direct Reimbursement">Direct Reimbursement</option>
              </select>
            </div>
            <div className="flex flex-col justify-end">
              <label className="flex items-center space-x-2 py-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={receiptAvailable}
                  onChange={(e) => setReceiptAvailable(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-0 w-4 h-4"
                />
                <span className="font-semibold text-slate-300">Receipt Attached</span>
              </label>
            </div>
          </div>

          {/* Live Soft-Commitment Impact Card */}
          {activeBudget && enteredAmount > 0 && (
            <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  Live Budget Encumbrance Preview ({departmentId})
                </span>
                <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                  projectedUtilization >= 85 ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' :
                  projectedUtilization >= 70 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                }`}>
                  Projected Utilization: {projectedUtilization}%
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-[11px] pt-1">
                <div className="p-2 rounded bg-slate-800">
                  <div className="text-slate-400">Current Reserved</div>
                  <div className="font-bold text-amber-400">{formatCurrency(currentReserved)}</div>
                </div>
                <div className="p-2 rounded bg-slate-800">
                  <div className="text-slate-400">Post-Submission Reserved</div>
                  <div className="font-bold text-amber-300">{formatCurrency(projectedReserved)}</div>
                </div>
                <div className="p-2 rounded bg-slate-800">
                  <div className="text-slate-400">Remaining Budget</div>
                  <div className="font-bold text-emerald-400">{formatCurrency(projectedRemaining)}</div>
                </div>
              </div>
              {projectedUtilization >= 85 && (
                <p className="text-[11px] text-rose-400 font-medium">
                  ⚠️ Warning: This expense pushes department budget past the 85% critical threshold!
                </p>
              )}
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold transition-all shadow-lg shadow-blue-600/30 flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing Policy...</span>
                </>
              ) : (
                <>
                  <span>Submit & Encumber Budget</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
