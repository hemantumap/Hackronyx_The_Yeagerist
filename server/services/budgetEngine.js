import { dataService } from './dataService.js';

export class BudgetEngine {
  /**
   * Helper to format YYYY-MM
   */
  static getMonthKey(dateStr) {
    if (!dateStr) return '2026-02';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '2026-02';
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${d.getFullYear()}-${month}`;
  }

  /**
   * Soft-hold (encumbrance) budget when an expense is submitted
   */
  static holdBudget(departmentId, amount, expenseDate) {
    const month = this.getMonthKey(expenseDate);
    let budget = dataService.getBudget(departmentId, month);

    // If month not found, fallback to the latest budget for this department
    if (!budget) {
      const deptBudgets = dataService.getBudgets({ departmentId });
      budget = deptBudgets[deptBudgets.length - 1];
    }

    if (!budget) {
      return { success: false, reason: `No budget found for department ${departmentId}` };
    }

    const currentSpent = Number(budget.spentAmount || 0);
    const currentReserved = Number(budget.reservedAmount || 0);
    const allocated = Number(budget.allocatedBudget || 0);
    const numAmount = Number(amount || 0);

    const newReserved = currentReserved + numAmount;
    const newRemaining = Math.max(0, allocated - (currentSpent + newReserved));
    const newUtilization = Number(((currentSpent + newReserved) / allocated * 100).toFixed(2));

    let newStatus = 'Healthy';
    if (newUtilization >= 85) {
      newStatus = 'Critical';
    } else if (newUtilization >= 70) {
      newStatus = 'Warning';
    }

    const updatedBudget = dataService.updateBudget(budget.budgetId, {
      reservedAmount: newReserved,
      remainingBudget: newRemaining,
      utilizationPercentage: newUtilization,
      budgetStatus: newStatus
    });

    // Check if new alert should be raised
    if (newStatus !== 'Healthy') {
      const existingAlert = dataService.getAlerts({ departmentId }).find(a => a.month === budget.month);
      if (!existingAlert) {
        dataService.addAlert({
          alertId: `ALT${String(dataService.alerts.length + 1).padStart(3, '0')}`,
          departmentId,
          severity: newStatus.toUpperCase(),
          month: budget.month,
          title: `Department ${departmentId} ${newStatus} Budget Alert (${budget.month})`,
          message: `Spend and commitments reached ${newUtilization}% of monthly allocated budget. Remaining: ${newRemaining}`,
          utilizationPercentage: newUtilization
        });
      }
    }

    return {
      success: true,
      budget: updatedBudget,
      isOverBudget: (currentSpent + newReserved) > allocated
    };
  }

  /**
   * Convert reserved amount to spent when approved
   */
  static commitBudget(departmentId, amount, expenseDate) {
    const month = this.getMonthKey(expenseDate);
    let budget = dataService.getBudget(departmentId, month);
    if (!budget) {
      const deptBudgets = dataService.getBudgets({ departmentId });
      budget = deptBudgets[deptBudgets.length - 1];
    }
    if (!budget) return null;

    const numAmount = Number(amount || 0);
    const currentSpent = Number(budget.spentAmount || 0);
    const currentReserved = Number(budget.reservedAmount || 0);
    const allocated = Number(budget.allocatedBudget || 0);

    const newSpent = currentSpent + numAmount;
    const newReserved = Math.max(0, currentReserved - numAmount);
    const newRemaining = Math.max(0, allocated - (newSpent + newReserved));
    const newUtilization = Number(((newSpent + newReserved) / allocated * 100).toFixed(2));

    let newStatus = 'Healthy';
    if (newUtilization >= 85) newStatus = 'Critical';
    else if (newUtilization >= 70) newStatus = 'Warning';

    return dataService.updateBudget(budget.budgetId, {
      spentAmount: newSpent,
      reservedAmount: newReserved,
      remainingBudget: newRemaining,
      utilizationPercentage: newUtilization,
      budgetStatus: newStatus
    });
  }

  /**
   * Release reserved budget if expense is rejected
   */
  static releaseBudget(departmentId, amount, expenseDate) {
    const month = this.getMonthKey(expenseDate);
    let budget = dataService.getBudget(departmentId, month);
    if (!budget) {
      const deptBudgets = dataService.getBudgets({ departmentId });
      budget = deptBudgets[deptBudgets.length - 1];
    }
    if (!budget) return null;

    const numAmount = Number(amount || 0);
    const currentSpent = Number(budget.spentAmount || 0);
    const currentReserved = Number(budget.reservedAmount || 0);
    const allocated = Number(budget.allocatedBudget || 0);

    const newReserved = Math.max(0, currentReserved - numAmount);
    const newRemaining = Math.max(0, allocated - (currentSpent + newReserved));
    const newUtilization = Number(((currentSpent + newReserved) / allocated * 100).toFixed(2));

    let newStatus = 'Healthy';
    if (newUtilization >= 85) newStatus = 'Critical';
    else if (newUtilization >= 70) newStatus = 'Warning';

    return dataService.updateBudget(budget.budgetId, {
      reservedAmount: newReserved,
      remainingBudget: newRemaining,
      utilizationPercentage: newUtilization,
      budgetStatus: newStatus
    });
  }

  /**
   * Get enterprise-wide budget summary
   */
  static getExecutiveSummary() {
    const budgets = dataService.budgets;
    const expenses = dataService.expenses;
    const approvals = dataService.approvals;
    const alerts = dataService.alerts;

    let totalAllocated = 0;
    let totalSpent = 0;
    let totalReserved = 0;
    let totalRemaining = 0;

    budgets.forEach(b => {
      totalAllocated += Number(b.allocatedBudget || 0);
      totalSpent += Number(b.spentAmount || 0);
      totalReserved += Number(b.reservedAmount || 0);
      totalRemaining += Number(b.remainingBudget || 0);
    });

    const pendingApprovalsCount = approvals.filter(a => a.status.toLowerCase() === 'pending').length;
    const escalatedCount = approvals.filter(a => a.escalationRequired === true).length;
    const warningAlerts = alerts.filter(a => a.severity === 'WARNING').length;
    const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL').length;

    // Department-level rollups
    const deptRollups = dataService.departments.map(d => {
      const deptBudgets = budgets.filter(b => b.departmentId === d.departmentId);
      const allocated = deptBudgets.reduce((sum, b) => sum + Number(b.allocatedBudget || 0), 0);
      const spent = deptBudgets.reduce((sum, b) => sum + Number(b.spentAmount || 0), 0);
      const reserved = deptBudgets.reduce((sum, b) => sum + Number(b.reservedAmount || 0), 0);
      const remaining = allocated - (spent + reserved);
      const utilization = allocated > 0 ? Number(((spent + reserved) / allocated * 100).toFixed(1)) : 0;

      return {
        departmentId: d.departmentId,
        departmentName: d.name,
        location: d.location,
        allocated,
        spent,
        reserved,
        remaining,
        utilization,
        status: utilization >= 85 ? 'Critical' : utilization >= 70 ? 'Warning' : 'Healthy'
      };
    });

    return {
      totalAllocated,
      totalSpent,
      totalReserved,
      totalRemaining,
      overallUtilization: totalAllocated > 0 ? Number(((totalSpent + totalReserved) / totalAllocated * 100).toFixed(1)) : 0,
      totalExpensesCount: expenses.length,
      pendingApprovalsCount,
      escalatedCount,
      warningAlerts,
      criticalAlerts,
      departments: deptRollups
    };
  }
}
