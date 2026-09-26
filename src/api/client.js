const BASE_URL = '/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `HTTP error ${res.status}`);
    }
    return data;
  } catch (err) {
    console.error(`API Request Error [${endpoint}]:`, err.message);
    throw err;
  }
}

export const api = {
  // Budgets
  getBudgetSummary: () => request('/budgets/summary'),
  getBudgets: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/budgets${qs ? `?${qs}` : ''}`);
  },
  getDepartmentBudgets: (deptId) => request(`/budgets/${deptId}`),
  getAlerts: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/budgets/alerts${qs ? `?${qs}` : ''}`);
  },

  // Expenses
  getExpenses: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/expenses${qs ? `?${qs}` : ''}`);
  },
  getExpenseById: (id) => request(`/expenses/${id}`),
  submitExpense: (expenseData) => request('/expenses', {
    method: 'POST',
    body: JSON.stringify(expenseData)
  }),

  // Approvals
  getApprovals: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/approvals${qs ? `?${qs}` : ''}`);
  },
  actionApproval: (id, { action, approverId, comments }) => request(`/approvals/${id}/action`, {
    method: 'POST',
    body: JSON.stringify({ action, approverId, comments })
  }),
  batchActionApprovals: ({ approvalIds, action, approverId, comments }) => request('/approvals/batch-action', {
    method: 'POST',
    body: JSON.stringify({ approvalIds, action, approverId, comments })
  }),

  // Anomalies & Policies
  getAnomalies: () => request('/anomalies'),
  getPolicies: () => request('/anomalies/policies'),

  // Master Data
  getDepartments: () => request('/master/departments'),
  getEmployees: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/master/employees${qs ? `?${qs}` : ''}`);
  },
  getCategories: () => request('/master/categories'),

  // Audit Logs
  getAuditLogs: (limit = 100) => request(`/audit-logs?limit=${limit}`),

  // Account Requests (Head Approval Workflow)
  getAccountRequests: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/account-requests${qs ? `?${qs}` : ''}`);
  },
  submitAccountRequest: (data) => request('/account-requests', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  actionAccountRequest: (id, { action, approverId, comments }) => request(`/account-requests/${id}/action`, {
    method: 'POST',
    body: JSON.stringify({ action, approverId, comments })
  })
};
