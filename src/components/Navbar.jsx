import React, { useState, useRef, useEffect } from 'react';
import { 
  Building2, 
  Bell, 
  PlusCircle, 
  ChevronDown, 
  AlertTriangle,
  Layers,
  ShieldCheck,
  Briefcase,
  LogOut,
  BarChart3,
  Sparkles,
  FileSpreadsheet,
  CheckCircle2,
  X,
  Sun,
  Moon,
  Palette
} from 'lucide-react';

export default function Navbar({ 
  currentPersona, 
  setPersona, 
  personas, 
  alerts = [], 
  onOpenNewExpense, 
  activeTab, 
  setActiveTab,
  onLogout,
  theme = 'dark',
  setTheme,
  accent = 'blue',
  setAccent
}) {
  const [showAlertsMenu, setShowAlertsMenu] = useState(false);
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [showModulesMenu, setShowModulesMenu] = useState(false);
  const [showPaletteMenu, setShowPaletteMenu] = useState(false);

  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL').length;
  const warningCount = alerts.filter(a => a.severity === 'WARNING').length;

  const isMoreModuleActive = ['budgets', 'anomalies', 'audit'].includes(activeTab);

  // Close menus when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.nav-dropdown-container')) {
        setShowAlertsMenu(false);
        setShowPersonaMenu(false);
        setShowModulesMenu(false);
        setShowPaletteMenu(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800/80 shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between h-20 gap-6">
          
          {/* 1. Logo & System Brand */}
          <div 
            className="flex items-center space-x-3.5 cursor-pointer shrink-0 select-none py-2" 
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-1 ring-white/20 transition-transform hover:scale-105">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-white">SmartSpend</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  AI Enterprise
                </span>
              </div>
              <p className="text-xs text-slate-400 tracking-wide mt-0.5">Expense Approval & Budget Monitoring</p>
            </div>
          </div>

          {/* 2. Navigation Items with Generous Spacing & Dropdown Menu */}
          <nav className="hidden lg:flex items-center space-x-3">
            
            {/* Primary View Tabs */}
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'expenses', label: 'Expenses' },
              { id: 'approvals', label: 'Approvals' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-sm shadow-blue-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {tab.label}
              </button>
            ))}

            {/* Dropdown Menu for Governance, Budgets & AI */}
            <div className="relative nav-dropdown-container">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowModulesMenu(!showModulesMenu);
                  setShowAlertsMenu(false);
                  setShowPersonaMenu(false);
                }}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center space-x-2 ${
                  isMoreModuleActive || showModulesMenu
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm shadow-indigo-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <span>Governance & AI</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showModulesMenu ? 'rotate-180 text-indigo-400' : ''}`} />
              </button>

              {showModulesMenu && (
                <div className="absolute left-0 mt-3 w-72 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-2.5 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/80">
                    Advanced Modules & Reports
                  </div>
                  
                  <div className="mt-1.5 space-y-1">
                    {[
                      {
                        id: 'budgets',
                        title: 'Department Budgets',
                        desc: 'Live spend, soft encumbrances & health',
                        icon: BarChart3,
                        color: 'text-emerald-400 bg-emerald-500/10'
                      },
                      {
                        id: 'anomalies',
                        title: 'AI Anomaly Hub',
                        desc: 'Fraud checks, risk scores & policies',
                        icon: Sparkles,
                        color: 'text-purple-400 bg-purple-500/10'
                      },
                      {
                        id: 'audit',
                        title: 'Audit Logs & Export',
                        desc: 'Compliance timeline & CSV/JSON export',
                        icon: FileSpreadsheet,
                        color: 'text-cyan-400 bg-cyan-500/10'
                      }
                    ].map(mod => {
                      const Icon = mod.icon;
                      const isSelected = activeTab === mod.id;
                      return (
                        <button
                          key={mod.id}
                          onClick={() => {
                            setActiveTab(mod.id);
                            setShowModulesMenu(false);
                          }}
                          className={`w-full text-left p-2.5 rounded-xl text-xs flex items-start space-x-3 transition-colors ${
                            isSelected
                              ? 'bg-blue-600/20 border border-blue-500/30'
                              : 'hover:bg-slate-800/70'
                          }`}
                        >
                          <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${mod.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className={`font-bold ${isSelected ? 'text-blue-300' : 'text-slate-200'}`}>
                              {mod.title}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">{mod.desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

          </nav>

          {/* 3. Right Actions with Generous Spacing */}
          <div className="flex items-center space-x-4">
            
            {/* Primary Action Button */}
            <button
              onClick={onOpenNewExpense}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white text-xs font-bold shadow-lg shadow-blue-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Submit Expense</span>
            </button>

            {/* Day / Night Mode Toggle */}
            <button
              onClick={() => setTheme && setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                theme === 'light' 
                  ? 'bg-amber-500/10 text-amber-600 border-amber-500/30 hover:bg-amber-500/20' 
                  : 'bg-slate-850 text-slate-300 border-slate-700/80 hover:text-white hover:bg-slate-800'
              }`}
              title={`Switch to ${theme === 'dark' ? 'Day (Light)' : 'Night (Dark)'} Mode`}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden xl:inline">Day</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-500" />
                  <span className="hidden xl:inline font-bold">Night</span>
                </>
              )}
            </button>

            {/* Color Accent Themes Dropdown */}
            <div className="relative nav-dropdown-container">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPaletteMenu(!showPaletteMenu);
                  setShowAlertsMenu(false);
                  setShowPersonaMenu(false);
                  setShowModulesMenu(false);
                }}
                className="p-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700/80 transition-colors flex items-center space-x-1.5 cursor-pointer text-xs"
                title="Change Color Theme Accent"
              >
                <Palette className="w-4 h-4 text-indigo-400" />
                <span className={`w-2.5 h-2.5 rounded-full ${
                  accent === 'emerald' ? 'bg-emerald-500' :
                  accent === 'violet' ? 'bg-purple-500' :
                  accent === 'amber' ? 'bg-amber-500' :
                  accent === 'rose' ? 'bg-rose-500' : 'bg-blue-500'
                }`}></span>
              </button>

              {showPaletteMenu && (
                <div className="absolute right-0 mt-3 w-56 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-3 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
                  <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2 mb-2">
                    Color Accent Themes
                  </div>
                  <div className="space-y-1">
                    {[
                      { id: 'blue', label: 'Corporate Blue', color: 'bg-blue-500' },
                      { id: 'emerald', label: 'Fintech Emerald', color: 'bg-emerald-500' },
                      { id: 'violet', label: 'Royal Violet', color: 'bg-purple-500' },
                      { id: 'amber', label: 'Sunset Amber', color: 'bg-amber-500' },
                      { id: 'rose', label: 'Crimson Rose', color: 'bg-rose-500' },
                    ].map(pal => (
                      <button
                        key={pal.id}
                        onClick={() => {
                          setAccent && setAccent(pal.id);
                          setShowPaletteMenu(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-colors ${
                          accent === pal.id 
                            ? 'bg-blue-600/20 border border-blue-500/40 text-blue-400 font-bold' 
                            : 'hover:bg-slate-800/60 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className={`w-3.5 h-3.5 rounded-full ${pal.color} shadow-sm shrink-0`}></span>
                          <span>{pal.label}</span>
                        </div>
                        {accent === pal.id && <span className="text-[10px] text-blue-400 font-semibold">Active</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Vertical Divider */}
            <div className="h-7 w-px bg-slate-800"></div>

            {/* Budget Alert Bell Dropdown */}
            <div className="relative nav-dropdown-container">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAlertsMenu(!showAlertsMenu);
                  setShowPersonaMenu(false);
                  setShowModulesMenu(false);
                }}
                className="relative p-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800 transition-colors"
                title="Budget Alerts"
              >
                <Bell className="w-5 h-5" />
                {alerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-slate-900 animate-pulse">
                    {alerts.length}
                  </span>
                )}
              </button>

              {showAlertsMenu && (
                <div className="absolute right-0 mt-3 w-88 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-4 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">Budget Threshold Alerts</span>
                      <span className="text-[10px] text-slate-500 font-medium">Click any alert to inspect department</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20 whitespace-nowrap">
                        {criticalCount} Critical • {warningCount} Warning
                      </span>
                      <button
                        onClick={() => setShowAlertsMenu(false)}
                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Close alerts menu"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-3 max-h-72 overflow-y-auto space-y-2.5">
                    {alerts.length === 0 ? (
                      <p className="text-xs text-slate-500 py-4 text-center">No active budget alerts</p>
                    ) : (
                      alerts.slice(0, 5).map(alert => (
                        <div 
                          key={alert.alertId}
                          onClick={() => {
                            setActiveTab('budgets');
                            setShowAlertsMenu(false);
                          }}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition-all hover:scale-[1.01] hover:brightness-110 ${
                            alert.severity === 'CRITICAL'
                              ? 'bg-rose-950/30 border-rose-800/40 text-rose-200 hover:border-rose-600/60'
                              : 'bg-amber-950/30 border-amber-800/40 text-amber-200 hover:border-amber-600/60'
                          }`}
                          title="Click to view department budget"
                        >
                          <div className="flex items-center justify-between font-bold">
                            <div className="flex items-center space-x-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                              <span>{alert.title}</span>
                            </div>
                            <span className="text-[10px] text-blue-400 font-normal underline">View →</span>
                          </div>
                          <p className="mt-1 text-[11px] text-slate-300 leading-relaxed">{alert.message}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800 text-center">
                    <button
                      onClick={() => {
                        setActiveTab('budgets');
                        setShowAlertsMenu(false);
                      }}
                      className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
                    >
                      View All Department Budgets →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Persona Switcher & Log Out Container */}
            <div className="relative nav-dropdown-container flex items-center space-x-2">
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPersonaMenu(!showPersonaMenu);
                  setShowAlertsMenu(false);
                  setShowModulesMenu(false);
                }}
                className="flex items-center space-x-2.5 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-200 transition-colors"
              >
                <span className="text-lg">{currentPersona.avatar}</span>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold leading-tight text-white">{currentPersona.name}</div>
                  <div className="text-[10px] text-slate-400 leading-tight">{currentPersona.role}</div>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${showPersonaMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Direct Logout Button */}
              <button
                onClick={onLogout}
                className="p-2.5 rounded-xl bg-slate-850 hover:bg-rose-950/50 hover:text-rose-400 text-slate-400 border border-slate-700/80 transition-colors"
                title="Switch Account / Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>

              {showPersonaMenu && (
                <div className="absolute right-0 top-12 mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-3 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
                  <div className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    Switch Demo Role
                  </div>
                  
                  <div className="mt-2 space-y-1.5">
                    {personas.map(p => {
                      const isSelected = currentPersona.employeeId === p.employeeId;
                      return (
                        <button
                          key={p.employeeId}
                          onClick={() => {
                            setPersona(p);
                            setShowPersonaMenu(false);
                          }}
                          className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center space-x-3 transition-colors ${
                            isSelected
                              ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30 font-bold'
                              : 'text-slate-300 hover:bg-slate-800/70'
                          }`}
                        >
                          <span className="text-xl">{p.avatar}</span>
                          <div>
                            <div className="font-semibold text-white">{p.name}</div>
                            <div className="text-[10px] text-slate-400">{p.role} ({p.departmentName})</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2 mt-2 border-t border-slate-800">
                    <button
                      onClick={() => {
                        setShowPersonaMenu(false);
                        if (onLogout) onLogout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-950/40 flex items-center space-x-2 transition-colors font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out to Login Screen</span>
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
