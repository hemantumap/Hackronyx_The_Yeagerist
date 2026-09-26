import express from 'express';
import { dataService } from '../services/dataService.js';

const router = express.Router();

// GET /api/account-requests - List account onboarding requests
router.get('/', (req, res) => {
  try {
    const { departmentId, managerId, status } = req.query;
    const list = dataService.getAccountRequests({ departmentId, managerId, status });
    res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/account-requests - Register / Request a new account
router.post('/', (req, res) => {
  try {
    const { name, email, departmentId, role, reason } = req.body;

    if (!name || !email || !departmentId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required registration fields: name, email, departmentId'
      });
    }

    // Check if email already registered in employees
    const existing = dataService.employees.find(e => e.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({
        success: false,
        error: `An active account with email ${email} already exists.`
      });
    }

    const request = dataService.addAccountRequest({ name, email, departmentId, role, reason });
    res.status(201).json({
      success: true,
      message: 'Account request submitted successfully! Awaiting Department Head authorization.',
      data: request
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/account-requests/:id/action - Head Approval or Rejection
router.post('/:id/action', (req, res) => {
  try {
    const { id } = req.params;
    const { action, approverId, comments } = req.body;

    if (!action || !['APPROVE', 'REJECT'].includes(action.toUpperCase())) {
      return res.status(400).json({
        success: false,
        error: "Action must be 'APPROVE' or 'REJECT'"
      });
    }

    const result = dataService.actionAccountRequest(id, {
      action,
      approverId: approverId || 'EMP015',
      comments
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
