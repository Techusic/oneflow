/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { 
  SalesOrder, PurchaseOrder, CustomerInvoice, 
  VendorBill, Expense,
  salesOrders as initialSO,
  purchaseOrders as initialPO,
  customerInvoices as initialInvoices,
  vendorBills as initialBills,
  expenses as initialExpenses
} from "@/data/staticData";

interface FinancialContextType {
  salesOrders: SalesOrder[];
  purchaseOrders: PurchaseOrder[];
  invoices: CustomerInvoice[];
  bills: VendorBill[];
  expenses: Expense[];
  addSalesOrder: (so: SalesOrder) => void;
  updateSalesOrder: (id: string, so: Partial<SalesOrder>) => void;
  deleteSalesOrder: (id: string) => void;
  addPurchaseOrder: (po: PurchaseOrder) => void;
  updatePurchaseOrder: (id: string, po: Partial<PurchaseOrder>) => void;
  deletePurchaseOrder: (id: string) => void;
  addInvoice: (invoice: CustomerInvoice) => void;
  updateInvoice: (id: string, invoice: Partial<CustomerInvoice>) => void;
  deleteInvoice: (id: string) => void;
  addBill: (bill: VendorBill) => void;
  updateBill: (id: string, bill: Partial<VendorBill>) => void;
  deleteBill: (id: string) => void;
  addExpense: (expense: Expense) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error("useFinancial must be used within a FinancialProvider");
  }
  return context;
};

interface FinancialProviderProps {
  children: ReactNode;
}

