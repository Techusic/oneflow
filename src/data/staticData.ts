export interface Project {
  id: string;
  name: string;
  status: "planned" | "in_progress" | "completed" | "on_hold";
  manager: string;
  team: string[];
  startDate: string;
  endDate?: string; // End date is now optional
  budget: number;
  spent: number;
  progress: number;
  description: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assignee: string;
  status: "new" | "in_progress" | "blocked" | "done";
  priority: "low" | "medium" | "high";
  dueDate: string;
  hoursLogged: number;
  estimatedHours: number;
}

export interface SalesOrder {
  id: string;
  projectId: string;
  number: string;
  customer: string;
  amount: number;
  date: string;
  status: "draft" | "confirmed" | "invoiced";
  description: string;
}

export interface PurchaseOrder {
  id: string;
  projectId: string;
  number: string;
  vendor: string;
  amount: number;
  date: string;
  status: "draft" | "confirmed" | "billed";
  description: string;
}

export interface CustomerInvoice {
  id: string;
  projectId: string;
  salesOrderId?: string;
  number: string;
  customer: string;
  amount: number;
  date: string;
  dueDate: string;
  status: "draft" | "sent" | "paid";
  description: string;
}

export interface VendorBill {
  id: string;
  projectId: string;
  purchaseOrderId?: string;
  number: string;
  vendor: string;
  amount: number;
  date: string;
  dueDate: string;
  status: "draft" | "confirmed" | "paid";
  description: string;
}

export interface Expense {
  id: string;
  projectId: string;
  employee: string;
  amount: number;
  date: string;
  category: string;
  description: string;
  billable: boolean;
  status: "pending" | "approved" | "rejected";
  receipt?: string;
}

export interface Timesheet {
  id: string;
  projectId: string;
  taskId: string;
  employee: string;
  date: string;
  hours: number;
  billable: boolean;
  description: string;
}

export const projects: Project[] = []; // No dummy projects by default

export const tasks: Task[] = []; // No dummy tasks by default

export const salesOrders: SalesOrder[] = []; // No dummy sales orders by default

export const purchaseOrders: PurchaseOrder[] = []; // No dummy purchase orders by default

export const customerInvoices: CustomerInvoice[] = []; // No dummy invoices by default

export const vendorBills: VendorBill[] = []; // No dummy bills by default

export const expenses: Expense[] = []; // No dummy expenses by default

export const timesheets: Timesheet[] = []; // No dummy timesheets by default
