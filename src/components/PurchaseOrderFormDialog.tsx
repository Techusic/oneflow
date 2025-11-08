import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { PurchaseOrder } from "@/data/staticData";
import { useProjects } from "@/contexts/ProjectContext";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const purchaseOrderSchema = z.object({
  number: z.string().min(1, "Order number is required"),
  vendor: z.string().min(1, "Vendor is required"),
  amount: z.number().min(0, "Amount must be positive"),
  date: z.string().min(1, "Date is required"),
  status: z.enum(["draft", "confirmed", "billed"]),
  description: z.string().optional(),
});

type PurchaseOrderFormValues = z.infer<typeof purchaseOrderSchema>;

interface PurchaseOrderFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseOrder?: PurchaseOrder | null;
  projectId: string;
  onSave: (data: PurchaseOrderFormValues) => void;
}

interface OrderLine {
  product: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  taxes: number;
  amount: number;
}

export function PurchaseOrderFormDialog({ open, onOpenChange, purchaseOrder, projectId, onSave }: PurchaseOrderFormDialogProps) {
  const { getProject } = useProjects();
  const project = getProject(projectId);
  const [orderLines, setOrderLines] = useState<OrderLine[]>([]);
  const [newLine, setNewLine] = useState({ product: "", quantity: 0, unit: "pcs", unitPrice: 0, taxes: 0 });
  
  const form = useForm<PurchaseOrderFormValues>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      number: "",
      vendor: "",
      amount: 0,
      date: new Date().toISOString().split("T")[0],
      status: "draft",
      description: "",
    },
  });

  useEffect(() => {
    if (purchaseOrder) {
      form.reset({
        number: purchaseOrder.number,
        vendor: purchaseOrder.vendor,
        amount: purchaseOrder.amount,
        date: purchaseOrder.date,
        status: purchaseOrder.status,
        description: purchaseOrder.description,
      });
    } else {
      form.reset({
        number: "",
        vendor: "",
        amount: 0,
        date: new Date().toISOString().split("T")[0],
        status: "draft",
        description: "",
      });
    }
  }, [purchaseOrder, form]);

  const subtotal = orderLines.reduce((sum, line) => sum + (line.quantity * line.unitPrice), 0);
  const totalTaxes = orderLines.reduce((sum, line) => sum + line.taxes, 0);
  const total = orderLines.reduce((sum, line) => sum + line.amount, 0);

  const onSubmit = (data: PurchaseOrderFormValues) => {
    const finalData = {
      ...data,
      amount: total || data.amount,
    };
    onSave(finalData);
    onOpenChange(false);
    form.reset();
    setOrderLines([]);
    setNewLine({ product: "", quantity: 0, unit: "pcs", unitPrice: 0, taxes: 0 });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{purchaseOrder ? "Edit Purchase Order" : "Create Purchase Order"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PO Number</FormLabel>
                    <FormControl>
                      <Input placeholder="PO01" {...field} readOnly className="bg-muted" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vendor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendor</FormLabel>
                    <FormControl>
                      <Input placeholder="Vendor name" {...field} />
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
              <Label>Order Lines</Label>
              <div className="border rounded-lg mt-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Taxes</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderLines.map((line, index) => (
                      <TableRow key={index}>
                        <TableCell>{line.product}</TableCell>
                        <TableCell>{line.quantity}</TableCell>
                        <TableCell>{line.unit}</TableCell>
                        <TableCell>₹{line.unitPrice.toLocaleString()}</TableCell>
                        <TableCell>₹{line.taxes.toLocaleString()}</TableCell>
                        <TableCell>₹{line.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setOrderLines(orderLines.filter((_, i) => i !== index));
                            }}
                          >
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {orderLines.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          No products added
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="grid grid-cols-5 gap-2 mt-2">
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
                    const amount = qty * newLine.unitPrice + newLine.taxes;
                    setNewLine({ ...newLine, quantity: qty, amount });
                  }}
                />
                <Input
                  placeholder="Unit"
                  value={newLine.unit}
                  onChange={(e) => setNewLine({ ...newLine, unit: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="Unit Price"
                  value={newLine.unitPrice || ""}
                  onChange={(e) => {
                    const price = parseFloat(e.target.value) || 0;
                    const amount = newLine.quantity * price + newLine.taxes;
                    setNewLine({ ...newLine, unitPrice: price, amount });
                  }}
                />
                <Input
                  type="number"
                  placeholder="Taxes"
                  value={newLine.taxes || ""}
                  onChange={(e) => {
                    const taxes = parseFloat(e.target.value) || 0;
                    const amount = newLine.quantity * newLine.unitPrice + taxes;
                    setNewLine({ ...newLine, taxes, amount });
                  }}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                className="mt-2"
                onClick={() => {
                  if (newLine.product && newLine.quantity > 0 && newLine.unitPrice > 0) {
                    const amount = newLine.quantity * newLine.unitPrice + newLine.taxes;
                    setOrderLines([...orderLines, { ...newLine, amount }]);
                    setNewLine({ product: "", quantity: 0, unit: "pcs", unitPrice: 0, taxes: 0 });
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
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="billed">Billed</SelectItem>
                      </SelectContent>
                    </Select>
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
                  {purchaseOrder ? "Save Changes" : "Create PO"}
                </Button>
                {!purchaseOrder && (
                  <Button type="button" onClick={() => {
                    const data = form.getValues();
                    const finalData = { ...data, amount: total || data.amount, status: "confirmed" as const };
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

