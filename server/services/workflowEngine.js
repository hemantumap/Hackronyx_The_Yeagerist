import { dataService } from './dataService.js';
import { BudgetEngine } from './budgetEngine.js';

export class WorkflowEngine {
  /**
   * Determine approval tier and routing requirements
   */
  static determineTier(amount) {
    const num = Number(amount || 0);
    if (num <= 250) {
      return {
        level: 1,
        tierName: 'Micro-Expense Auto-Approval',
        approverRole: 'SYSTEM_AUTO_APPROVER',
        slaHours: 0,
        autoApproveEligible: true
      };
    } else if (num <= 1500) {
      return {
        level: 1,
        tierName: 'Manager Review Tier',
        approverRole: 'DEPARTMENT_MANAGER',
        slaHours: 24,
        autoApproveEligible: false
      };
    } else if (num <= 5000) {
      return {
        level: 2,
        tierName: 'Manager + Finance Dual Sign-off',
        approverRole: 'FINANCE_AUDITOR',
        slaHours: 48,
        autoApproveEligible: false
      };
    } else {
      return {
        level: 3,
        tierName: 'High-Value Executive Approval',
        approverRole: 'EXECUTIVE_CFO',
        slaHours: 72,
        autoApproveEligible: false
      };
    }
  }

  /**
   * Auto-assign an approver from department or finance
   */
  static resolveApprover(departmentId, tier) {
    const dept = dataService.departments.find(d => d.departmentId === departmentId);
    if (tier.approverRole === 'DEPARTMENT_MANAGER' && dept && dept.managerId) {
      return { approverId: dept.managerId, role: 'DEPARTMENT_MANAGER' };
    } else if (tier.approverRole === 'FINANCE_AUDITOR') {
      const financeEmp = dataService.employees.find(e => e.departmentId === 'DEPT004' && e.role.includes('Manager'));
      return { approverId: financeEmp ? financeEmp.employeeId : 'EMP060', role: 'FINANCE_AUDITOR' };
    } else if (tier.approverRole === 'EXECUTIVE_CFO') {
      const exec = dataService.employees.find(e => e.departmentId === 'DEPT005');
      return { approverId: exec ? exec.employeeId : 'EMP075', role: 'EXECUTIVE_CFO' };
    }
    return { approverId: dept ? dept.managerId : 'EMP015', role: 'DEPARTMENT_MANAGER' };
  }

  /**
   * Process a new expense submission workflow
   */
  static processSubmission(expense) {
    const tier = this.determineTier(expense.amount);
    const isEscalationCandidate = expense.priority === 'Critical' || Number(expense.amount) > 50000;

    // Check if auto-approved
    if (tier.autoApproveEligible && expense.receiptAvailable) {
      // Auto-approve micro expense
      expense.status = 'Approved';
      BudgetEngine.commitBudget(expense.departmentId, expense.amount, expense.expenseDate);

      const approval = {
        approvalId: `APP${String(dataService.approvals.length + 1).padStart(3, '0')}`,
        expenseId: expense.expenseId,
        approverId: 'SYSTEM_AI',
        approverRole: 'SYSTEM_AUTO_APPROVER',
        status: 'Approved',
        submittedDate: expense.submittedDate,
        actionDate: expense.submittedDate,
        comments: 'Auto-approved by System: Low-risk micro-expense within category policy.',
        approvalLevel: 1,
        escalationRequired: false
      };
      dataService.addApproval(approval);

      dataService.addAuditLog({
        expenseId: expense.expenseId,
        action: 'AUTO_APPROVED',
        actorId: 'SYSTEM_AI',
        actorRole: 'SYSTEM_AUTO_APPROVER',
        details: `Auto-approved micro-expense of ₹${expense.amount}`
      });

      return { expense, approval, autoApproved: true };
    }

    // Otherwise place soft-hold on budget and route to approver
    BudgetEngine.holdBudget(expense.departmentId, expense.amount, expense.expenseDate);

    const approverInfo = this.resolveApprover(expense.departmentId, tier);
    const approval = {
      approvalId: `APP${String(dataService.approvals.length + 1).padStart(3, '0')}`,
      expenseId: expense.expenseId,
      approverId: approverInfo.approverId,
      approverRole: approverInfo.role,
      status: 'Pending',
      submittedDate: expense.submittedDate,
      actionDate: null,
      comments: null,
      approvalLevel: tier.level,
      escalationRequired: isEscalationCandidate
    };
    dataService.addApproval(approval);

    dataService.addAuditLog({
      expenseId: expense.expenseId,
      action: 'SUBMITTED',
      actorId: expense.employeeId,
      actorRole: 'EMPLOYEE',
      details: `Submitted expense of ₹${expense.amount} under ${expense.category}. Encumbered on budget.`
    });

    return { expense, approval, autoApproved: false };
  }

  /**
   * Action an approval: Approve, Reject, or Escalate
   */
  static actionApproval(approvalId, { action, approverId, comments }) {
    const approval = dataService.approvals.find(a => a.approvalId === approvalId);
    if (!approval) {
      return { success: false, reason: 'Approval record not found' };
    }

    const expense = dataService.getExpenseById(approval.expenseId);
    if (!expense) {
      return { success: false, reason: 'Associated expense not found' };
    }

    const today = new Date().toISOString().split('T')[0];

    if (action.toUpperCase() === 'APPROVE') {
      approval.status = 'Approved';
      approval.actionDate = today;
      approval.comments = comments || 'Approved in accordance with company expense policy.';
      if (approverId) approval.approverId = approverId;

      expense.status = 'Approved';
      BudgetEngine.commitBudget(expense.departmentId, expense.amount, expense.expenseDate);

      dataService.addAuditLog({
        expenseId: expense.expenseId,
        action: 'APPROVED',
        actorId: approverId || approval.approverId,
        actorRole: approval.approverRole,
        details: `Approved expense of ₹${expense.amount}. Budget committed.`
      });
    } else if (action.toUpperCase() === 'REJECT') {
      approval.status = 'Rejected';
      approval.actionDate = today;
      approval.comments = comments || 'Rejected due to policy non-compliance.';
      if (approverId) approval.approverId = approverId;

      expense.status = 'Rejected';
      BudgetEngine.releaseBudget(expense.departmentId, expense.amount, expense.expenseDate);

      dataService.addAuditLog({
        expenseId: expense.expenseId,
        action: 'REJECTED',
        actorId: approverId || approval.approverId,
        actorRole: approval.approverRole,
        details: `Rejected expense of ₹${expense.amount}. Reason: ${approval.comments}. Budget released.`
      });
    } else if (action.toUpperCase() === 'ESCALATE') {
      approval.escalationRequired = true;
      approval.comments = comments || 'Escalated to senior management for executive review.';
      expense.priority = 'Critical';
      expense.status = 'Under Review';

      dataService.addAuditLog({
        expenseId: expense.expenseId,
        action: 'ESCALATED',
        actorId: approverId || approval.approverId,
        actorRole: approval.approverRole,
        details: `Escalated approval ${approvalId} to Tier 3 Executive sign-off.`
      });
    }

    return {
      success: true,
      approval,
      expense
    };
  }
}
