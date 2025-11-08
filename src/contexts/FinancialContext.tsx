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

