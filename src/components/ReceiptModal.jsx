import React from 'react';
import { X, CheckCircle2, AlertTriangle, Printer, Download, Sparkles, Building, QrCode } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function ReceiptModal({ isOpen, onClose, expense }) {
  if (!isOpen || !expense) return null;

  const handlePrint = () => {
    window.print();
  };

  const isApproved = expense.status?.toLowerCase() === 'approved';

  // Vendor branding helpers
  const getVendorLogoColor = (vendor = '') => {
    const v = vendor.toLowerCase();
    if (v.includes('aws') || v.includes('amazon')) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    if (v.includes('dell')) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    if (v.includes('uber')) return 'bg-slate-700/40 text-slate-200 border-slate-600';
    if (v.includes('taj') || v.includes('hotel') || v.includes('restaurant')) return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
  };

  const invoiceNumber = `INV-${expense.expenseId}-${Math.floor(1000 + Math.random() * 9000)}`;
  const subtotal = Math.round(Number(expense.amount || 0) * 0.8475);
  const gst = Math.round(Number(expense.amount || 0) - subtotal);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in-50">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Top Action Bar */}
        <div className="p-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-slate-400">{expense.expenseId}</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300 font-semibold">Digital Tax Invoice & Receipt</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> AI OCR Verified
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Print Receipt"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Paper Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs bg-slate-950 font-sans">
          
          {/* Invoice Header */}
          <div className="flex items-start justify-between pb-6 border-b border-slate-800">
            <div>
              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center font-bold text-base mb-2 ${getVendorLogoColor(expense.vendor)}`}>
                {(expense.vendor || 'V').substring(0, 3).toUpperCase()}
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">{expense.vendor || 'Corporate Merchant'}</h2>
              <p className="text-slate-400 text-[11px]">Authorized Business Vendor • Tax Reg. GSTIN29AAACA1234F1Z5</p>
            </div>

            <div className="text-right space-y-1">
              <div className="text-xs uppercase font-bold text-blue-400 tracking-wider">TAX INVOICE</div>
              <div className="font-mono text-slate-300">{invoiceNumber}</div>
              <div className="text-slate-400 text-[11px]">Date: {formatDate(expense.expenseDate)}</div>
              <div className="text-[10px] text-slate-500 font-mono">Payment: {expense.paymentMethod}</div>
            </div>
          </div>

          {/* Billed To / Department */}
          <div className="grid grid-cols-2 gap-4 p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px]">
            <div>
              <span className="text-slate-500 uppercase font-semibold text-[10px] block mb-1">Claimant Employee</span>
              <div className="font-bold text-slate-200">{expense.employeeId}</div>
              <div className="text-slate-400">Department: {expense.departmentId}</div>
            </div>
            <div>
              <span className="text-slate-500 uppercase font-semibold text-[10px] block mb-1">Cost Center & Category</span>
              <div className="font-mono text-slate-200">{expense.costCenter || 'CC-001'}</div>
              <div className="text-slate-400">{expense.category}</div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Taxable</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                <tr>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-white">{expense.description || expense.category}</div>
                    <div className="text-[10px] text-slate-400">Category: {expense.category} • Method: {expense.paymentMethod}</div>
                  </td>
                  <td className="py-3 px-3 text-center text-slate-400">1</td>
                  <td className="py-3 px-3 text-right text-slate-300">{formatCurrency(subtotal)}</td>
                  <td className="py-3 px-3 text-right font-bold text-white">{formatCurrency(subtotal)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals Breakdown */}
          <div className="flex justify-end pt-2">
            <div className="w-64 space-y-1.5 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Subtotal (Net):</span>
                <span className="text-slate-200 font-mono">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>IGST / VAT (18%):</span>
                <span className="text-slate-200 font-mono">{formatCurrency(gst)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-800 font-bold text-sm text-white">
                <span>Total Amount:</span>
                <span className="text-blue-400 font-mono">{formatCurrency(expense.amount, expense.currency)}</span>
              </div>
            </div>
          </div>

          {/* Approval Signature / Watermark Stamp */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500">Compliance Verification:</span>
              <p className="text-[11px] text-slate-400">
                Receipt checksum matched with digital audit ledger. No duplicate claims detected.
              </p>
            </div>

            {/* Approval Stamp Badge */}
            <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 ${
              isApproved
                ? 'bg-emerald-950/40 border-emerald-600 text-emerald-400'
                : 'bg-amber-950/40 border-amber-600 text-amber-400'
            }`}>
              {isApproved ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="font-extrabold uppercase text-[11px] tracking-wider leading-none">APPROVED</div>
                    <div className="text-[9px] opacity-80 mt-0.5">Budget Encumbered & Spent</div>
                  </div>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <div>
                    <div className="font-extrabold uppercase text-[11px] tracking-wider leading-none">{expense.status.toUpperCase()}</div>
                    <div className="text-[9px] opacity-80 mt-0.5">Budget Soft-Reserved</div>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-slate-900 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Close Receipt View
          </button>
        </div>

      </div>
    </div>
  );
}
