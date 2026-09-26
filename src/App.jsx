import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import ExpensesView from './components/ExpensesView';
import ApprovalsView from './components/ApprovalsView';
import BudgetsView from './components/BudgetsView';
import AnomalyHub from './components/AnomalyHub';
import AuditLogsView from './components/AuditLogsView';
import ExpenseModal from './components/ExpenseModal';
import LoginPage from './components/LoginPage';
import PolicyDrawer from './components/PolicyDrawer';
import { api } from './api/client';
import { Sparkles, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

const PERSONAS = [
  {
    employeeId: 'EMP007',
    name: 'Priya Sharma',
    role: 'Senior Engineer',
    departmentId: 'DEPT001',
    departmentName: 'Engineering',
    avatar: '👨‍💼'
  },
  {
    employeeId: 'EMP015',
    name: 'Amit Verma',
    role: 'Department Head',
    departmentId: 'DEPT001',
    departmentName: 'Engineering',
    avatar: '🛡️'
  },
  {
    employeeId: 'EMP060',
    name: 'Sneha Patel',
    role: 'Finance Manager',
    departmentId: 'DEPT004',
    departmentName: 'Finance',
    avatar: '⚖️'
  },
  {
    employeeId: 'EMP075',
    name: 'Rajesh Nair',
    role: 'Chief Financial Officer',
    departmentId: 'DEPT005',
    departmentName: 'Management',
    avatar: '👑'
  }
];

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('smartspend_user');
      return saved ? JSON.parse(saved) : PERSONAS[1]; // Default to Amit Verma (Dept Head)
    } catch (e) {
      return PERSONAS[1];
    }
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  // Theme & Accent State (Persisted in localStorage)
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('smartspend_theme') || 'dark';
    } catch (e) {
      return 'dark';
    }
  });

  const [accent, setAccent] = useState(() => {
    try {
      return localStorage.getItem('smartspend_accent') || 'blue';
    } catch (e) {
      return 'blue';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
    root.setAttribute('data-accent', accent);
    try {
      localStorage.setItem('smartspend_theme', theme);
      localStorage.setItem('smartspend_accent', accent);
    } catch (e) {}
  }, [theme, accent]);

  // Data State
  const [summary, setSummary] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [policies, setPolicies] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [accountRequests, setAccountRequests] = useState([]);
  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('smartspend_user', JSON.stringify(user));
    } catch (e) {}
    showToast(`Welcome, ${user.name}! Signed in as ${user.role}.`, 'success');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('smartspend_user');
    } catch (e) {}
    showToast('Signed out. Please select an account to log in.', 'info');
  };

  const handleSwitchPersona = (p) => {
    setCurrentUser(p);
    try {
      localStorage.setItem('smartspend_user', JSON.stringify(p));
    } catch (e) {}
    showToast(`Switched active role to: ${p.name} (${p.role})`, 'info');
  };

  const loadData = async () => {
    try {
      const [
        sumRes,
        expRes,
        appRes,
        budRes,
        altRes,
        anomRes,
        polRes,
        deptRes,
        catRes,
        logRes,
        reqRes
      ] = await Promise.all([
        api.getBudgetSummary(),
        api.getExpenses(),
        api.getApprovals(),
        api.getBudgets(),
        api.getAlerts(),
        api.getAnomalies(),
        api.getPolicies(),
        api.getDepartments(),
        api.getCategories(),
        api.getAuditLogs(),
        api.getAccountRequests()
      ]);

      if (sumRes.success) setSummary(sumRes.data);
      if (expRes.success) setExpenses(expRes.data);
      if (appRes.success) setApprovals(appRes.data);
      if (budRes.success) setBudgets(budRes.data);
      if (altRes.success) setAlerts(altRes.data);
      if (anomRes.success) setAnomalies(anomRes.data);
      if (polRes.success) setPolicies(polRes.data);
      if (deptRes.success) setDepartments(deptRes.data);
      if (catRes.success) setCategories(catRes.data);
      if (logRes.success) setAuditLogs(logRes.data);
      if (reqRes?.success) setAccountRequests(reqRes.data);
    } catch (err) {
      console.error('Failed to load initial system data:', err);
      showToast('Connecting to backend API...', 'info');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Action an individual approval
  const handleActionApproval = async (approvalId, action, comments = '') => {
    try {
      const res = await api.actionApproval(approvalId, {
        action,
        approverId: currentUser.employeeId,
        comments
      });
      if (res.success) {
        showToast(`Workflow updated: ${action} action confirmed.`, 'success');
        await loadData();
      }
    } catch (err) {
      showToast(err.message || 'Action failed', 'error');
    }
  };

  // Batch action approvals
  const handleBatchAction = async (approvalIds, action) => {
    try {
      const res = await api.batchActionApprovals({
        approvalIds,
        action,
        approverId: currentUser.employeeId,
        comments: `Batch approved by ${currentUser.name}`
      });
      if (res.success) {
        showToast(`Successfully processed ${approvalIds.length} approvals in bulk.`, 'success');
        await loadData();
      }
    } catch (err) {
      showToast(err.message || 'Batch action failed', 'error');
    }
  };

  // Submit expense claim
  const handleSubmitExpense = async (payload) => {
    const res = await api.submitExpense(payload);
    if (res.success) {
      showToast(res.message, 'success');
      await loadData();
      setActiveTab('expenses');
    }
    return res;
  };

  // Action employee account request (Head Approval Workflow)
  const handleActionAccountRequest = async (requestId, action, comments = '') => {
    try {
      const res = await api.actionAccountRequest(requestId, {
        action,
        approverId: currentUser.employeeId,
        comments
      });
      if (res.success) {
        showToast(res.message, 'success');
        await loadData();
      }
    } catch (err) {
      showToast(err.message || 'Action failed', 'error');
    }
  };

  // If user is not logged in, render the 1-Click Login Page
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} personas={PERSONAS} departments={departments} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Navigation */}
      <Navbar
        currentPersona={currentUser}
        setPersona={handleSwitchPersona}
        personas={PERSONAS}
        alerts={alerts}
        onOpenNewExpense={() => setIsExpenseModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        theme={theme}
        setTheme={setTheme}
        accent={accent}
        setAccent={setAccent}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Toast Notification */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5">
            <div className={`p-4 rounded-xl shadow-2xl border flex items-center space-x-3 text-xs font-semibold ${
              toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-700 text-rose-200'
                : toast.type === 'info'
                ? 'bg-blue-950/90 border-blue-700 text-blue-200'
                : 'bg-emerald-950/90 border-emerald-700 text-emerald-200'
            }`}>
              {toast.type === 'error' ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
              <span>{toast.message}</span>
            </div>
          </div>
        )}

        {/* View Switcher */}
        {activeTab === 'dashboard' && (
          <Dashboard
            summary={summary}
            alerts={alerts}
            approvals={approvals}
            expenses={expenses}
            currentPersona={currentUser}
            accountRequests={accountRequests}
            onActionAccountRequest={handleActionAccountRequest}
            onActionApproval={handleActionApproval}
            setActiveTab={setActiveTab}
            onOpenNewExpense={() => setIsExpenseModalOpen(true)}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpensesView
            expenses={expenses}
            departments={departments}
            categories={categories}
            onOpenNewExpense={() => setIsExpenseModalOpen(true)}
            onViewApproval={(expId) => {
              setActiveTab('approvals');
            }}
          />
        )}

        {activeTab === 'approvals' && (
          <ApprovalsView
            approvals={approvals}
            currentPersona={currentUser}
            onActionApproval={handleActionApproval}
            onBatchAction={handleBatchAction}
          />
        )}

        {activeTab === 'budgets' && (
          <BudgetsView
            departments={departments}
            budgets={budgets}
            alerts={alerts}
          />
        )}

        {activeTab === 'anomalies' && (
          <AnomalyHub
            anomalies={anomalies}
            policies={policies}
            onViewExpense={(id) => {
              setActiveTab('expenses');
            }}
          />
        )}

        {activeTab === 'audit' && (
          <AuditLogsView logs={auditLogs} />
        )}

      </main>

      {/* Expense Submission Modal */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        departments={departments}
        categories={categories}
        currentPersona={currentUser}
        onSubmitSuccess={handleSubmitExpense}
        budgets={budgets}
      />

      {/* Floating Policy Guide & AI Rules Drawer */}
      <PolicyDrawer />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>SmartSpend Enterprise • Intelligent Expense Approval & Budget Monitoring System</div>
          <div className="flex items-center gap-2">
            <span>Logged in as: <strong>{currentUser.name}</strong> ({currentUser.role})</span>
            <span>•</span>
            <button onClick={handleLogout} className="text-rose-400 hover:text-rose-300 font-medium underline">
              Switch Account
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
