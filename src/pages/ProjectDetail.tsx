import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProjects } from "@/contexts/ProjectContext";
import { 
  tasks, salesOrders, purchaseOrders, 
  customerInvoices, vendorBills, expenses 
} from "@/data/staticData";
import { 
  ArrowLeft, FileText, ShoppingCart, Receipt, 
  CreditCard, Wallet, TrendingUp, ListTodo
} from "lucide-react";

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProject } = useProjects();
  const project = getProject(id || "");

  if (!project) {
    return <div>Project not found</div>;
  }

  const projectTasks = tasks.filter((t) => t.projectId === id);
  const projectSO = salesOrders.filter((s) => s.projectId === id);
  const projectPO = purchaseOrders.filter((p) => p.projectId === id);
  const projectInvoices = customerInvoices.filter((i) => i.projectId === id);
  const projectBills = vendorBills.filter((b) => b.projectId === id);
  const projectExpenses = expenses.filter((e) => e.projectId === id);

  const handleCreateSO = () => {
    setIsCreateSOOpen(true);
  };

  const handleCreatePO = () => {
    setIsCreatePOOpen(true);
  };

  const handleCreateInvoice = () => {
    setIsCreateInvoiceOpen(true);
  };

  const handleCreateBill = () => {
    setIsCreateBillOpen(true);
  };

  const handleSubmitExpense = () => {
    setIsCreateExpenseOpen(true);
  };

  const handleSaveSO = (data: any) => {
    const newSO: SalesOrder = {
      id: Date.now().toString(),
      projectId: id || "",
      ...data,
    };
    addSalesOrder(newSO);
    toast({
      title: "Sales Order created",
      description: "The sales order has been successfully created.",
    });
  };

  const handleSavePO = (data: any) => {
    const newPO: PurchaseOrder = {
      id: Date.now().toString(),
      projectId: id || "",
      ...data,
    };
    addPurchaseOrder(newPO);
    toast({
      title: "Purchase Order created",
      description: "The purchase order has been successfully created.",
    });
  };

  const handleSaveInvoice = (data: any) => {
    const newInvoice: CustomerInvoice = {
      id: Date.now().toString(),
      projectId: id || "",
      salesOrderId: data.salesOrderId || undefined,
      ...data,
    };
    addInvoice(newInvoice);
    toast({
      title: "Invoice created",
      description: "The invoice has been successfully created.",
    });
  };

  const handleSaveBill = (data: any) => {
    const newBill: VendorBill = {
      id: Date.now().toString(),
      projectId: id || "",
      purchaseOrderId: data.purchaseOrderId || undefined,
      ...data,
    };
    addBill(newBill);
    toast({
      title: "Vendor Bill created",
      description: "The vendor bill has been successfully created.",
    });
  };

  const handleSaveExpense = (data: any) => {
    const newExpense: Expense = {
      id: Date.now().toString(),
      projectId: id || "",
      ...data,
    };
    addExpense(newExpense);
    toast({
      title: "Expense submitted",
      description: "The expense has been successfully submitted.",
    });
  };

  const handleDeleteItem = (type: string, itemId: string) => {
    setItemToDelete({ type, id: itemId });
  };

  const handleDeleteItemConfirm = () => {
    if (itemToDelete) {
      switch (itemToDelete.type) {
        case "so":
          deleteSalesOrder(itemToDelete.id);
          toast({ title: "Sales Order deleted", description: "The sales order has been deleted." });
          break;
        case "po":
          deletePurchaseOrder(itemToDelete.id);
          toast({ title: "Purchase Order deleted", description: "The purchase order has been deleted." });
          break;
        case "invoice":
          deleteInvoice(itemToDelete.id);
          toast({ title: "Invoice deleted", description: "The invoice has been deleted." });
          break;
        case "bill":
          deleteBill(itemToDelete.id);
          toast({ title: "Vendor Bill deleted", description: "The vendor bill has been deleted." });
          break;
        case "expense":
          deleteExpense(itemToDelete.id);
          toast({ title: "Expense deleted", description: "The expense has been deleted." });
          break;
      }
      setItemToDelete(null);
    }
  };

  const handleCreateTask = () => {
    setIsCreateTaskOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    setTaskToDelete(taskId);
  };

  const handleDeleteConfirm = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete);
      toast({
        title: "Task deleted",
        description: "The task has been successfully deleted.",
      });
      setTaskToDelete(null);
    }
  };

  const totalRevenue = projectInvoices.reduce((sum, i) => sum + i.amount, 0);
  const totalCost = projectBills.reduce((sum, b) => sum + b.amount, 0) + 
                    projectExpenses.reduce((sum, e) => sum + e.amount, 0);
  const profit = totalRevenue - totalCost;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div>
              <Button 
                variant="ghost" 
                onClick={() => navigate("/projects")}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Projects
              </Button>

              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold">{project.name}</h1>
                  <p className="text-muted-foreground mt-1">{project.description}</p>
                </div>
                <Badge className="text-sm">
                  {project.status.replace("_", " ").toUpperCase()}
                </Badge>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">
                    ₹{(totalRevenue / 1000).toFixed(0)}k
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Cost
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">
                    ₹{(totalCost / 1000).toFixed(0)}k
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Profit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    ₹{(profit / 1000).toFixed(0)}k
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{project.progress}%</div>
                </CardContent>
              </Card>
            </div>

            {/* Links Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  <Button variant="outline" className="flex flex-col h-auto py-4">
                    <FileText className="h-5 w-5 mb-2" />
                    <span className="text-xs">Sales Orders</span>
                    <span className="text-lg font-bold">{projectSO.length}</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col h-auto py-4">
                    <ShoppingCart className="h-5 w-5 mb-2" />
                    <span className="text-xs">Purchase Orders</span>
                    <span className="text-lg font-bold">{projectPO.length}</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col h-auto py-4">
                    <Receipt className="h-5 w-5 mb-2" />
                    <span className="text-xs">Invoices</span>
                    <span className="text-lg font-bold">{projectInvoices.length}</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col h-auto py-4">
                    <CreditCard className="h-5 w-5 mb-2" />
                    <span className="text-xs">Vendor Bills</span>
                    <span className="text-lg font-bold">{projectBills.length}</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col h-auto py-4">
                    <Wallet className="h-5 w-5 mb-2" />
                    <span className="text-xs">Expenses</span>
                    <span className="text-lg font-bold">{projectExpenses.length}</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex flex-col h-auto py-4"
                    onClick={() => navigate(`/tasks?projectId=${id}`)}
                  >
                    <ListTodo className="h-5 w-5 mb-2" />
                    <span className="text-xs">Tasks</span>
                    <span className="text-lg font-bold">{projectTasks.length}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tabs for detailed views */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="so">Sales Orders</TabsTrigger>
                <TabsTrigger value="po">Purchase Orders</TabsTrigger>
                <TabsTrigger value="invoices">Invoices</TabsTrigger>
                <TabsTrigger value="bills">Bills</TabsTrigger>
                <TabsTrigger value="expenses">Expenses</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Manager</p>
                        <p className="font-medium">{project.manager}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Team Size</p>
                        <p className="font-medium">{project.team.length} members</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Start Date</p>
                        <p className="font-medium">{project.startDate}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">End Date</p>
                        <p className="font-medium">{project.endDate}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Budget Usage</p>
                      <Progress value={(project.spent / project.budget) * 100} />
                      <div className="flex justify-between text-sm mt-2">
                        <span>₹{(project.spent / 1000).toFixed(0)}k spent</span>
                        <span>₹{(project.budget / 1000).toFixed(0)}k budget</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="so">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Sales Orders</CardTitle>
                    <Button size="sm">Create SO</Button>
                  </CardHeader>
                  <CardContent>
                    {projectSO.length > 0 ? (
                      <div className="space-y-4">
                        {projectSO.map((so) => (
                          <div key={so.id} className="border border-border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{so.number}</p>
                                <p className="text-sm text-muted-foreground">{so.customer}</p>
                                <p className="text-xs text-muted-foreground mt-1">{so.description}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold">₹{(so.amount / 1000).toFixed(0)}k</p>
                                <Badge variant="outline" className="mt-1">{so.status}</Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No sales orders yet</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="po">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Purchase Orders</CardTitle>
                    <Button size="sm">Create PO</Button>
                  </CardHeader>
                  <CardContent>
                    {projectPO.length > 0 ? (
                      <div className="space-y-4">
                        {projectPO.map((po) => (
                          <div key={po.id} className="border border-border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{po.number}</p>
                                <p className="text-sm text-muted-foreground">{po.vendor}</p>
                                <p className="text-xs text-muted-foreground mt-1">{po.description}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold">₹{(po.amount / 1000).toFixed(0)}k</p>
                                <Badge variant="outline" className="mt-1">{po.status}</Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No purchase orders yet</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="invoices">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Customer Invoices</CardTitle>
                    <Button size="sm">Create Invoice</Button>
                  </CardHeader>
                  <CardContent>
                    {projectInvoices.length > 0 ? (
                      <div className="space-y-4">
                        {projectInvoices.map((inv) => (
                          <div key={inv.id} className="border border-border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{inv.number}</p>
                                <p className="text-sm text-muted-foreground">{inv.customer}</p>
                                <p className="text-xs text-muted-foreground mt-1">{inv.description}</p>
                                <p className="text-xs text-muted-foreground">Due: {inv.dueDate}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-success">₹{(inv.amount / 1000).toFixed(0)}k</p>
                                <Badge variant="outline" className="mt-1">{inv.status}</Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No invoices yet</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="bills">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Vendor Bills</CardTitle>
                    <Button size="sm">Create Bill</Button>
                  </CardHeader>
                  <CardContent>
                    {projectBills.length > 0 ? (
                      <div className="space-y-4">
                        {projectBills.map((bill) => (
                          <div key={bill.id} className="border border-border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{bill.number}</p>
                                <p className="text-sm text-muted-foreground">{bill.vendor}</p>
                                <p className="text-xs text-muted-foreground mt-1">{bill.description}</p>
                                <p className="text-xs text-muted-foreground">Due: {bill.dueDate}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-destructive">₹{(bill.amount / 1000).toFixed(0)}k</p>
                                <Badge variant="outline" className="mt-1">{bill.status}</Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No vendor bills yet</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="expenses">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Expenses</CardTitle>
                    <Button size="sm">Submit Expense</Button>
                  </CardHeader>
                  <CardContent>
                    {projectExpenses.length > 0 ? (
                      <div className="space-y-4">
                        {projectExpenses.map((exp) => (
                          <div key={exp.id} className="border border-border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{exp.category}</p>
                                <p className="text-sm text-muted-foreground">{exp.employee}</p>
                                <p className="text-xs text-muted-foreground mt-1">{exp.description}</p>
                                <div className="flex gap-2 mt-2">
                                  <Badge variant="outline">{exp.billable ? "Billable" : "Non-billable"}</Badge>
                                  <Badge variant="outline">{exp.status}</Badge>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold">₹{exp.amount.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">{exp.date}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No expenses yet</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tasks">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Tasks</CardTitle>
                    <Button size="sm">Create Task</Button>
                  </CardHeader>
                  <CardContent>
                    {projectTasks.length > 0 ? (
                      <div className="space-y-4">
                        {projectTasks.map((task) => (
                          <div key={task.id} className="border border-border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="font-medium">{task.title}</p>
                                <p className="text-sm text-muted-foreground">{task.description}</p>
                                <p className="text-xs text-muted-foreground mt-1">Assigned to: {task.assignee}</p>
                                <div className="flex gap-2 mt-2">
                                  <Badge variant="outline">{task.status}</Badge>
                                  <Badge variant="outline">{task.priority}</Badge>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-muted-foreground">Due: {task.dueDate}</p>
                                <p className="text-sm font-medium mt-1">{task.hoursLogged}h / {task.estimatedHours}h</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No tasks yet</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
