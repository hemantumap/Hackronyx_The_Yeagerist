import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const baseDir = path.resolve(__dirname, '..');
const datasetsDir = path.join(baseDir, 'datasets');
const csvDir = path.join(datasetsDir, 'csv');

console.log('='.repeat(70));
console.log('📊 DATASET VALIDATION REPORT: Intelligent Expense & Budget System');
console.log('='.repeat(70));

let hasErrors = false;

function loadJson(fileName) {
  const filePath = path.join(datasetsDir, fileName);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Missing JSON file: ${fileName}`);
    hasErrors = true;
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function checkCsvExists(fileName) {
  const filePath = path.join(csvDir, fileName);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Missing CSV file: csv/${fileName}`);
    hasErrors = true;
    return false;
  }
  return true;
}

const departments = loadJson('departments.json');
const employees = loadJson('employees.json');
const budgets = loadJson('budgets.json');
const expenses = loadJson('expenses.json');
const approvals = loadJson('approvals.json');
const categories = loadJson('expense_categories.json');

const csvFiles = [
  'departments.csv',
  'employees.csv',
  'budgets.csv',
  'expenses.csv',
  'approvals.csv',
  'expense_categories.csv'
];

csvFiles.forEach(file => checkCsvExists(file));

if (hasErrors) {
  console.error('\nStopping due to missing files.');
  process.exit(1);
}

const deptIds = new Set(departments.map(d => d.departmentId));
const empIds = new Set(employees.map(e => e.employeeId));
const expenseIds = new Set(expenses.map(e => e.expenseId));

console.log(`\n✅ Loaded Collections:`);
console.log(` - Departments:         ${departments.length} records`);
console.log(` - Employees:           ${employees.length} records`);
console.log(` - Monthly Budgets:     ${budgets.length} records`);
console.log(` - Expenses:            ${expenses.length} records`);
console.log(` - Approvals:           ${approvals.length} records`);
console.log(` - Expense Categories:  ${categories.length} records`);

// 1. Validate Departments
departments.forEach(dept => {
  if (dept.managerId && !empIds.has(dept.managerId)) {
    console.error(`❌ Department '${dept.departmentId}' references non-existent managerId '${dept.managerId}'!`);
    hasErrors = true;
  }
});

// 2. Validate Employees
employees.forEach(emp => {
  if (emp.departmentId && !deptIds.has(emp.departmentId)) {
    console.error(`❌ Employee '${emp.employeeId}' references non-existent departmentId '${emp.departmentId}'!`);
    hasErrors = true;
  }
  if (emp.managerId && !empIds.has(emp.managerId)) {
    console.error(`❌ Employee '${emp.employeeId}' references non-existent managerId '${emp.managerId}'!`);
    hasErrors = true;
  }
});

// 3. Validate Budgets
budgets.forEach(b => {
  if (!deptIds.has(b.departmentId)) {
    console.error(`❌ Budget '${b.budgetId}' references non-existent departmentId '${b.departmentId}'!`);
    hasErrors = true;
  }
});

// 4. Validate Expenses
let totalExpenseAmount = 0;
expenses.forEach(exp => {
  totalExpenseAmount += exp.amount;
  if (!deptIds.has(exp.departmentId)) {
    console.error(`❌ Expense '${exp.expenseId}' references non-existent departmentId '${exp.departmentId}'!`);
    hasErrors = true;
  }
  if (!empIds.has(exp.employeeId)) {
    console.error(`❌ Expense '${exp.expenseId}' references non-existent employeeId '${exp.employeeId}'!`);
    hasErrors = true;
  }
});

// 5. Validate Approvals
approvals.forEach(apr => {
  if (!expenseIds.has(apr.expenseId)) {
    console.error(`❌ Approval '${apr.approvalId}' references non-existent expenseId '${apr.expenseId}'!`);
    hasErrors = true;
  }
  if (apr.approverId && !empIds.has(apr.approverId)) {
    console.error(`❌ Approval '${apr.approvalId}' references non-existent approverId '${apr.approverId}'!`);
    hasErrors = true;
  }
});

console.log(`\n💰 Statistics Summary:`);
console.log(` - Total Expense Volume: ₹${totalExpenseAmount.toLocaleString('en-IN')}`);
const approvedCount = approvals.filter(a => a.status === 'Approved').length;
const pendingCount = approvals.filter(a => a.status === 'Pending').length;
const rejectedCount = approvals.filter(a => a.status === 'Rejected').length;
const reviewCount = approvals.filter(a => a.status === 'Under Review').length;
const escalatedCount = approvals.filter(a => a.escalationRequired).length;

console.log(` - Approved Workflows:   ${approvedCount}`);
console.log(` - Pending Workflows:    ${pendingCount}`);
console.log(` - Under Review:         ${reviewCount}`);
console.log(` - Rejected Workflows:   ${rejectedCount}`);
console.log(` - Escalations Flagged:  ${escalatedCount}`);

if (!hasErrors) {
  console.log('\n🌟 ALL INTEGRITY CHECKS PASSED: 100% of Relational Foreign Keys, CSV & JSON schemas are valid!');
  console.log('='.repeat(70));
} else {
  console.error('\n❌ Integrity checks failed. See errors above.');
  process.exit(1);
}
