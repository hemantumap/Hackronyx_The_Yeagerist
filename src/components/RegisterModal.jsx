import React, { useState } from 'react';
import { 
  X, 
  UserPlus, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Building2, 
  ArrowRight,
  Sparkles,
  Lock
} from 'lucide-react';
import { api } from '../api/client';

export default function RegisterModal({ isOpen, onClose, onSuccess, departments = [] }) {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [departmentId, setDepartmentId] = useState('DEPT001');
  const [role, setRole] = useState('Software Engineer');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleFillSample = () => {
    const randomId = Math.floor(100 + Math.random() * 900);
    setName(`Kavita Rao`);
    setEmail(`kavita.rao${randomId}@enterprise.com`);
    setDepartmentId('DEPT001');
    setRole('Senior Cloud Architect');
    setReason('Joined Engineering platform team. Requires authorization for AWS cloud expense reimbursements.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name || !email || !departmentId) {
      setErrorMsg('Please fill in your name, email, and select your department.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.submitAccountRequest({
        name,
        email,
        departmentId,
        role,
        reason
      });

      if (res.success) {
        onSuccess(res.data);
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit account request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedDept = departments.find(d => d.departmentId === departmentId);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in-50">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950/40 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Request Corporate Account</h2>
              <p className="text-xs text-slate-400">Department Head authorization required for activation</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {/* Policy Notice Box */}
          <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-200 flex items-start space-x-2.5">
            <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-xs text-amber-300">Approval Required Policy:</span>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Your account will be created with status <strong className="text-amber-400 font-semibold">"Pending Approval"</strong>. 
                Your Department Head ({selectedDept?.name || 'Department'} Manager) must review and approve it before you can log in.
              </p>
            </div>
          </div>

          {/* Preset Helper */}
          <div className="flex justify-between items-center pt-1">
            <span className="text-[11px] text-slate-400">Quick Testing:</span>
            <button
              type="button"
              onClick={handleFillSample}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 bg-cyan-950/30 px-2.5 py-1 rounded-lg border border-cyan-800/30"
            >
              <Sparkles className="w-3 h-3" />
              <span>⚡ Auto-fill Sample New Employee</span>
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/50 text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Full Legal Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Kavita Rao"
              required
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>

          {/* Corporate Email */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Work Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. kavita.rao@enterprise.com"
              required
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>

          {/* Department Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Department</label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500"
              >
                {departments.map(d => (
                  <option key={d.departmentId} value={d.departmentId}>
                    {d.name} ({d.departmentId})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Proposed Role / Title</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Senior Cloud Architect"
                required
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Reason / Onboarding note */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Onboarding Justification for Department Head</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Joined Engineering platform team. Requires authorization for AWS cloud expense reimbursements."
              rows={2}
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold transition-all shadow-lg shadow-blue-600/30 flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Routing to Head...</span>
                </>
              ) : (
                <>
                  <span>Submit for Head Approval</span>
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
