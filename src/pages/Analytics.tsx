import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { projects, tasks, customerInvoices, vendorBills, expenses } from "@/data/staticData";
import { TrendingUp, Users, Clock, DollarSign } from "lucide-react";

export default function Analytics() {
  const totalProjects = projects.length;
  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const totalTasks = tasks.length;
  const totalHours = tasks.reduce((sum, t) => sum + t.hoursLogged, 0);
  const billableHours = tasks.reduce((sum, t) => sum + t.hoursLogged, 0);

<<<<<<< HEAD
  // Calculate KPIs
  const analytics = useMemo(() => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter((p) => p.status === "in_progress").length;
    const completedProjects = projects.filter((p) => p.status === "completed").length;
    
    const completedTasks = tasks.filter((t) => t.status === "done").length;
    const totalTasks = tasks.length;
    const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    const totalHours = tasks.reduce((sum, t) => sum + t.hoursLogged, 0);
    const totalEstimatedHours = tasks.reduce((sum, t) => sum + t.estimatedHours, 0);
    const hoursUtilization = totalEstimatedHours > 0 ? (totalHours / totalEstimatedHours) * 100 : 0;
    
  // (billable vs non-billable removed — use categories instead)
    
    // Financial calculations
    const totalRevenue = invoices.reduce((sum, i) => sum + i.amount, 0);
    const totalBills = bills.reduce((sum, b) => sum + b.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalCost = totalBills + totalExpenses;
    const profit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : (totalCost > 0 ? -100 : 0);
    
    // Budget analysis
    const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
    const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0);
    const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    const budgetRemaining = totalBudget - totalSpent;
    
    // Resource utilization by team member - calculated from actual project data
    const teamMemberHours: Record<string, number> = {};
    const teamMemberProjects: Record<string, Set<string>> = {};
    
    // Calculate hours from tasks
    tasks.forEach((task) => {
      if (!teamMemberHours[task.assignee]) {
        teamMemberHours[task.assignee] = 0;
        teamMemberProjects[task.assignee] = new Set();
      }
      teamMemberHours[task.assignee] += task.hoursLogged;
      teamMemberProjects[task.assignee].add(task.projectId);
    });
    
    // Calculate hours from project team assignments
    projects.forEach((project) => {
      project.team.forEach((member) => {
        if (!teamMemberHours[member]) {
          teamMemberHours[member] = 0;
          teamMemberProjects[member] = new Set();
        }
        teamMemberProjects[member].add(project.id);
      });
    });
    
    // Calculate utilization based on actual project timelines
    const now = new Date();
    const resourceUtilization = Object.entries(teamMemberHours).map(([name, hours]) => {
      // Calculate available hours based on projects this member is assigned to
      const memberProjects = Array.from(teamMemberProjects[name] || [])
        .map((pid) => projects.find((p) => p.id === pid))
        .filter((p): p is NonNullable<typeof p> => p !== undefined);
      
      // Calculate total available hours based on project timelines
      let totalAvailableHours = 0;
      memberProjects.forEach((project) => {
        const startDate = new Date(project.startDate);
        const endDate = project.endDate ? new Date(project.endDate) : now;
        const projectEnd = endDate > now ? now : endDate;
        
        if (projectEnd >= startDate) {
          // Calculate weeks in project
          const daysDiff = Math.max(0, Math.ceil((projectEnd.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
          const weeksInProject = daysDiff / 7;
          // Assume 40 hours per week per project
          totalAvailableHours += weeksInProject * 40;
        }
      });
      
      // If no projects, use a default calculation based on current month
      if (totalAvailableHours === 0) {
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        totalAvailableHours = (daysInMonth / 7) * 40;
      }
      
      const utilization = totalAvailableHours > 0 
        ? Math.min((hours / totalAvailableHours) * 100, 100)
        : 0;
      
      return {
        name,
        utilization,
        hours,
        projects: memberProjects.length,
      };
    }).sort((a, b) => b.hours - a.hours);
    
    // Project progress data
    const projectProgress = projects.map((p) => ({
      name: p.name,
      progress: p.progress,
      budget: p.budget,
      spent: p.spent,
      status: p.status,
    }));
    
    // Expense categories breakdown
    const expenseByCategory: Record<string, number> = {};
    expenses.forEach((exp) => {
      if (!expenseByCategory[exp.category]) {
        expenseByCategory[exp.category] = 0;
      }
      expenseByCategory[exp.category] += exp.amount;
    });
    
    // Revenue by project - integrated with actual project data
    const revenueByProject: Record<string, { amount: number; projectName: string }> = {};
    invoices.forEach((inv) => {
      const project = projects.find((p) => p.id === inv.projectId);
      if (!revenueByProject[inv.projectId]) {
        revenueByProject[inv.projectId] = {
          amount: 0,
          projectName: project?.name || "Unknown Project",
        };
      }
      revenueByProject[inv.projectId].amount += inv.amount;
    });
    
    // Cost by project - integrated with actual project data
    const costByProject: Record<string, { amount: number; projectName: string; bills: number; expenses: number }> = {};
    bills.forEach((bill) => {
      const project = projects.find((p) => p.id === bill.projectId);
      if (!costByProject[bill.projectId]) {
        costByProject[bill.projectId] = {
          amount: 0,
          projectName: project?.name || "Unknown Project",
          bills: 0,
          expenses: 0,
        };
      }
      costByProject[bill.projectId].amount += bill.amount;
      costByProject[bill.projectId].bills += bill.amount;
    });
    expenses.forEach((exp) => {
      const project = projects.find((p) => p.id === exp.projectId);
      if (!costByProject[exp.projectId]) {
        costByProject[exp.projectId] = {
          amount: 0,
          projectName: project?.name || "Unknown Project",
          bills: 0,
          expenses: 0,
        };
      }
      costByProject[exp.projectId].amount += exp.amount;
      costByProject[exp.projectId].expenses += exp.amount;
    });
    
    // Project financial summary - combining revenue and costs
    const projectFinancialSummary = projects.map((project) => {
      const revenue = revenueByProject[project.id]?.amount || 0;
      const cost = costByProject[project.id]?.amount || 0;
      const projectProfit = revenue - cost;
      const projectMargin = revenue > 0 ? (projectProfit / revenue) * 100 : 0;
      
      return {
        projectId: project.id,
        projectName: project.name,
        revenue,
        cost,
        profit: projectProfit,
        margin: projectMargin,
        budget: project.budget,
        spent: project.spent,
        budgetUtilization: project.budget > 0 ? (project.spent / project.budget) * 100 : 0,
      };
    });
    
    // Sales orders vs invoices
    const totalSalesOrders = salesOrders.length;
    const confirmedSalesOrders = salesOrders.filter((so) => so.status === "confirmed" || so.status === "invoiced").length;
    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter((inv) => inv.status === "paid").length;
    
    // Purchase orders vs bills
    const totalPurchaseOrders = purchaseOrders.length;
    const confirmedPurchaseOrders = purchaseOrders.filter((po) => po.status === "confirmed" || po.status === "billed").length;
    const totalBillsCount = bills.length;
    const paidBills = bills.filter((bill) => bill.status === "paid").length;
    
    return {
      totalProjects,
      activeProjects,
      completedProjects,
      completedTasks,
      totalTasks,
      taskCompletionRate,
      totalHours,
      totalEstimatedHours,
      hoursUtilization,
  // billableExpenseAmount and nonBillableExpenseAmount removed — categories are the source of truth
      totalRevenue,
      totalBills,
      totalExpenses,
      totalCost,
      profit,
      profitMargin,
      totalBudget,
      totalSpent,
      budgetUtilization,
      budgetRemaining,
      resourceUtilization,
      projectProgress,
      expenseByCategory,
      revenueByProject,
      costByProject,
      projectFinancialSummary,
      totalSalesOrders,
      confirmedSalesOrders,
      totalInvoices,
      paidInvoices,
      totalPurchaseOrders,
      confirmedPurchaseOrders,
      totalBillsCount,
      paidBills,
    };
  }, [projects, tasks, invoices, bills, expenses, salesOrders, purchaseOrders]);
=======
  const totalRevenue = customerInvoices.reduce((sum, i) => sum + i.amount, 0);
  const totalCost = vendorBills.reduce((sum, b) => sum + b.amount, 0) + 
                    expenses.reduce((sum, e) => sum + e.amount, 0);
  const profit = totalRevenue - totalCost;

  const projectProgress = projects.map((p) => ({
    name: p.name,
    progress: p.progress,
  }));

  const resourceUtilization = [
    { name: "Designer", utilization: 85 },
    { name: "Developer", utilization: 92 },
    { name: "QA Engineer", utilization: 70 },
    { name: "Team Member", utilization: 65 },
  ];
>>>>>>> parent of eb607d3 (Working Update 1)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Analytics</h1>
              <p className="text-muted-foreground mt-1">
                Track performance and insights
              </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Projects
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalProjects}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {projects.filter((p) => p.status === "in_progress").length} active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Tasks Completed
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {completedTasks}/{totalTasks}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {((completedTasks / totalTasks) * 100).toFixed(0)}% completion rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Hours Logged
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalHours}h</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {billableHours}h billable
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Net Profit
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">
                    ₹{(profit / 1000).toFixed(0)}k
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {((profit / totalRevenue) * 100).toFixed(0)}% margin
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Project Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {projectProgress.map((p) => (
                    <div key={p.name} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{p.name}</span>
                        <span className="text-muted-foreground">{p.progress}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary rounded-full h-2 transition-all"
                          style={{ width: `${p.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Resource Utilization */}
              <Card>
                <CardHeader>
                  <CardTitle>Resource Utilization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {resourceUtilization.map((r) => (
                    <div key={r.name} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{r.name}</span>
                        <span className="text-muted-foreground">{r.utilization}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`rounded-full h-2 transition-all ${
                            r.utilization > 85
                              ? "bg-destructive"
                              : r.utilization > 70
                              ? "bg-warning"
                              : "bg-success"
                          }`}
                          style={{ width: `${r.utilization}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Financial Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Financial Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Revenue</span>
                      <span className="font-bold text-success">
                        ₹{(totalRevenue / 1000).toFixed(0)}k
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Cost</span>
                      <span className="font-bold text-destructive">
                        ₹{(totalCost / 1000).toFixed(0)}k
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-border">
                      <span className="font-medium">Net Profit</span>
                      <span className="font-bold text-primary">
                        ₹{(profit / 1000).toFixed(0)}k
                      </span>
                    </div>
                  </div>
                  <div className="pt-4">
                    <p className="text-sm text-muted-foreground mb-2">Profit Margin</p>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div
                        className="bg-success rounded-full h-3 transition-all"
                        style={{ width: `${(profit / totalRevenue) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 text-right">
                      {((profit / totalRevenue) * 100).toFixed(1)}%
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Billable vs Non-billable */}
              <Card>
                <CardHeader>
                  <CardTitle>Billable vs Non-billable Hours</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
<<<<<<< HEAD
                  {Object.keys(analytics.expenseByCategory).length > 0 ? (
                    <>
                      {Object.entries(analytics.expenseByCategory)
                        .sort(([, a], [, b]) => b - a)
                        .map(([category, amount]) => {
                          const percentage = analytics.totalExpenses > 0 
                            ? (amount / analytics.totalExpenses) * 100 
                            : 0;
                          return (
                            <div key={category} className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="font-medium">{category}</span>
                                <span className="text-muted-foreground">₹{(amount / 1000).toFixed(0)}k</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div
                                  className="bg-primary rounded-full h-2 transition-all"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No expenses yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Additional Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Project Financial Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Financial Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analytics.projectFinancialSummary.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {analytics.projectFinancialSummary
                        .filter((p) => p.revenue > 0 || p.cost > 0)
                        .sort((a, b) => b.revenue - a.revenue)
                        .map((project) => (
                          <div key={project.projectId} className="space-y-2 border-b pb-3 last:border-0">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-sm">{project.projectName}</span>
                              <Badge variant={project.profit >= 0 ? "default" : "destructive"} className="text-xs">
                                ₹{(project.profit / 1000).toFixed(0)}k
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                              <div>
                                <span>Revenue: </span>
                                <span className="font-medium text-success">₹{(project.revenue / 1000).toFixed(0)}k</span>
                              </div>
                              <div>
                                <span>Cost: </span>
                                <span className="font-medium text-destructive">₹{(project.cost / 1000).toFixed(0)}k</span>
                              </div>
                            </div>
                            {project.revenue > 0 && (
                              <div className="space-y-1">
                                <div className="w-full bg-muted rounded-full h-1.5">
                                  <div
                                    className={`rounded-full h-1.5 transition-all ${
                                      project.margin >= 0 ? "bg-success" : "bg-destructive"
                                    }`}
                                    style={{ width: `${Math.min(Math.abs(project.margin), 100)}%` }}
                                  />
                                </div>
                                <p className="text-xs text-muted-foreground text-right">
                                  Margin: {project.margin >= 0 ? "+" : ""}{project.margin.toFixed(1)}%
                                </p>
                              </div>
                            )}
                            {project.revenue === 0 && project.cost > 0 && (
                              <div className="text-xs text-muted-foreground">
                                No revenue yet (Cost: ₹{(project.cost / 1000).toFixed(0)}k)
                              </div>
                            )}
                          </div>
                        ))}
                      {analytics.projectFinancialSummary.filter((p) => p.revenue > 0 || p.cost > 0).length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No financial data for projects yet</p>
=======
                  <div className="flex items-center justify-center h-48">
                    <div className="text-center">
                      <div className="text-4xl font-bold">{totalHours}h</div>
                      <p className="text-muted-foreground mt-2">Total Hours Logged</p>
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-3 h-3 rounded-full bg-success" />
                          <span className="text-sm">Billable: {billableHours}h</span>
                        </div>
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-3 h-3 rounded-full bg-muted" />
                          <span className="text-sm">Non-billable: 0h</span>
>>>>>>> parent of eb607d3 (Working Update 1)
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
