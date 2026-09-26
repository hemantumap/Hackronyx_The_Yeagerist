import React from 'react';
import { UserCheck, Shield, Award, Briefcase, Sparkles, ArrowRightLeft } from 'lucide-react';

export default function RoleContextBar({ 
  currentPersona, 
  setPersona, 
  personas,
  onPersonaSwitchToast
}) {
  const getRoleDescription = (role) => {
    if (role.includes('Senior Engineer') || role.includes('Employee')) {
      return 'Employee Portal: View your personal submitted claims, reimbursement timeline, and submit new expenses.';
    }
    if (role.includes('Department Head')) {
      return 'Department Head Portal: Review pending team claims for Engineering (DEPT001) and monitor departmental budget headroom.';
    }
    if (role.includes('Finance')) {
      return 'Finance Auditor Portal: Validate Level 2 dual sign-offs, inspect receipt compliance, and audit cross-department spending.';
    }
    return 'Executive & CFO Suite: Sign off on high-value expenditures (>₹50,000), review escalations, and oversee enterprise allocations.';
  };

  const getRoleColor = (role) => {
    if (role.includes('Senior Engineer')) return 'from-blue-600/20 to-cyan-600/20 border-blue-500/40 text-blue-300';
    if (role.includes('Department Head')) return 'from-purple-600/20 to-indigo-600/20 border-purple-500/40 text-purple-300';
    if (role.includes('Finance')) return 'from-amber-600/20 to-orange-600/20 border-amber-500/40 text-amber-300';
    return 'from-emerald-600/20 to-teal-600/20 border-emerald-500/40 text-emerald-300';
  };

  const handleSwitch = (p) => {
    setPersona(p);
    if (onPersonaSwitchToast) {
      onPersonaSwitchToast(`Switched workspace to: ${p.name} (${p.role})`);
    }
  };

  return (
    <div className="bg-slate-900/90 border-b border-slate-800/80 px-4 py-2.5 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Left: Active Persona Info */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <ArrowRightLeft className="w-3.5 h-3.5 text-blue-400" />
              Role Mode:
            </span>
            <span className={`px-2.5 py-1 rounded-lg border font-bold bg-gradient-to-r ${getRoleColor(currentPersona.role)} flex items-center gap-1.5`}>
              <span>{currentPersona.avatar}</span>
              <span>{currentPersona.name}</span>
              <span className="opacity-75 font-normal">({currentPersona.role} • {currentPersona.departmentName})</span>
            </span>
          </div>
          <span className="hidden xl:inline text-xs text-slate-400">
            — {getRoleDescription(currentPersona.role)}
          </span>
        </div>

        {/* Right: Quick Role Selector Buttons */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0">
          <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mr-1 hidden sm:inline">
            Quick Switch:
          </span>
          {personas.map(p => {
            const isActive = currentPersona.employeeId === p.employeeId;
            return (
              <button
                key={p.employeeId}
                onClick={() => handleSwitch(p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-1 ring-blue-400 scale-[1.03]'
                    : 'bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <span>{p.avatar}</span>
                <span>{p.name.split(' ')[0]}</span>
                <span className="text-[10px] opacity-75 hidden sm:inline">
                  ({p.role.includes('Head') ? 'Dept Head' : p.role.includes('Finance') ? 'Finance' : p.role.includes('Officer') ? 'CFO' : 'Employee'})
                </span>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}
