import express from 'express';
import { dataService } from '../services/dataService.js';
import { BudgetEngine } from '../services/budgetEngine.js';

const router = express.Router();

// GET /api/budgets/summary - High-level executive budget roll-up
router.get('/summary', (req, res) => {
  try {
    const summary = BudgetEngine.getExecutiveSummary();
    res.json({ success: true, data: summary });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/budgets/alerts - Real-time budget threshold alerts
router.get('/alerts', (req, res) => {
  try {
    const { departmentId, severity } = req.query;
    const alerts = dataService.getAlerts({ departmentId, severity });
    res.json({ success: true, count: alerts.length, data: alerts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/budgets - All department monthly budgets
router.get('/', (req, res) => {
  try {
    const { departmentId, month, financialYear } = req.query;
    const budgets = dataService.getBudgets({ departmentId, month, financialYear });
    res.json({ success: true, count: budgets.length, data: budgets });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/budgets/:departmentId - Single department budgets
router.get('/:departmentId', (req, res) => {
  try {
    const { departmentId } = req.params;
    const dept = dataService.departments.find(d => d.departmentId === departmentId);
    if (!dept) {
      return res.status(404).json({ success: false, error: 'Department not found' });
    }
    const deptBudgets = dataService.getBudgets({ departmentId });
    res.json({ success: true, department: dept, budgets: deptBudgets });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
