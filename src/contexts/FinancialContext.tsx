/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext'; // <-- FIX: Changed to alias path

// Import your types...
import { SalesOrder, PurchaseOrder, CustomerInvoice, VendorBill, Expense } from "@/data/staticData";

//
// --- FIX STARTS HERE ---
//
// Define API response types based on transformation logic
// These are now type-safe and do not use 'any'.
// We use optional (?) and null unions because the transformation
// logic handles potentially missing/null values (e.g., d.project || "")
//
interface ApiSalesOrder {
  id: string | number;
  project?: string | null;
  number?: string | null;
  customer?: string | number | null;
  total_amount?: number | null;
  amount?: number | null;
  date?: string | null;
  status?: string | null;
  description?: string | null;
}

interface ApiPurchaseOrder {
  id: string | number;
  project?: string | null;
  number?: string | null;
  vendor?: string | number | null;
  total_amount?: number | null;
  amount?: number | null;
  date?: string | null;
  status?: string | null;
  description?: string | null;
}

interface ApiInvoice {
  id: string | number;
  invoice_type: 'customer' | 'vendor'; // This was already correct
  project?: string | null;
  number?: string | null;
  total_amount?: number | null;
  amount?: number | null;
  date?: string | null;
  due_date?: string | null;
  status?: string | null;
  description?: string | null;
  // Specific to customer invoices
  customer?: string | number | null;
  sales_order?: string | null;
  // Specific to vendor bills
  vendor?: string | number | null;
  purchase_order?: string | null;
}

interface ApiExpense {
  id: string | number;
  project?: string | null;
  user?: string | null; // Maps to 'employee'
  amount?: number | null;
  date?: string | null;
  category?: string | null;
  description?: string | null;
  billable?: boolean | null;
  status?: string | null;
  receipt?: string | null;
}
//
// --- FIX ENDS HERE ---
//

interface FinancialContextType {
  salesOrders: SalesOrder[];
  purchaseOrders: PurchaseOrder[];
  invoices: CustomerInvoice[];
  bills: VendorBill[];
  expenses: Expense[];
  isLoading: boolean;
  addSalesOrder: (so: Omit<SalesOrder, 'id'>) => Promise<void>;
  updateSalesOrder: (id: string, so: Partial<SalesOrder>) => Promise<void>;
  deleteSalesOrder: (id: string) => Promise<void>;
  addPurchaseOrder: (po: Omit<PurchaseOrder, 'id'>) => Promise<void>;
  updatePurchaseOrder: (id: string, po: Partial<PurchaseOrder>) => Promise<void>;
  deletePurchaseOrder: (id: string) => Promise<void>;
  addInvoice: (invoice: Omit<CustomerInvoice, 'id'>) => Promise<void>;
  updateInvoice: (id: string, invoice: Partial<CustomerInvoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  addBill: (bill: Omit<VendorBill, 'id'>) => Promise<void>;
  updateBill: (id: string, bill: Partial<VendorBill>) => Promise<void>;
  deleteBill: (id: string) => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error("useFinancial must be used within a FinancialProvider");
  }
  return context;
};

// Helper: Transform API invoice data
// This function is now fully type-safe
const transformApiInvoice = (d: ApiInvoice): CustomerInvoice | VendorBill | null => {
  const common = {
    id: String(d.id),
    projectId: d.project || "",
    number: d.number || "",
    amount: d.total_amount ?? d.amount ?? 0,
    date: d.date || "",
    dueDate: d.due_date || "",
    status: d.status || "draft",
    description: d.description || "",
  };
  if (d.invoice_type === "customer") {
    return { ...common, customer: String(d.customer || ""), salesOrderId: d.sales_order || undefined };
  } else if (d.invoice_type === "vendor") {
    return { ...common, vendor: String(d.vendor || ""), purchaseOrderId: d.purchase_order || undefined };
  }
  return null;
};


