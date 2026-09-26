import { dataService } from './dataService.js';

export class AnomalyEngine {
  /**
   * Run full anomaly and compliance scan across all expenses
   */
  static scanAll() {
    const expenses = dataService.expenses;
    const anomalies = [];

    // Map for duplicate detection
    const vendorAmountMap = new Map();

    // Calculate category averages for outlier detection
    const categoryTotals = {};
    expenses.forEach(e => {
      if (!categoryTotals[e.category]) {
        categoryTotals[e.category] = { sum: 0, count: 0 };
      }
      categoryTotals[e.category].sum += Number(e.amount || 0);
      categoryTotals[e.category].count += 1;
    });

    const categoryAverages = {};
    for (const [cat, data] of Object.entries(categoryTotals)) {
      categoryAverages[cat] = data.count > 0 ? data.sum / data.count : 0;
    }

    expenses.forEach(e => {
      const amount = Number(e.amount || 0);
      const flags = [];
      let riskScore = 0; // 0 - 100

      // 1. Missing Receipt on High Value
      if (!e.receiptAvailable && amount > 2500) {
        flags.push({
          type: 'MISSING_RECEIPT',
          severity: 'HIGH',
          message: `Expense of ₹${amount} exceeds ₹2,500 threshold with no receipt attached.`
        });
        riskScore += 40;
      } else if (!e.receiptAvailable && amount > 1000) {
        flags.push({
          type: 'MISSING_RECEIPT',
          severity: 'MEDIUM',
          message: `Expense of ₹${amount} has no receipt attached.`
        });
        riskScore += 20;
      }

      // 2. Duplicate Detection
      const dupKey = `${e.vendor || 'unknown'}_${e.amount}`;
      if (vendorAmountMap.has(dupKey)) {
        const originalId = vendorAmountMap.get(dupKey);
        flags.push({
          type: 'POTENTIAL_DUPLICATE',
          severity: 'CRITICAL',
          message: `Identical amount ₹${amount} and vendor '${e.vendor}' already claimed in ${originalId}.`
        });
        riskScore += 50;
      } else {
        vendorAmountMap.set(dupKey, e.expenseId);
      }

      // 3. Statistical Category Outlier
      const avg = categoryAverages[e.category] || 0;
      if (avg > 0 && amount > avg * 2.8) {
        flags.push({
          type: 'STATISTICAL_OUTLIER',
          severity: 'HIGH',
          message: `Amount ₹${amount} is ${(amount / avg).toFixed(1)}x higher than category average of ₹${Math.round(avg)}.`
        });
        riskScore += 35;
      }

      // 4. Weekend Spending
      if (e.expenseDate) {
        const day = new Date(e.expenseDate).getDay();
        if (day === 0 || day === 6) {
          flags.push({
            type: 'WEEKEND_TRANSACTION',
            severity: 'LOW',
            message: `Expense incurred on a weekend (${e.expenseDate}). Verification of business context recommended.`
          });
          riskScore += 15;
        }
      }

      // 5. High-Value Threshold Breached
      if (amount >= 50000) {
        flags.push({
          type: 'HIGH_VALUE_AUDIT',
          severity: 'CRITICAL',
          message: `Major expenditure of ₹${amount} requires CFO & Executive dual sign-off.`
        });
        riskScore += 30;
      }

      if (flags.length > 0) {
        anomalies.push({
          expenseId: e.expenseId,
          employeeId: e.employeeId,
          departmentId: e.departmentId,
          category: e.category,
          vendor: e.vendor,
          amount,
          status: e.status,
          priority: e.priority,
          riskScore: Math.min(100, riskScore),
          flags
        });
      }
    });

    // Sort by highest risk score first
    return anomalies.sort((a, b) => b.riskScore - a.riskScore);
  }
}
