import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  HelpCircle, 
  ShieldCheck, 
  Clock, 
  Receipt, 
  ChevronRight, 
  DollarSign, 
  CheckCircle2, 
  AlertTriangle,
  BookOpen
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export default function PolicyDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [checkAmount, setCheckAmount] = useState('');
  const [selectedFaq, setSelectedFaq] = useState(null);

  const getTierForAmount = (val) => {
    const num = Number(val || 0);
    if (num <= 0) return null;
    if (num <= 5000) {
      return {
        tier: 'Tier 1: Micro-Expense',
        rule: 'Auto-approved instantly by AI (0h SLA) if receipt attached.',
        approvers: 'AI Auto-Approver',
        color: 'text-emerald-400'
      };
    }
    if (num <= 25000) {
      return {
        tier: 'Tier 2: Manager Review',
        rule: 'Direct Department Head approval required within 24 hours.',
        approvers: 'Department Head',
        color: 'text-blue-400'
      };
    }
    if (num <= 50000) {
      return {
        tier: 'Tier 3: Dual Sign-off',
        rule: 'Department Head + Finance Auditor sign-off within 48 hours.',
        approvers: 'Dept Head + Finance Manager',
        color: 'text-amber-400'
      };
    }
    return {
      tier: 'Tier 4: Executive Sign-off',
      rule: 'High-value expenditure. Contract mandatory. Auto-escalated to CFO.',
      approvers: 'Dept Head + Finance + CFO',
      color: 'text-rose-400'
    };
  };

  const calculatedTier = checkAmount ? getTierForAmount(checkAmount) : null;

  const faqs = [
    {
      q: 'Can I expense meals without an attached receipt?',
      a: 'Corporate policy mandates itemized digital tax receipts for all meal and entertainment claims above ₹1,000. Missing receipts over ₹2,500 are automatically flagged by AI as compliance violations.'
    },
    {
      q: 'How does soft budget encumbrance work?',
      a: 'When an employee submits a claim, the exact amount is immediately placed in "Reserved / Soft Hold" on the department budget. This prevents managers from overspending on the unapproved pipeline.'
    },
    {
      q: 'What is the standard SLA for expense approval?',
      a: 'Micro-expenses are instant (0h). Manager reviews have a 24-hour SLA. Dual Finance sign-offs have a 48-hour SLA. Claims pending past 48 hours are automatically flagged as Escalations.'
    },
    {
      q: 'How does a new employee get an account?',
      a: 'New joiners click "Request New Account" on the login screen. The request is routed to their Department Head, who must approve and activate the account before the employee can log in.'
    }
  ];

  return (
    <>
      {/* Floating Assistant Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-40 px-4 py-2.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 shadow-2xl backdrop-blur-md flex items-center space-x-2 text-xs font-bold transition-all hover:scale-105 active:scale-95 group ring-1 ring-blue-500/20"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        <Sparkles className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform" />
        <span>Policy Guide & AI Rules</span>
      </button>

      {/* Side Drawer Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in-50">
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-6 overflow-y-auto space-y-6 shadow-2xl flex flex-col justify-between">
            
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">SmartSpend Policy Assistant</h2>
                    <p className="text-xs text-slate-400">Enterprise rules, SLAs, and approval tiers</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Instant Tier Checker */}
              <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 space-y-3">
                <span className="font-bold text-white text-xs flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  Instant Approval Tier Calculator
                </span>
                <p className="text-[11px] text-slate-400">
                  Enter an expense amount to see which approval tier, SLA, and sign-offs will be required:
                </p>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    value={checkAmount}
                    onChange={(e) => setCheckAmount(e.target.value)}
                    placeholder="Enter amount (e.g. 15000)"
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {calculatedTier && (
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-700/80 space-y-1 text-xs animate-in fade-in-50">
                    <div className={`font-bold ${calculatedTier.color}`}>{calculatedTier.tier}</div>
                    <p className="text-[11px] text-slate-300">{calculatedTier.rule}</p>
                    <div className="text-[10px] text-slate-400 font-mono pt-1">
                      Required Sign-off: <strong className="text-white">{calculatedTier.approvers}</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Policy Quick Cheat-Sheet */}
              <div className="space-y-2 text-xs">
                <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                  Approval Tiers Cheat Sheet
                </span>

                <div className="space-y-2">
                  <div className="p-2.5 rounded-lg bg-slate-850/60 border border-slate-800">
                    <div className="flex justify-between font-semibold text-emerald-400">
                      <span>Tier 1: Up to ₹5,000</span>
                      <span className="text-slate-400 text-[10px]">Instant (0h)</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">AI Auto-Approval with receipt.</p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-850/60 border border-slate-800">
                    <div className="flex justify-between font-semibold text-blue-400">
                      <span>Tier 2: ₹5,001 — ₹25,000</span>
                      <span className="text-slate-400 text-[10px]">24h SLA</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">Department Head review & justification.</p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-850/60 border border-slate-800">
                    <div className="flex justify-between font-semibold text-amber-400">
                      <span>Tier 3: ₹25,001 — ₹50,000</span>
                      <span className="text-slate-400 text-[10px]">48h SLA</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">Dual sign-off: Dept Head + Finance Manager.</p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-850/60 border border-slate-800">
                    <div className="flex justify-between font-semibold text-rose-400">
                      <span>Tier 4: Over ₹50,000</span>
                      <span className="text-slate-400 text-[10px]">72h SLA</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">Executive & CFO high-value sign-off.</p>
                  </div>
                </div>
              </div>

              {/* FAQs Accordion */}
              <div className="space-y-2 text-xs">
                <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                  Frequently Asked Questions
                </span>

                <div className="space-y-1.5">
                  {faqs.map((faq, idx) => {
                    const isSelected = selectedFaq === idx;
                    return (
                      <div key={idx} className="rounded-lg bg-slate-850 border border-slate-800 overflow-hidden">
                        <button
                          onClick={() => setSelectedFaq(isSelected ? null : idx)}
                          className="w-full text-left p-2.5 font-medium text-slate-200 hover:text-white flex items-center justify-between text-xs"
                        >
                          <span>{faq.q}</span>
                          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'rotate-90 text-blue-400' : 'text-slate-500'}`} />
                        </button>
                        {isSelected && (
                          <div className="p-2.5 pt-0 text-[11px] text-slate-400 leading-relaxed border-t border-slate-800/60 bg-slate-900/40">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Bottom Close */}
            <div className="pt-4 border-t border-slate-800 text-center">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Close Policy Assistant
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
