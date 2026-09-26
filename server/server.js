import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import expensesRouter from './routes/expenses.js';
import budgetsRouter from './routes/budgets.js';
import approvalsRouter from './routes/approvals.js';
import anomaliesRouter from './routes/anomalies.js';
import masterDataRouter from './routes/masterData.js';
import auditLogsRouter from './routes/auditLogs.js';
import accountRequestsRouter from './routes/accountRequests.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logger for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Intelligent Expense Approval & Budget Monitoring System API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/expenses', expensesRouter);
app.use('/api/budgets', budgetsRouter);
app.use('/api/approvals', approvalsRouter);
app.use('/api/anomalies', anomaliesRouter);
app.use('/api/master', masterDataRouter);
app.use('/api/audit-logs', auditLogsRouter);
app.use('/api/account-requests', accountRequestsRouter);

// Serve static client assets if built
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.url.startsWith('/api')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
}

// 404 handler for API routes
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.url} not found` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
});

// Start Server if run directly
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Expense & Budget Server running on http://localhost:${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  });
}

export default app;
