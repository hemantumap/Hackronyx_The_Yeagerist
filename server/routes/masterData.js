import express from 'express';
import { dataService } from '../services/dataService.js';

const router = express.Router();

router.get('/departments', (req, res) => {
  res.json({ success: true, count: dataService.departments.length, data: dataService.departments });
});

router.get('/employees', (req, res) => {
  const { departmentId, role } = req.query;
  let list = [...dataService.employees];
  if (departmentId) list = list.filter(e => e.departmentId === departmentId);
  if (role) list = list.filter(e => e.role && e.role.toLowerCase().includes(role.toLowerCase()));
  res.json({ success: true, count: list.length, data: list });
});

router.get('/categories', (req, res) => {
  res.json({ success: true, count: dataService.categories.length, data: dataService.categories });
});

export default router;
