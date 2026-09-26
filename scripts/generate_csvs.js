import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const baseDir = path.resolve(__dirname, '..');
const datasetsDir = path.join(baseDir, 'datasets');
const csvDir = path.join(datasetsDir, 'csv');

if (!fs.existsSync(csvDir)) {
  fs.mkdirSync(csvDir, { recursive: true });
}

function escapeCsvValue(val) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'object') {
    val = JSON.stringify(val);
  }
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function jsonToCsv(items, customHeaders = null) {
  if (!items || items.length === 0) return '';
  
  let headers = customHeaders;
  if (!headers) {
    const headerSet = new Set();
    items.forEach(item => {
      Object.keys(item).forEach(key => headerSet.add(key));
    });
    headers = Array.from(headerSet);
  }

  const csvRows = [];
  csvRows.push(headers.join(','));

  for (const item of items) {
    const row = headers.map(header => escapeCsvValue(item[header]));
    csvRows.push(row.join(','));
  }

  return csvRows.join('\n');
}

// 1. Departments
const departments = JSON.parse(fs.readFileSync(path.join(datasetsDir, 'departments.json'), 'utf8'));
fs.writeFileSync(path.join(csvDir, 'departments.csv'), jsonToCsv(departments), 'utf8');

// 2. Employees / Users
const employees = JSON.parse(fs.readFileSync(path.join(datasetsDir, 'employees.json'), 'utf8'));
fs.writeFileSync(path.join(csvDir, 'employees.csv'), jsonToCsv(employees), 'utf8');
// Also maintain users.json/users.csv alias for backwards compatibility
fs.writeFileSync(path.join(datasetsDir, 'users.json'), JSON.stringify(employees, null, 2), 'utf8');
fs.writeFileSync(path.join(csvDir, 'users.csv'), jsonToCsv(employees), 'utf8');

// 3. Budgets (Monthly)
const budgets = JSON.parse(fs.readFileSync(path.join(datasetsDir, 'budgets.json'), 'utf8'));
fs.writeFileSync(path.join(csvDir, 'budgets.csv'), jsonToCsv(budgets), 'utf8');

// 4. Expenses
const expenses = JSON.parse(fs.readFileSync(path.join(datasetsDir, 'expenses.json'), 'utf8'));
fs.writeFileSync(path.join(csvDir, 'expenses.csv'), jsonToCsv(expenses), 'utf8');

// 5. Approvals
const approvals = JSON.parse(fs.readFileSync(path.join(datasetsDir, 'approvals.json'), 'utf8'));
fs.writeFileSync(path.join(csvDir, 'approvals.csv'), jsonToCsv(approvals), 'utf8');

// 6. Generate Categories from expenses
const categoryNames = Array.from(new Set(expenses.map(e => e.category))).sort();
const categories = categoryNames.map((cat, idx) => ({
  categoryId: `CAT${String(idx + 1).padStart(3, '0')}`,
  name: cat,
  code: cat.toUpperCase().replace(/\s+/g, '_'),
  currency: 'INR'
}));
fs.writeFileSync(path.join(datasetsDir, 'expense_categories.json'), JSON.stringify(categories, null, 2), 'utf8');
fs.writeFileSync(path.join(csvDir, 'expense_categories.csv'), jsonToCsv(categories), 'utf8');

// 7. Budget Alerts & Anomaly Highlights (computed from critical budgets and rejected/flagged expenses)
const criticalBudgets = budgets.filter(b => b.budgetStatus === 'Critical' || b.budgetStatus === 'Warning');
const alerts = criticalBudgets.slice(0, 10).map((b, idx) => ({
  alertId: `ALT${String(idx + 1).padStart(3, '0')}`,
  departmentId: b.departmentId,
  severity: b.budgetStatus === 'Critical' ? 'CRITICAL' : 'WARNING',
  month: b.month,
  title: `Department ${b.departmentId} ${b.budgetStatus} Budget Alert (${b.month})`,
  message: `Spend reached ${b.utilizationPercentage}% of monthly allocated budget. Spent: ${b.spentAmount}, Remaining: ${b.remainingBudget}`,
  utilizationPercentage: b.utilizationPercentage
}));
fs.writeFileSync(path.join(datasetsDir, 'budget_alerts.json'), JSON.stringify(alerts, null, 2), 'utf8');
fs.writeFileSync(path.join(csvDir, 'budget_alerts.csv'), jsonToCsv(alerts), 'utf8');

// 8. Consolidated Master seed_data.json
const seedData = {
  version: "2.0.0",
  exportedAt: new Date().toISOString(),
  departments,
  employees,
  budgets,
  expenses,
  approvals,
  expense_categories: categories,
  budget_alerts: alerts
};
fs.writeFileSync(path.join(datasetsDir, 'seed_data.json'), JSON.stringify(seedData, null, 2), 'utf8');

console.log('✅ Generated All CSV and JSON datasets:');
console.log(` - Departments:         ${departments.length} records (JSON & CSV)`);
console.log(` - Employees/Users:     ${employees.length} records (JSON & CSV)`);
console.log(` - Monthly Budgets:     ${budgets.length} records (JSON & CSV)`);
console.log(` - Expenses:            ${expenses.length} records (JSON & CSV)`);
console.log(` - Approvals:           ${approvals.length} records (JSON & CSV)`);
console.log(` - Expense Categories:  ${categories.length} records (JSON & CSV)`);
console.log(` - Budget Alerts:       ${alerts.length} records (JSON & CSV)`);
console.log(` - Master seed file:    datasets/seed_data.json`);
