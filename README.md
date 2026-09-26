# Intelligent Expense Approval & Budget Monitoring System
## Integrated Datasets & Firebase / Supabase Upload Utilities

This repository contains **comprehensive, relational datasets** for building an **Intelligent Expense Approval & Budget Monitoring System**, provided in both **JSON** and **CSV** formats, along with upload and validation scripts.

> ⚠️ **Note**: As requested, **NO frontend or backend application code** has been generated. This strictly contains the data models, datasets, schema definitions, validation suites, and database integration utilities.

---

## 📁 Repository Structure

```
CodeSprint/
├── datasets/
│   ├── departments.json          # 12 Departments (Engineering, Marketing, HR, Finance, etc.)
│   ├── employees.json            # 120 Employees across departments, locations, and roles
│   ├── users.json                # Dual alias of employees for user auth models
│   ├── budgets.json              # 120 Monthly Department Budgets with spent/reserved/status
│   ├── expenses.json             # 150 Incurred Expenses with category, vendor, cost center
│   ├── approvals.json            # 150 Approval Workflows with levels, comments, escalations
│   ├── expense_categories.json   # 23 Distinct Expense Categories
│   ├── budget_alerts.json        # 10 Real-time budget threshold alerts
│   ├── seed_data.json            # Consolidated master JSON file (all-in-one export)
│   └── csv/                      # Clean tabular CSV format files
│       ├── departments.csv
│       ├── employees.csv
│       ├── users.csv
│       ├── budgets.csv
│       ├── expenses.csv
│       ├── approvals.csv
│       ├── expense_categories.csv
│       └── budget_alerts.csv
├── scripts/
│   ├── upload_to_firebase.js     # Node.js batch uploader with Timestamp parsing & dry-run
│   ├── upload_to_firebase.py     # Python batch uploader (alternative)
│   ├── validate_datasets.js      # Relational integrity and foreign key validator
│   └── generate_csvs.js          # Synchronizes CSVs and master seed_data from JSON
├── firestore.rules               # Production-ready Firestore Security Rules
├── package.json                  # npm scripts & firebase-admin dependency
├── requirements.txt              # Python dependencies
└── .env.example                  # Environment configuration template
```

---

## 📊 Dataset Catalog & Summary

| Collection / Table | Records | Format | Primary Key | Key Relations |
| :--- | :---: | :---: | :---: | :--- |
| **`departments`** | 12 | JSON + CSV | `departmentId` | `managerId` $\rightarrow$ `employees.employeeId` |
| **`employees` / `users`** | 120 | JSON + CSV | `employeeId` | `departmentId` $\rightarrow$ `departments.departmentId`, `managerId` |
| **`budgets`** | 120 | JSON + CSV | `budgetId` | `departmentId` $\rightarrow$ `departments.departmentId` (Monthly 2026-01 to 2026-10) |
| **`expenses`** | 150 | JSON + CSV | `expenseId` | `departmentId`, `employeeId` $\rightarrow$ `employees.employeeId` |
| **`approvals`** | 150 | JSON + CSV | `approvalId` | `expenseId` $\rightarrow$ `expenses.expenseId`, `approverId` $\rightarrow$ `employees.employeeId` |
| **`expense_categories`**| 23 | JSON + CSV | `categoryId` | Referenced by `expenses.category` |
| **`budget_alerts`** | 10 | JSON + CSV | `alertId` | `departmentId` $\rightarrow$ `departments.departmentId` |

---

## 💰 Dataset Key Metrics

- **Total Expense Incurred**: ₹2,05,87,696
- **Approved Expenses**: 62 workflows
- **Pending Approvals**: 54 workflows
- **Under Review**: 13 workflows
- **Rejected Expenses**: 21 workflows (with specific audit reasons: *"Receipt missing"*, *"Insufficient business justification"*, *"Expense exceeds policy limit"*)
- **Escalations Flagged**: 42 expenses requiring multi-level approval escalation

---

## 🚀 How to Upload to Firebase Firestore

### 1. Place your Service Account Key
Download your service account key from [Firebase Console](https://console.firebase.google.com/) (**Project Settings ⚙️ $\rightarrow$ Service Accounts $\rightarrow$ Generate new private key**) and save it as:
```
CodeSprint/serviceAccountKey.json
```

### 2. Run the Upload Command

**Option A (Node.js):**
```bash
# Dry-run test (verifies all 120 budgets, 150 expenses, 150 approvals, etc. without writes)
npm run upload:dry

# Live upload to Cloud Firestore
npm run upload
```

**Option B (Python):**
```bash
# Dry-run test
python scripts/upload_to_firebase.py --dry-run

# Live upload
python scripts/upload_to_firebase.py
```

---

## ⚡ Using with Supabase

If you prefer Supabase:
1. Open your Supabase Dashboard $\rightarrow$ Table Editor.
2. Drag and drop the CSV files from `datasets/csv/`:
   - `departments.csv`
   - `employees.csv`
   - `budgets.csv`
   - `expenses.csv`
   - `approvals.csv`
   - `expense_categories.csv`
3. Supabase will auto-detect columns, data types, and populate your Postgres database in seconds.

---

## 🔍 Validation Suite

To verify data integrity and foreign keys at any time:
```bash
npm run validate
```
*(Confirms that 100% of employee, department, expense, and approver references match seamlessly)*