export const FinancialProvider: React.FC<FinancialProviderProps> = ({ children }) => {
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>(() => {
    const stored = localStorage.getItem("salesOrders");
    return stored ? JSON.parse(stored) : initialSO;
  });

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    const stored = localStorage.getItem("purchaseOrders");
    return stored ? JSON.parse(stored) : initialPO;
  });

  const [invoices, setInvoices] = useState<CustomerInvoice[]>(() => {
    const stored = localStorage.getItem("customerInvoices");
    return stored ? JSON.parse(stored) : initialInvoices;
  });

  const [bills, setBills] = useState<VendorBill[]>(() => {
    const stored = localStorage.getItem("vendorBills");
    return stored ? JSON.parse(stored) : initialBills;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const stored = localStorage.getItem("expenses");
    return stored ? JSON.parse(stored) : initialExpenses;
  });

  useEffect(() => {
    localStorage.setItem("salesOrders", JSON.stringify(salesOrders));
  }, [salesOrders]);

  useEffect(() => {
    localStorage.setItem("purchaseOrders", JSON.stringify(purchaseOrders));
  }, [purchaseOrders]);

  useEffect(() => {
    localStorage.setItem("customerInvoices", JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem("vendorBills", JSON.stringify(bills));
  }, [bills]);

  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

  // Fetch data from backend API on mount (fallback to existing local data)
  useEffect(() => {
    const load = async () => {
      try {
        // Sales Orders
        const soRes = await fetch("/api/sales-orders/");
        if (soRes.ok) {
          const data = await soRes.json();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setSalesOrders(data.map((d: any) => ({
            id: String(d.id),
            projectId: (d as any).project || "",
            number: (d as any).number || "",
            customer: String((d as any).customer || ""),
            amount: (d as any).total_amount ?? (d as any).amount ?? 0,
            date: (d as any).date || "",
            status: (d as any).status || "draft",
            description: (d as any).description || "",
          })));
        }

        // Purchase Orders
        const poRes = await fetch("/api/purchase-orders/");
        if (poRes.ok) {
          const data = await poRes.json();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setPurchaseOrders(data.map((d: any) => ({
            id: String(d.id),
            projectId: (d as any).project || "",
            number: (d as any).number || "",
            vendor: String((d as any).vendor || ""),
            amount: (d as any).total_amount ?? (d as any).amount ?? 0,
            date: (d as any).date || "",
            status: (d as any).status || "draft",
            description: (d as any).description || "",
          })));
        }

        // Invoices (customer) and Bills (vendor)
        const invRes = await fetch("/api/invoices/");
        if (invRes.ok) {
          const data = await invRes.json();
          const customers: CustomerInvoice[] = [];
          const vendors: VendorBill[] = [];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data.forEach((d: any) => {
            const common = {
              id: String(d.id),
              projectId: (d as any).project || "",
              number: (d as any).number || "",
              amount: (d as any).total_amount ?? (d as any).amount ?? 0,
              date: (d as any).date || "",
              dueDate: (d as any).due_date || "",
              status: (d as any).status || "draft",
              description: (d as any).description || "",
            } as CustomerInvoice & VendorBill;

            if ((d as any).invoice_type === "customer") {
              customers.push({ ...common, customer: String((d as any).customer || ""), salesOrderId: (d as any).sales_order || undefined });
            } else if ((d as any).invoice_type === "vendor") {
              vendors.push({ ...common, vendor: String((d as any).vendor || ""), purchaseOrderId: (d as any).purchase_order || undefined });
            }
          });
          if (customers.length) setInvoices(customers);
          if (vendors.length) setBills(vendors);
        }

        // Expenses
        const expRes = await fetch("/api/expenses/");
        if (expRes.ok) {
          const data = await expRes.json();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setExpenses(data.map((d: any) => ({
            id: String(d.id),
            projectId: (d as any).project || "",
            employee: (d as any).user || "",
            amount: (d as any).amount ?? 0,
            date: (d as any).date || "",
            category: (d as any).category || "",
            description: (d as any).description || "",
            billable: Boolean((d as any).billable),
            status: (d as any).status || "pending",
            receipt: (d as any).receipt || undefined,
          })));
        }
      } catch (err) {
        // If any fetch fails, keep local/static data (no-op)
        console.warn("Failed to fetch financial data from API, using local data.", err);
      }
    };

    load();
  }, []);

  // Sales Orders
  const addSalesOrder = (so: SalesOrder) => {
    setSalesOrders((prev) => [...prev, so]);
  };

  const updateSalesOrder = (id: string, updates: Partial<SalesOrder>) => {
    setSalesOrders((prev) => prev.map((so) => (so.id === id ? { ...so, ...updates } : so)));
  };

  const deleteSalesOrder = (id: string) => {
    setSalesOrders((prev) => prev.filter((so) => so.id !== id));
  };

  // Purchase Orders
  const addPurchaseOrder = (po: PurchaseOrder) => {
    setPurchaseOrders((prev) => [...prev, po]);
  };

  const updatePurchaseOrder = (id: string, updates: Partial<PurchaseOrder>) => {
    setPurchaseOrders((prev) => prev.map((po) => (po.id === id ? { ...po, ...updates } : po)));
  };

  const deletePurchaseOrder = (id: string) => {
    setPurchaseOrders((prev) => prev.filter((po) => po.id !== id));
  };

  // Invoices
  const addInvoice = (invoice: CustomerInvoice) => {
    setInvoices((prev) => [...prev, invoice]);
  };

  const updateInvoice = (id: string, updates: Partial<CustomerInvoice>) => {
    setInvoices((prev) => prev.map((inv) => (inv.id === id ? { ...inv, ...updates } : inv)));
  };

  const deleteInvoice = (id: string) => {
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));
  };

  // Bills
  const addBill = (bill: VendorBill) => {
    setBills((prev) => [...prev, bill]);
  };

  const updateBill = (id: string, updates: Partial<VendorBill>) => {
    setBills((prev) => prev.map((bill) => (bill.id === id ? { ...bill, ...updates } : bill)));
  };

  const deleteBill = (id: string) => {
    setBills((prev) => prev.filter((bill) => bill.id !== id));
  };

  // Expenses
  const addExpense = (expense: Expense) => {
    setExpenses((prev) => [...prev, expense]);
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    setExpenses((prev) => prev.map((exp) => (exp.id === id ? { ...exp, ...updates } : exp)));
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));
  };

  return (
    <FinancialContext.Provider
      value={{
        salesOrders,
        purchaseOrders,
        invoices,
        bills,
        expenses,
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

