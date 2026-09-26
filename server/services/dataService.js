import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getDatasetsDir() {
  const dir1 = path.resolve(__dirname, '../../datasets');
  if (fs.existsSync(dir1)) return dir1;
  const dir2 = path.resolve(process.cwd(), 'datasets');
  if (fs.existsSync(dir2)) return dir2;
  return dir1;
}

// In-Memory Data Store (strictly conforming to supabase_schema.sql without altering DB schema)
class DataService {
  constructor() {
    this.departments = [];
    this.employees = [];
    this.categories = [];
    this.budgets = [];
    this.expenses = [];
    this.approvals = [];
    this.alerts = [];
    this.policies = null;
    this.auditLogs = [];
    this.accountRequests = [
      {
        requestId: 'REQ001',
        name: 'Rohan Deshmukh',
        email: 'rohan.deshmukh@enterprise.com',
        departmentId: 'DEPT001',
        departmentName: 'Engineering',
        role: 'Full Stack Engineer',
        reason: 'Joined frontend platform team, requires access for expense claims and travel per-diem.',
        managerId: 'EMP015',
        status: 'Pending Approval',
        requestedDate: '2026-09-25'
      },
      {
        requestId: 'REQ002',
        name: 'Ananya Sen',
        email: 'ananya.sen@enterprise.com',
        departmentId: 'DEPT001',
        departmentName: 'Engineering',
        role: 'DevOps & Cloud Specialist',
        reason: 'Cloud infrastructure billing access and software tool reimbursement authorization.',
        managerId: 'EMP015',
        status: 'Pending Approval',
        requestedDate: '2026-09-26'
      }
    ];
    this.initialized = false;
  }

