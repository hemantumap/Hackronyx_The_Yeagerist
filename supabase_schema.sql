-- ==============================================================================
-- Intelligent Expense Approval & Budget Monitoring System
-- Supabase PostgreSQL Schema
-- ==============================================================================

-- 1. Drop existing tables if re-creating
DROP TABLE IF EXISTS approvals CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS budget_alerts CASCADE;
DROP TABLE IF EXISTS budgets CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS expense_categories CASCADE;

-- 2. Departments Table
CREATE TABLE departments (
    "departmentId" TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    "managerId" TEXT,
    location TEXT
);

-- 3. Employees Table
CREATE TABLE employees (
    "employeeId" TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    "departmentId" TEXT REFERENCES departments("departmentId") ON DELETE SET NULL,
    role TEXT,
    "managerId" TEXT,
    location TEXT,
    "employmentStatus" TEXT DEFAULT 'Active'
);

-- Add foreign key constraint for manager in departments
ALTER TABLE departments
    ADD CONSTRAINT fk_dept_manager
    FOREIGN KEY ("managerId") REFERENCES employees("employeeId") ON DELETE SET NULL;

-- 4. Expense Categories Table
CREATE TABLE expense_categories (
    "categoryId" TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    currency TEXT DEFAULT 'INR'
);

-- 5. Monthly Budgets Table
CREATE TABLE budgets (
    "budgetId" TEXT PRIMARY KEY,
    "departmentId" TEXT REFERENCES departments("departmentId") ON DELETE CASCADE,
    "financialYear" TEXT NOT NULL,
    month TEXT NOT NULL,
    "allocatedBudget" NUMERIC(14, 2) NOT NULL,
    "spentAmount" NUMERIC(14, 2) DEFAULT 0,
    "reservedAmount" NUMERIC(14, 2) DEFAULT 0,
    "remainingBudget" NUMERIC(14, 2) NOT NULL,
    "utilizationPercentage" NUMERIC(5, 2) NOT NULL,
    "budgetStatus" TEXT NOT NULL
);

-- 6. Expenses Table
CREATE TABLE expenses (
    "expenseId" TEXT PRIMARY KEY,
    "employeeId" TEXT REFERENCES employees("employeeId") ON DELETE CASCADE,
    "departmentId" TEXT REFERENCES departments("departmentId") ON DELETE CASCADE,
    category TEXT NOT NULL,
    description TEXT,
    amount NUMERIC(14, 2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    "expenseDate" DATE NOT NULL,
    "submittedDate" DATE NOT NULL,
    status TEXT NOT NULL,
    priority TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "receiptAvailable" BOOLEAN DEFAULT false,
    vendor TEXT,
    "costCenter" TEXT
);

-- 7. Approvals Workflow Table
CREATE TABLE approvals (
    "approvalId" TEXT PRIMARY KEY,
    "expenseId" TEXT REFERENCES expenses("expenseId") ON DELETE CASCADE,
    "approverId" TEXT REFERENCES employees("employeeId") ON DELETE SET NULL,
    "approverRole" TEXT,
    status TEXT NOT NULL,
    "submittedDate" DATE NOT NULL,
    "actionDate" DATE,
    comments TEXT,
    "approvalLevel" INTEGER DEFAULT 1,
    "escalationRequired" BOOLEAN DEFAULT false
);

-- 8. Budget Alerts Table
CREATE TABLE budget_alerts (
    "alertId" TEXT PRIMARY KEY,
    "departmentId" TEXT REFERENCES departments("departmentId") ON DELETE CASCADE,
    severity TEXT NOT NULL,
    month TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    "utilizationPercentage" NUMERIC(5, 2)
);

-- ==============================================================================
-- Helpful Indexes for Fast Querying
-- ==============================================================================
CREATE INDEX idx_expenses_dept ON expenses("departmentId");
CREATE INDEX idx_expenses_emp ON expenses("employeeId");
CREATE INDEX idx_expenses_status ON expenses(status);
CREATE INDEX idx_budgets_dept_month ON budgets("departmentId", month);
CREATE INDEX idx_approvals_expense ON approvals("expenseId");
CREATE INDEX idx_approvals_status ON approvals(status);
