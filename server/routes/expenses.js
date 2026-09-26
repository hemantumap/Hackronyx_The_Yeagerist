import express from 'express';
import { dataService } from '../services/dataService.js';
import { WorkflowEngine } from '../services/workflowEngine.js';

const router = express.Router();

// GET /api/expenses - List expenses with filters
router.get('/', (req, res) => {
  try {
    const { departmentId, status, priority, employeeId, search } = req.query;
    const expenses = dataService.getExpenses({ departmentId, status, priority, employeeId, search });
    res.json({ success: true, count: expenses.length, data: expenses });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/expenses/:id - Single expense with approval details
router.get('/:id', (req, res) => {
  try {
    const expense = dataService.getExpenseById(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, error: 'Expense not found' });
    }
    const approval = dataService.getApprovalByExpenseId(expense.expenseId);
    res.json({ success: true, data: { ...expense, approval } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/expenses - Submit a new expense
router.post('/', (req, res) => {
  try {
    const {
      employeeId,
      departmentId,
      category,
      description,
      amount,
      currency = 'INR',
      expenseDate,
      priority = 'Normal',
      paymentMethod = 'Corporate Card',
      receiptAvailable = true,
      vendor = 'Vendor',
      costCenter
    } = req.body;

    if (!employeeId || !departmentId || !amount || !expenseDate || !category) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: employeeId, departmentId, category, amount, expenseDate'
      });
    }

    const today = new Date().toISOString().split('T')[0];
    const newExpenseId = `EXP${String(dataService.expenses.length + 1).padStart(3, '0')}`;

    const newExpense = {
      expenseId: newExpenseId,
      employeeId,
      departmentId,
      category,
      description: description || 'Business expense',
      amount: Number(amount),
      currency,
      expenseDate,
      submittedDate: today,
      status: 'Pending',
      priority,
      paymentMethod,
      receiptAvailable: Boolean(receiptAvailable),
      vendor,
      costCenter: costCenter || `CC-${departmentId.replace('DEPT', '')}`
    };

    // Add to data store
    dataService.addExpense(newExpense);

    // Run workflow engine (handles soft-commitment & routing)
    const workflowResult = WorkflowEngine.processSubmission(newExpense);

    res.status(201).json({
      success: true,
      message: workflowResult.autoApproved ? 'Expense auto-approved!' : 'Expense submitted and routed for approval.',
      data: workflowResult
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
