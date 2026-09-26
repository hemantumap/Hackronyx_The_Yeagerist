import express from 'express';
import { dataService } from '../services/dataService.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 100;
    const logs = dataService.getAuditLogs(limit);
    res.json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
