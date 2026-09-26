import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Zap, 
  Lock, 
  Mail,
  UserCheck,
  UserPlus,
  Clock,
  AlertCircle
} from 'lucide-react';
import RegisterModal from './RegisterModal';
import { api } from '../api/client';

export default function LoginPage({ onLogin, personas, departments = [] }) {
  const [selectedPersona, setSelectedPersona] = useState(personas[1]); // Default Amit Verma
  const [loadingId, setLoadingId] = useState(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [accountRequests, setAccountRequests] = useState([]);
  const [successToast, setSuccessToast] = useState(null);

  const fetchRequests = async () => {
    try {
      const res = await api.getAccountRequests();
      if (res.success) {
        setAccountRequests(res.data);
      }
    } catch (e) {
      console.error('Failed to fetch account requests:', e);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleQuickLogin = (persona) => {
    setLoadingId(persona.employeeId);
    setTimeout(() => {
      onLogin(persona);
    }, 250);
  };

  const handleRegisterSuccess = (newReq) => {
    fetchRequests();
    setSuccessToast(`Account request for ${newReq.name} submitted! It will appear below until approved by ${newReq.departmentName} Head.`);
    setTimeout(() => setSuccessToast(null), 6000);
  };

  const pendingRequests = accountRequests.filter(r => r.status === 'Pending Approval');
  const approvedRequests = accountRequests.filter(r => r.status === 'Approved');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-4xl w-full space-y-8 relative z-10">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 shadow-xl shadow-indigo-500/20 mb-2">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-3xl font-extrabold tracking-tight text-white">SmartSpend</h1>
              <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                AI Enterprise
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-1 max-w-md mx-auto">
              Intelligent Expense Approval & Real-Time Department Budget Monitoring System
            </p>
          </div>
        </div>

        {/* Success Toast */}
        {successToast && (
          <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-700/80 text-emerald-200 text-xs flex items-center justify-between shadow-xl animate-in fade-in-50">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successToast}</span>
            </div>
            <button onClick={() => setSuccessToast(null)} className="text-emerald-400 hover:text-white font-bold ml-2">×</button>
          </div>
        )}

        {/* 1-Click Demo Accounts Section */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/80 gap-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                Select a Demo Account for 1-Click Instant Login
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Click any role below to explore its permissions, approval queues, and dashboard.
              </p>
            </div>
            
            {/* Request Account Button */}
            <button
              onClick={() => setIsRegisterOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 hover:scale-[1.02]"
            >
              <UserPlus className="w-4 h-4 text-blue-400" />
              <span>Request New Account</span>
            </button>
          </div>

          {/* 4 Demo Account Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {personas.map(p => {
              const isSelected = selectedPersona.employeeId === p.employeeId;
              const isLoading = loadingId === p.employeeId;

              const getBadge = () => {
                if (p.role.includes('Senior Engineer')) return { label: 'Submitter', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' };
                if (p.role.includes('Department Head')) return { label: 'Tier 1 Approver', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' };
                if (p.role.includes('Finance')) return { label: 'Finance Auditor', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
                return { label: 'CFO / Executive', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
              };

              const getFeatures = () => {
                if (p.role.includes('Senior Engineer')) {
                  return 'Submit expenses with OCR, track reimbursement status & available dept budget.';
                }
                if (p.role.includes('Department Head')) {
                  return 'Manage Engineering ₹20.8L monthly budget & 1-click approve/reject team claims & account requests.';
                }
                if (p.role.includes('Finance')) {
                  return 'Level 2 dual sign-off, tax compliance checks & cross-department audit alerts.';
                }
                return 'Authorize high-value claims (>₹50,000), review escalations & enterprise reserves.';
              };

              const badge = getBadge();

              return (
                <div
                  key={p.employeeId}
                  className={`p-5 rounded-xl border transition-all flex flex-col justify-between space-y-4 text-left ${
                    isSelected
                      ? 'bg-slate-800/80 border-blue-500/50 shadow-lg shadow-blue-500/10'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850/60'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">{p.avatar}</span>
                        <div>
                          <h3 className="font-bold text-white text-sm leading-snug">{p.name}</h3>
                          <div className="text-xs text-slate-400 font-medium">{p.role}</div>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 pt-1">
                      <div className="flex items-center gap-1.5 text-slate-300 font-medium mb-1">
                        <span>Dept: {p.departmentName}</span>
                        <span>•</span>
                        <span className="font-mono text-slate-400">{p.employeeId}</span>
                      </div>
                      <p className="text-slate-400 leading-relaxed">{getFeatures()}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleQuickLogin(p)}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Signing In...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 text-amber-300" />
                        <span>1-Click Sign In as {p.name.split(' ')[0]}</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Account Requests Tracker (Shows Pending & Newly Approved Accounts) */}
          {accountRequests.length > 0 && (
            <div className="pt-4 border-t border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Account Onboarding Status Tracker ({accountRequests.length})
                </span>
                <span className="text-[11px] text-slate-500">
                  Must be approved by Department Head before account is created
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {accountRequests.map(req => {
                  const isPending = req.status === 'Pending Approval';
                  const isApproved = req.status === 'Approved';

                  return (
                    <div 
                      key={req.requestId}
                      className={`p-3.5 rounded-xl border text-xs flex flex-col justify-between space-y-2 ${
                        isApproved
                          ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
                          : 'bg-amber-950/20 border-amber-800/40 text-amber-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-white text-xs">{req.name}</div>
                          <div className="text-[11px] text-slate-400">{req.role} ({req.departmentName})</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">{req.email}</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          isApproved 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}>
                          {req.status}
                        </span>
                      </div>

                      <div className="pt-1 text-[11px] text-slate-400">
                        {isPending ? (
                          <div className="flex items-center gap-1 text-amber-300/90">
                            <Lock className="w-3 h-3 text-amber-400 shrink-0" />
                            <span>Awaiting sign-off by Amit Verma (Dept Head)</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span className="text-emerald-400 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Account Active ({req.createdEmployeeId})</span>
                            </span>
                            <button
                              onClick={() => onLogin({
                                employeeId: req.createdEmployeeId || 'EMP999',
                                name: req.name,
                                role: req.role,
                                departmentId: req.departmentId,
                                departmentName: req.departmentName,
                                avatar: '👨‍💼'
                              })}
                              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] transition-colors"
                            >
                              Sign In Now →
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-slate-500 space-y-1">
          <p>Local relational dataset engine connected • Zero database schema modifications</p>
          <p className="text-[11px] text-slate-600">SmartSpend Enterprise v1.0 • 150 Incurred Claims • 120 Department Budgets</p>
        </div>

      </div>

      {/* Register / Account Request Modal */}
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSuccess={handleRegisterSuccess}
        departments={departments}
      />

    </div>
  );
}