export const FinancialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [invoices, setInvoices] = useState<CustomerInvoice[]>([]);
  const [bills, setBills] = useState<VendorBill[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  // Load all financial data from API
  const loadFinancialData = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);

    try {
      // Use Promise.all to fetch in parallel
      const [soRes, poRes, invRes, expRes] = await Promise.all([
        api<ApiSalesOrder[]>('/api/sales-orders/'),
        api<ApiPurchaseOrder[]>('/api/purchase-orders/'),
        api<ApiInvoice[]>('/api/invoices/'),
        api<ApiExpense[]>('/api/expenses/'),
      ]);

      // Process Sales Orders
      setSalesOrders(soRes.map((d): SalesOrder => ({
        id: String(d.id),
        projectId: d.project || "",
        number: d.number || "",
        customer: String(d.customer || ""),
        amount: d.total_amount ?? d.amount ?? 0,
        date: d.date || "",
        status: d.status || "draft",
        description: d.description || "",
      })));

      // Process Purchase Orders
      setPurchaseOrders(poRes.map((d): PurchaseOrder => ({
        id: String(d.id),
        projectId: d.project || "",
        number: d.number || "",
        vendor: String(d.vendor || ""),
        amount: d.total_amount ?? d.amount ?? 0,
        date: d.date || "",
        status: d.status || "draft",
        description: d.description || "",
      })));

      // Process Invoices and Bills
      const customers: CustomerInvoice[] = [];
      const vendors: VendorBill[] = [];
      invRes.forEach((d) => {
        const item = transformApiInvoice(d);
        if (item) {
          if (d.invoice_type === 'customer') customers.push(item as CustomerInvoice);
          else vendors.push(item as VendorBill);
        }
      });
      setInvoices(customers);
      setBills(vendors);

      // Process Expenses
      setExpenses(expRes.map((d): Expense => ({
        id: String(d.id),
        projectId: d.project || "",
        employee: d.user || "", // Assuming 'user' is the field from Django
        amount: d.amount ?? 0,
        date: d.date || "",
        category: d.category || "",
        description: d.description || "",
        billable: Boolean(d.billable),
        status: d.status || "pending",
        receipt: d.receipt || undefined,
      })));

    } catch (err) {
      console.error("Failed to fetch financial data from API:", err);
      // You might want to load from localStorage here as a fallback
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadFinancialData();
  }, [loadFinancialData]);

  // --- CRUD Functions ---
  // These now POST/PATCH/DELETE to the API

  // Sales Orders
  const addSalesOrder = async (so: Omit<SalesOrder, 'id'>) => {
    try {
      const newSO = await api<SalesOrder>('/api/sales-orders/', { method: 'POST', body: JSON.stringify(so) });
      setSalesOrders((prev) => [...prev, newSO]);
    } catch (e) { console.error(e); }
  };
  const updateSalesOrder = async (id: string, updates: Partial<SalesOrder>) => {
    try {
      const updatedSO = await api<SalesOrder>(`/api/sales-orders/${id}/`, { method: 'PATCH', body: JSON.stringify(updates) });
      setSalesOrders((prev) => prev.map((so) => (so.id === id ? updatedSO : so)));
    } catch (e) { console.error(e); }
  };
  const deleteSalesOrder = async (id: string) => {
    try {
      await api(`/api/sales-orders/${id}/`, { method: 'DELETE' });
      setSalesOrders((prev) => prev.filter((so) => so.id !== id));
    } catch (e) { console.error(e); }
  };

  // Purchase Orders
  const addPurchaseOrder = async (po: Omit<PurchaseOrder, 'id'>) => {
    try {
      const newPO = await api<PurchaseOrder>('/api/purchase-orders/', { method: 'POST', body: JSON.stringify(po) });
      setPurchaseOrders((prev) => [...prev, newPO]);
    } catch (e) { console.error(e); }
  };
  const updatePurchaseOrder = async (id: string, updates: Partial<PurchaseOrder>) => {
    try {
      const updatedPO = await api<PurchaseOrder>(`/api/purchase-orders/${id}/`, { method: 'PATCH', body: JSON.stringify(updates) });
      setPurchaseOrders((prev) => prev.map((po) => (po.id === id ? updatedPO : po)));
    } catch (e) { console.error(e); }
  };
  const deletePurchaseOrder = async (id: string) => {
    try {
      await api(`/api/purchase-orders/${id}/`, { method: 'DELETE' });
      setPurchaseOrders((prev) => prev.filter((po) => po.id !== id));
    } catch (e) { console.error(e); }
  };

  // Invoices
  const addInvoice = async (invoice: Omit<CustomerInvoice, 'id'>) => {
    try {
      const newInvoice = await api<CustomerInvoice>('/api/invoices/', { method: 'POST', body: JSON.stringify({ ...invoice, invoice_type: 'customer' }) });
      setInvoices((prev) => [...prev, newInvoice]);
    } catch (e) { console.error(e); }
  };
  const updateInvoice = async (id: string, updates: Partial<CustomerInvoice>) => {
    try {
      const updatedInvoice = await api<CustomerInvoice>(`/api/invoices/${id}/`, { method: 'PATCH', body: JSON.stringify(updates) });
      setInvoices((prev) => prev.map((inv) => (inv.id === id ? updatedInvoice : inv)));
    } catch (e) { console.error(e); }
  };
  const deleteInvoice = async (id: string) => {
    try {
      await api(`/api/invoices/${id}/`, { method: 'DELETE' });
      setInvoices((prev) => prev.filter((inv) => inv.id !== id));
    } catch (e) { console.error(e); }
  };

  // Bills
  const addBill = async (bill: Omit<VendorBill, 'id'>) => {
    try {
      const newBill = await api<VendorBill>('/api/invoices/', { method: 'POST', body: JSON.stringify({ ...bill, invoice_type: 'vendor' }) });
      setBills((prev) => [...prev, newBill]);
    } catch (e) { console.error(e); }
  };
  const updateBill = async (id: string, updates: Partial<VendorBill>) => {
    try {
      const updatedBill = await api<VendorBill>(`/api/invoices/${id}/`, { method: 'PATCH', body: JSON.stringify(updates) });
      setBills((prev) => prev.map((bill) => (bill.id === id ? updatedBill : bill)));
    } catch (e) { console.error(e); }
  };
  const deleteBill = async (id: string) => {
    try {
      await api(`/api/invoices/${id}/`, { method: 'DELETE' });
      setBills((prev) => prev.filter((bill) => bill.id !== id));
    } catch (e) { console.error(e); }
  };

  // Expenses
  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    try {
      const newExpense = await api<Expense>('/api/expenses/', { method: 'POST', body: JSON.stringify(expense) });
      setExpenses((prev) => [...prev, newExpense]);
    } catch (e) { console.error(e); }
  };
  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    try {
      const updatedExpense = await api<Expense>(`/api/expenses/${id}/`, { method: 'PATCH', body: JSON.stringify(updates) });
      setExpenses((prev) => prev.map((exp) => (exp.id === id ? updatedExpense : exp)));
    } catch (e) { console.error(e); }
  };
  const deleteExpense = async (id: string) => {
    try {
      await api(`/api/expenses/${id}/`, { method: 'DELETE' });
      setExpenses((prev) => prev.filter((exp) => exp.id !== id));
    } catch (e) { console.error(e); }
  };

  return (
    <FinancialContext.Provider
      value={{
        salesOrders,
        purchaseOrders,
        invoices,
        bills,
        expenses,
        isLoading,
        addSalesOrder,
        updateSalesOrder,
        deleteSalesOrder,
        addPurchaseOrder,
        updatePurchaseOrder,
        deletePurchaseOrder,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        addBill,
        updateBill,
        deleteBill,
        addExpense,
        updateExpense,
        deleteExpense,
      }}
    >
      {children}
    </FinancialContext.Provider>
  );
};