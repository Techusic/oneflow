import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomerInvoice } from "@/data/staticData";
import { useProjects } from "@/contexts/ProjectContext";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const invoiceSchema = z.object({
  number: z.string().min(1, "Invoice number is required"),
  customer: z.string().min(1, "Customer is required"),
  amount: z.number().min(0, "Amount must be positive"),
  date: z.string().min(1, "Date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  status: z.enum(["draft", "sent", "paid"]),
  description: z.string().optional(),
  salesOrderId: z.string().optional(),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

interface InvoiceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice?: CustomerInvoice | null;
  projectId: string;
  onSave: (data: InvoiceFormValues) => void;
}

interface InvoiceLine {
  product: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export function InvoiceFormDialog({ open, onOpenChange, invoice, projectId, onSave }: InvoiceFormDialogProps) {
  const { getProject } = useProjects();
  const project = getProject(projectId);
  const [invoiceLines, setInvoiceLines] = useState<InvoiceLine[]>([]);
  const [newLine, setNewLine] = useState({ product: "", quantity: 0, unitPrice: 0 });
  
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      number: "",
      customer: "",
      amount: 0,
      date: new Date().toISOString().split("T")[0],
      dueDate: "",
      status: "draft",
      description: "",
      salesOrderId: "",
    },
  });

  useEffect(() => {
    if (invoice) {
      form.reset({
        number: invoice.number,
        customer: invoice.customer,
        amount: invoice.amount,
        date: invoice.date,
        dueDate: invoice.dueDate,
        status: invoice.status,
        description: invoice.description,
        salesOrderId: invoice.salesOrderId || "",
      });
    } else {
      const today = new Date();
      const dueDate = new Date(today);
      dueDate.setDate(dueDate.getDate() + 30);
      form.reset({
        number: "",
        customer: "",
        amount: 0,
        date: today.toISOString().split("T")[0],
        dueDate: dueDate.toISOString().split("T")[0],
        status: "draft",
        description: "",
        salesOrderId: "",
      });
    }
  }, [invoice, form]);

  const subtotal = invoiceLines.reduce((sum, line) => sum + (line.quantity * line.unitPrice), 0);
  const totalTaxes = 0; // Can be calculated if needed
  const total = invoiceLines.reduce((sum, line) => sum + line.amount, 0);

  const onSubmit = (data: InvoiceFormValues) => {
    const finalData = {
      ...data,
      amount: total || data.amount,
    };
    onSave(finalData);
    onOpenChange(false);
    form.reset();
    setInvoiceLines([]);
    setNewLine({ product: "", quantity: 0, unitPrice: 0 });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{invoice ? "Edit Invoice" : "Create Invoice"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice ID</FormLabel>
                    <FormControl>
                      <Input placeholder="INV01" {...field} readOnly className="bg-muted" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Customer name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <Label>Project</Label>
                <Input 
                  placeholder="Project name" 
                  value={project?.name || ""} 
                  readOnly 
                  className="bg-muted" 
                />
              </div>
            </div>

            <div>
              <Label>Invoice Lines</Label>
              <div className="border rounded-lg mt-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoiceLines.map((line, index) => (
                      <TableRow key={index}>
                        <TableCell>{line.product}</TableCell>
                        <TableCell>{line.quantity}</TableCell>
                        <TableCell>₹{line.unitPrice.toLocaleString()}</TableCell>
                        <TableCell>₹{line.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setInvoiceLines(invoiceLines.filter((_, i) => i !== index));
                            }}
                          >
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {invoiceLines.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          No products added
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <Input
                  placeholder="Product"
                  value={newLine.product}
                  onChange={(e) => setNewLine({ ...newLine, product: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="Quantity"
                  value={newLine.quantity || ""}
                  onChange={(e) => {
                    const qty = parseFloat(e.target.value) || 0;
                    const amount = qty * newLine.unitPrice;
                    setNewLine({ ...newLine, quantity: qty, amount });
                  }}
                />
                <Input
                  type="number"
                  placeholder="Unit Price"
                  value={newLine.unitPrice || ""}
                  onChange={(e) => {
                    const price = parseFloat(e.target.value) || 0;
                    const amount = newLine.quantity * price;
                    setNewLine({ ...newLine, unitPrice: price, amount });
                  }}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                className="mt-2"
                onClick={() => {
                  if (newLine.product && newLine.quantity > 0 && newLine.unitPrice > 0) {
                    const amount = newLine.quantity * newLine.unitPrice;
                    setInvoiceLines([...invoiceLines, { ...newLine, amount }]);
                    setNewLine({ product: "", quantity: 0, unitPrice: 0 });
                  }
                }}
              >
                Add a product
              </Button>
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <Label>Subtotal</Label>
                <span className="font-medium">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <Label>Taxes</Label>
                <span className="font-medium">₹{totalTaxes.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <Label className="font-semibold">Total</Label>
                <span className="font-bold text-lg">₹{total.toLocaleString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="salesOrderId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sales Order ID (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="SO-2025-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <div className="flex gap-2">
                <Button type="submit" variant="outline">
                  {invoice ? "Save Changes" : "Create Invoice"}
                </Button>
                {!invoice && (
                  <Button type="button" onClick={() => {
                    const data = form.getValues();
                    const finalData = { ...data, amount: total || data.amount, status: "sent" as const };
                    onSave(finalData);
                    onOpenChange(false);
                  }}>
                    Confirm
                  </Button>
                )}
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