  loadDataset(filename) {
    const baseDir = getDatasetsDir();
    const filePath = path.join(baseDir, filename);
    if (fs.existsSync(filePath)) {
      try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(raw);
      } catch (err) {
        console.error(`Error loading dataset ${filename}:`, err.message);
        return [];
      }
    }
    return [];
  }

  init() {
    if (this.initialized) return;

    this.departments = this.loadDataset('departments.json');
    this.employees = this.loadDataset('employees.json');
    this.categories = this.loadDataset('expense_categories.json');
    this.budgets = this.loadDataset('budgets.json');
    this.expenses = this.loadDataset('expenses.json');
    this.approvals = this.loadDataset('approvals.json');
    this.alerts = this.loadDataset('budget_alerts.json');
    this.policies = this.loadDataset('approval_policies.json');
    this.auditLogs = this.loadDataset('audit_logs.json') || [];

    // Ensure audit logs array exists
    if (!Array.isArray(this.auditLogs)) {
      this.auditLogs = [];
    }

    console.log(`✅ DataService initialized with:
      - ${this.departments.length} Departments
      - ${this.employees.length} Employees
      - ${this.categories.length} Categories
      - ${this.budgets.length} Budgets
      - ${this.expenses.length} Expenses
      - ${this.approvals.length} Approvals
      - ${this.alerts.length} Budget Alerts`);

    this.initialized = true;
  }

  // --- Expenses Methods ---
  getExpenses(filters = {}) {
    let list = [...this.expenses];
    if (filters.departmentId) {
      list = list.filter(e => e.departmentId === filters.departmentId);
    }
    if (filters.status) {
      list = list.filter(e => e.status.toLowerCase() === filters.status.toLowerCase());
    }
    if (filters.priority) {
      list = list.filter(e => e.priority.toLowerCase() === filters.priority.toLowerCase());
    }
    if (filters.employeeId) {
      list = list.filter(e => e.employeeId === filters.employeeId);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(e =>
        e.expenseId.toLowerCase().includes(q) ||
        (e.description && e.description.toLowerCase().includes(q)) ||
        (e.vendor && e.vendor.toLowerCase().includes(q)) ||
        e.category.toLowerCase().includes(q)
      );
    }
    return list;
  }

  getExpenseById(expenseId) {
    return this.expenses.find(e => e.expenseId === expenseId);
  }

  addExpense(expenseData) {
    this.expenses.unshift(expenseData);
    return expenseData;
  }

  updateExpense(expenseId, updates) {
    const idx = this.expenses.findIndex(e => e.expenseId === expenseId);
    if (idx !== -1) {
      this.expenses[idx] = { ...this.expenses[idx], ...updates };
      return this.expenses[idx];
    }
    return null;
  }

  // --- Budgets Methods ---
  getBudgets(filters = {}) {
    let list = [...this.budgets];
    if (filters.departmentId) {
      list = list.filter(b => b.departmentId === filters.departmentId);
    }
    if (filters.month) {
      list = list.filter(b => b.month === filters.month);
    }
    if (filters.financialYear) {
      list = list.filter(b => b.financialYear === filters.financialYear);
    }
    return list;
  }

  getBudget(departmentId, month) {
    return this.budgets.find(b => b.departmentId === departmentId && b.month === month);
  }

  updateBudget(budgetId, updates) {
    const idx = this.budgets.findIndex(b => b.budgetId === budgetId);
    if (idx !== -1) {
      this.budgets[idx] = { ...this.budgets[idx], ...updates };
      return this.budgets[idx];
    }
    return null;
  }

  // --- Approvals Methods ---
  getApprovals(filters = {}) {
    let list = [...this.approvals];
    if (filters.status) {
      list = list.filter(a => a.status.toLowerCase() === filters.status.toLowerCase());
    }
    if (filters.approverId) {
      list = list.filter(a => a.approverId === filters.approverId);
    }
    if (filters.escalationRequired !== undefined) {
      list = list.filter(a => a.escalationRequired === (filters.escalationRequired === 'true' || filters.escalationRequired === true));
    }
    return list;
  }

  getApprovalByExpenseId(expenseId) {
    return this.approvals.find(a => a.expenseId === expenseId);
  }

  addApproval(approvalData) {
    this.approvals.unshift(approvalData);
    return approvalData;
  }

  updateApproval(approvalId, updates) {
    const idx = this.approvals.findIndex(a => a.approvalId === approvalId);
    if (idx !== -1) {
      this.approvals[idx] = { ...this.approvals[idx], ...updates };
      return this.approvals[idx];
    }
    return null;
  }

  // --- Alerts Methods ---
  getAlerts(filters = {}) {
    let list = [...this.alerts];
    if (filters.departmentId) {
      list = list.filter(a => a.departmentId === filters.departmentId);
    }
    if (filters.severity) {
      list = list.filter(a => a.severity.toUpperCase() === filters.severity.toUpperCase());
    }
    return list;
  }

  addAlert(alertData) {
    this.alerts.unshift(alertData);
    return alertData;
  }

  // --- Audit Logs ---
  addAuditLog(entry) {
    const log = {
      logId: `LOG${String(this.auditLogs.length + 1).padStart(4, '0')}`,
      timestamp: new Date().toISOString(),
      ...entry
    };
    this.auditLogs.unshift(log);
    return log;
  }

  getAuditLogs(limit = 100) {
    return this.auditLogs.slice(0, limit);
  }

  // --- Account Requests Methods (Head Approval Required) ---
  getAccountRequests(filters = {}) {
    let list = [...this.accountRequests];
    if (filters.departmentId) {
      list = list.filter(r => r.departmentId === filters.departmentId);
    }
    if (filters.managerId) {
      list = list.filter(r => r.managerId === filters.managerId);
    }
    if (filters.status) {
      list = list.filter(r => r.status.toLowerCase() === filters.status.toLowerCase());
    }
    return list;
  }

  addAccountRequest({ name, email, departmentId, role, reason }) {
    const dept = this.departments.find(d => d.departmentId === departmentId);
    const reqId = `REQ${String(this.accountRequests.length + 1).padStart(3, '0')}`;
    const newRequest = {
      requestId: reqId,
      name,
      email,
      departmentId,
      departmentName: dept ? dept.name : 'General',
      role: role || 'Associate Specialist',
      reason: reason || 'New employee onboarding to department expense & travel reimbursement system.',
      managerId: dept?.managerId || 'EMP015',
      status: 'Pending Approval',
      requestedDate: new Date().toISOString().split('T')[0]
    };
    this.accountRequests.unshift(newRequest);

    this.addAuditLog({
      action: 'ACCOUNT_REQUESTED',
      actorId: email,
      actorRole: 'APPLICANT',
      details: `New account request ${reqId} submitted for ${name} (${departmentId}). Requires Department Head approval.`
    });

    return newRequest;
  }

  actionAccountRequest(requestId, { action, approverId, comments }) {
    const req = this.accountRequests.find(r => r.requestId === requestId);
    if (!req) {
      return { success: false, error: 'Account request not found' };
    }

    const today = new Date().toISOString().split('T')[0];

    if (action.toUpperCase() === 'APPROVE') {
      req.status = 'Approved';
      req.actionDate = today;
      req.approvedBy = approverId;
      req.comments = comments || 'Approved by Department Head. User account activated.';

      // Generate new official employee record matching existing schema
      const newEmployeeId = `EMP${String(this.employees.length + 1).padStart(3, '0')}`;
      const newEmployee = {
        employeeId: newEmployeeId,
        name: req.name,
        email: req.email,
        departmentId: req.departmentId,
        role: req.role,
        managerId: req.managerId,
        location: 'Bangalore',
        employmentStatus: 'Active'
      };
      this.employees.push(newEmployee);
      req.createdEmployeeId = newEmployeeId;

      this.addAuditLog({
        action: 'ACCOUNT_APPROVED',
        actorId: approverId,
        actorRole: 'DEPARTMENT_HEAD',
        details: `Department Head approved account request ${requestId}. Official employee account created: ${req.name} (${newEmployeeId}).`
      });

      return {
        success: true,
        message: `Account for ${req.name} has been approved and activated!`,
        employee: newEmployee,
        request: req
      };
    } else if (action.toUpperCase() === 'REJECT') {
      req.status = 'Rejected';
      req.actionDate = today;
      req.approvedBy = approverId;
      req.comments = comments || 'Account request declined by Department Head.';

      this.addAuditLog({
        action: 'ACCOUNT_REJECTED',
        actorId: approverId,
        actorRole: 'DEPARTMENT_HEAD',
        details: `Department Head declined account request ${requestId} for ${req.name}. Reason: ${req.comments}`
      });

      return {
        success: true,
        message: `Account request ${requestId} has been rejected.`,
        request: req
      };
    }

    return { success: false, error: 'Invalid action. Must be APPROVE or REJECT.' };
  }
}

export const dataService = new DataService();
dataService.init();
