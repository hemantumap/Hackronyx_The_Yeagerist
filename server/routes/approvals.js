import express from 'express';
import { dataService } from '../services/dataService.js';
import { WorkflowEngine } from '../services/workflowEngine.js';

const router = express.Router();

// GET /api/approvals - List all approvals enriched with expense details
router.get('/', (req, res) => {
  try {
    const { status, approverId, escalationRequired } = req.query;
    const approvals = dataService.getApprovals({ status, approverId, escalationRequired });

    // Enrich with expense and department information for UI
    const enriched = approvals.map(app => {
      const expense = dataService.getExpenseById(app.expenseId);
      const employee = expense ? dataService.employees.find(e => e.employeeId === expense.employeeId) : null;
      const department = expense ? dataService.departments.find(d => d.departmentId === expense.departmentId) : null;
      return {
        ...app,
        expense: expense || null,
        employeeName: employee ? employee.name : 'Unknown',
        departmentName: department ? department.name : 'Unknown'
      };
    });

    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/approvals/:id/action - Approve, Reject, or Escalate
router.post('/:id/action', (req, res) => {
  try {
    const { id } = req.params;
    const { action, approverId, comments } = req.body;

    if (!action || !['APPROVE', 'REJECT', 'ESCALATE'].includes(action.toUpperCase())) {
      return res.status(400).json({
        success: false,
        error: "Action must be one of: 'APPROVE', 'REJECT', 'ESCALATE'"
      });
    }

    const result = WorkflowEngine.actionApproval(id, { action, approverId, comments });
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      message: `Approval successfully updated with action: ${action.toUpperCase()}`,
      data: result
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/approvals/batch-action - Perform batch approvals
router.post('/batch-action', (req, res) => {
  try {
    const { approvalIds, action, approverId, comments } = req.body;
    if (!Array.isArray(approvalIds) || approvalIds.length === 0) {
      return res.status(400).json({ success: false, error: 'approvalIds must be a non-empty array' });
    }

    const results = [];
    approvalIds.forEach(id => {
      const r = WorkflowEngine.actionApproval(id, { action, approverId, comments });
      results.push({ id, ...r });
    });

    res.json({
      success: true,
      message: `Processed ${results.length} batch actions.`,
      data: results
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
