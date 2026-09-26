import React, { useState } from 'react';
import { 
  Building2, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  ShieldCheck, 
  ChevronRight, 
  X,
  Calendar,
  Layers,
  BarChart3
} from 'lucide-react';
import { formatCurrency, getStatusStyle } from '../utils/formatters';

export default function BudgetsView({ 
  departments = [], 
  budgets = [], 
  alerts = [] 
}) {
  const [selectedMonth, setSelectedMonth] = useState('2026-02');
  const [activeDeptModal, setActiveDeptModal] = useState(null);

  // Available months from budgets
  const months = Array.from(new Set(budgets.map(b => b.month))).sort();

  // Combine departments with their budget for the selected month
  const deptCards = departments.map(dept => {
    const budget = budgets.find(b => b.departmentId === dept.departmentId && b.month === selectedMonth) || {
      allocatedBudget: 200000,
      spentAmount: 0,
      reservedAmount: 0,
      remainingBudget: 200000,
      utilizationPercentage: 0,
      budgetStatus: 'Healthy'
    };

    const deptAlerts = alerts.filter(a => a.departmentId === dept.departmentId && a.month === selectedMonth);

    return {
      ...dept,
      budget,
      alerts: deptAlerts
    };
  });

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      
      {/* Header & Month Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Department Budget Health & Velocity
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Real-time monitoring of monthly allocations, hard spent amounts, and pending encumbrances.
          </p>
        </div>

        {/* Month Selector */}
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400 font-medium">Reporting Cycle:</span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-slate-200 focus:outline-none focus:border-blue-500"
          >
            {months.map(m => (
              <option key={m} value={m}>
                {m} (Monthly FY 2026)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {deptCards.map(dept => {
          const b = dept.budget;
          const spentPct = (Number(b.spentAmount || 0) / Number(b.allocatedBudget || 1)) * 100;
          const resPct = (Number(b.reservedAmount || 0) / Number(b.allocatedBudget || 1)) * 100;

          return (
            <div 
              key={dept.departmentId}
              className="glass-panel rounded-xl p-5 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Card Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base">{dept.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                      <span>{dept.departmentId}</span>
                      <span>•</span>
                      <span>{dept.location}</span>
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getStatusStyle(b.budgetStatus)}`}>
                    {b.utilizationPercentage}% {b.budgetStatus}
                  </span>
                </div>

                {/* Numbers Summary */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
                    <span className="text-[11px] text-slate-400">Allocated</span>
                    <div className="font-bold text-white text-sm">{formatCurrency(b.allocatedBudget)}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
                    <span className="text-[11px] text-slate-400">Remaining</span>
                    <div className="font-bold text-emerald-400 text-sm">{formatCurrency(b.remainingBudget)}</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Utilization ({b.utilizationPercentage}%)</span>
                    <span>100% Cap</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
                    <div 
                      className="h-full bg-blue-500" 
                      style={{ width: `${Math.min(100, spentPct)}%` }} 
                      title={`Spent: ${formatCurrency(b.spentAmount)}`}
                    />
                    <div 
                      className="h-full bg-amber-500" 
                      style={{ width: `${Math.min(100 - spentPct, resPct)}%` }} 
                      title={`Reserved: ${formatCurrency(b.reservedAmount)}`}
                    />
                  </div>
                </div>

                {/* Legend Breakdown */}
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2.5">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Spent: <strong className="text-slate-200">{formatCurrency(b.spentAmount)}</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Soft Hold: <strong className="text-amber-300">{formatCurrency(b.reservedAmount)}</strong>
                  </span>
                </div>

                {/* Active Alerts (if any) */}
                {dept.alerts.length > 0 && (
                  <div className="mt-3 p-2 rounded-lg bg-rose-950/30 border border-rose-800/40 text-[11px] text-rose-300 flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                    <span className="truncate">{dept.alerts[0].message}</span>
                  </div>
                )}
              </div>

              {/* Bottom Action */}
              <div className="mt-4 pt-3 border-t border-slate-800/80">
                <button
                  onClick={() => setActiveDeptModal(dept)}
                  className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Inspect Monthly Historical Trend</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Historical Trend Drilldown Modal */}
      {activeDeptModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono font-bold text-blue-400">{activeDeptModal.departmentId}</span>
                <h2 className="text-xl font-bold text-white">{activeDeptModal.name} - Annual Budget Trajectory</h2>
                <p className="text-xs text-slate-400 mt-0.5">Location: {activeDeptModal.location} • Manager ID: {activeDeptModal.managerId}</p>
              </div>
              <button 
                onClick={() => setActiveDeptModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Monthly Breakdown Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-850 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Month</th>
                    <th className="py-2.5 px-3">Allocated</th>
                    <th className="py-2.5 px-3">Spent</th>
                    <th className="py-2.5 px-3">Reserved</th>
                    <th className="py-2.5 px-3">Remaining</th>
                    <th className="py-2.5 px-3 text-center">Utilization</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {budgets
                    .filter(b => b.departmentId === activeDeptModal.departmentId)
                    .sort((a, b) => a.month.localeCompare(b.month))
                    .map(b => (
                      <tr key={b.budgetId} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-semibold text-slate-200">{b.month}</td>
                        <td className="py-2.5 px-3 text-slate-300">{formatCurrency(b.allocatedBudget)}</td>
                        <td className="py-2.5 px-3 font-medium text-blue-400">{formatCurrency(b.spentAmount)}</td>
                        <td className="py-2.5 px-3 font-medium text-amber-400">{formatCurrency(b.reservedAmount)}</td>
                        <td className="py-2.5 px-3 font-medium text-emerald-400">{formatCurrency(b.remainingBudget)}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-white">{b.utilizationPercentage}%</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusStyle(b.budgetStatus)}`}>
                            {b.budgetStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveDeptModal(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Close Trend Inspection
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
