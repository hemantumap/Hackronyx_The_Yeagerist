import React, { useState } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Copy, 
  Receipt, 
  TrendingUp, 
  Sparkles,
  FileCheck,
  CheckCircle,
  ExternalLink,
  SlidersHorizontal
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function AnomalyHub({ 
  anomalies = [], 
  policies,
  onViewExpense 
}) {
  const [activeTab, setActiveTab] = useState('ANOMALIES');
  const [filterSeverity, setFilterSeverity] = useState('ALL');

  // Stats
  const duplicateCount = anomalies.filter(a => a.flags.some(f => f.type === 'POTENTIAL_DUPLICATE')).length;
  const missingReceiptCount = anomalies.filter(a => a.flags.some(f => f.type === 'MISSING_RECEIPT')).length;
  const outlierCount = anomalies.filter(a => a.flags.some(f => f.type === 'STATISTICAL_OUTLIER')).length;
  const highValueCount = anomalies.filter(a => a.flags.some(f => f.type === 'HIGH_VALUE_AUDIT')).length;

  const filtered = anomalies.filter(a => {
    if (filterSeverity === 'HIGH' && a.riskScore < 50) return false;
    if (filterSeverity === 'CRITICAL' && a.riskScore < 70) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-400" />
            AI Anomaly & Policy Compliance Center
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Automated fraud prevention, duplicate claim detection, and out-of-policy risk scoring.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center space-x-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('ANOMALIES')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'ANOMALIES' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Flagged Violations ({anomalies.length})
          </button>
          <button
            onClick={() => setActiveTab('POLICIES')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'POLICIES' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Approval Tier Rules
          </button>
        </div>
      </div>

      {activeTab === 'ANOMALIES' ? (
        <>
          {/* Summary Metric Counters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="glass-panel p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-slate-400">Potential Duplicates</span>
                <Copy className="w-4 h-4 text-rose-400" />
              </div>
              <div className="mt-2 text-2xl font-bold text-rose-400">{duplicateCount}</div>
              <p className="text-[11px] text-slate-400 mt-1">Identical vendor & amount matches</p>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-slate-400">Receipt Violations</span>
                <Receipt className="w-4 h-4 text-amber-400" />
              </div>
              <div className="mt-2 text-2xl font-bold text-amber-400">{missingReceiptCount}</div>
              <p className="text-[11px] text-slate-400 mt-1">Exceeds threshold without invoice</p>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-slate-400">Statistical Outliers</span>
                <TrendingUp className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="mt-2 text-2xl font-bold text-cyan-400">{outlierCount}</div>
              <p className="text-[11px] text-slate-400 mt-1">&gt;2.8x category baseline average</p>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-slate-400">High-Value Audits</span>
                <ShieldAlert className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="mt-2 text-2xl font-bold text-indigo-400">{highValueCount}</div>
              <p className="text-[11px] text-slate-400 mt-1">&ge; ₹50,000 executive approval</p>
            </div>

          </div>

          {/* Anomaly Triage List */}
          <div className="glass-panel rounded-xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Active Anomaly Triage Queue
              </h2>
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-400">Risk Filter:</span>
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="px-2.5 py-1 bg-slate-850 border border-slate-700 rounded-lg text-slate-200"
                >
                  <option value="ALL">All Risk Levels</option>
                  <option value="HIGH">High Risk (Score &ge; 50)</option>
                  <option value="CRITICAL">Critical Risk (Score &ge; 70)</option>
                </select>
              </div>
            </div>

            <div className="divide-y divide-slate-800/80">
              {filtered.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No flagged anomalies matching this filter.
                </div>
              ) : (
                filtered.map(item => (
                  <div key={item.expenseId} className="p-4 hover:bg-slate-800/40 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      
                      <div className="flex items-start space-x-3">
                        {/* Risk Score Circle */}
                        <div className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center shrink-0 border font-bold ${
                          item.riskScore >= 70
                            ? 'bg-rose-950/50 border-rose-700 text-rose-400'
                            : item.riskScore >= 40
                            ? 'bg-amber-950/50 border-amber-700 text-amber-400'
                            : 'bg-blue-950/50 border-blue-700 text-blue-400'
                        }`}>
                          <span className="text-xs leading-none">{item.riskScore}</span>
                          <span className="text-[9px] uppercase font-medium opacity-80">Risk</span>
                        </div>

                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-bold text-blue-400 text-xs">{item.expenseId}</span>
                            <span className="text-white font-semibold text-xs">{item.vendor}</span>
                            <span className="text-[10px] text-slate-400 font-mono">({item.category})</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Claimed by {item.employeeId} • Department {item.departmentId}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="font-bold text-white text-sm">{formatCurrency(item.amount)}</div>
                          <div className="text-[10px] text-slate-400">{item.status}</div>
                        </div>
                        <button
                          onClick={() => onViewExpense(item.expenseId)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1"
                        >
                          <span>Investigate</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>

                    </div>

                    {/* Detected Flags */}
                    <div className="mt-3 pl-14 space-y-1.5">
                      {item.flags.map((flag, idx) => (
                        <div 
                          key={idx}
                          className={`p-2 rounded-lg text-xs border flex items-center space-x-2 ${
                            flag.severity === 'CRITICAL'
                              ? 'bg-rose-950/30 border-rose-800/40 text-rose-200'
                              : flag.severity === 'HIGH'
                              ? 'bg-amber-950/30 border-amber-800/40 text-amber-200'
                              : 'bg-blue-950/30 border-blue-800/40 text-blue-200'
                          }`}
                        >
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span className="font-medium">{flag.message}</span>
                        </div>
                      ))}
                    </div>

                  </div>
                ))
              )}
            </div>
          </div>
        </>
      ) : (
        /* Policies Inspector */
        <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-blue-400" />
              Company Expense Policy & Approval Thresholds
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Active configuration: {policies?.organization || 'Enterprise Org'} • Version {policies?.policyVersion || '2.4.0'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(policies?.tierThresholds || []).map((t, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-850 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold text-xs">
                    Tier {t.tier}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">SLA: {t.slaHours} hours</span>
                </div>
                <h3 className="font-bold text-white text-sm">{t.name}</h3>
                <div className="text-xs font-semibold text-emerald-400">
                  {formatCurrency(t.minAmount, 'USD')} — {formatCurrency(t.maxAmount, 'USD')}
                </div>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <div className="font-semibold text-slate-300">Required Approvers:</div>
                  <div className="font-mono text-indigo-300">{t.requiredApprovers.join(' → ')}</div>
                  <div className="font-semibold text-slate-300 mt-2">Compliance Rules:</div>
                  <ul className="list-disc list-inside space-y-0.5">
                    {t.conditions.map((c, cIdx) => (
                      <li key={cIdx}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
