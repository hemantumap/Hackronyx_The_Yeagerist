import express from 'express';
import { AnomalyEngine } from '../services/anomalyEngine.js';
import { dataService } from '../services/dataService.js';

const router = express.Router();

// GET /api/anomalies - AI Anomaly & Fraud scan
router.get('/', (req, res) => {
  try {
    const anomalies = AnomalyEngine.scanAll();
    res.json({
      success: true,
      count: anomalies.length,
      data: anomalies
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/anomalies/policies - Active organizational policies & thresholds
router.get('/policies', (req, res) => {
  try {
    res.json({
      success: true,
      data: dataService.policies || {}
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
