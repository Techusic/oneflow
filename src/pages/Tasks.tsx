import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useProjects } from "@/contexts/ProjectContext";
import { useTasks } from "@/contexts/TaskContext";
import { Task } from "@/data/staticData";
import { TaskFormDialog } from "@/components/TaskFormDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Clock, ArrowLeft, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

export default function Tasks() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");
  const navigate = useNavigate();
  const { getProject } = useProjects();
  const { tasks, updateTask, addTask, deleteTask } = useTasks();
  const [filter, setFilter] = useState("all");
  const [hoursLog, setHoursLog] = useState<{ [key: string]: string }>({});
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  // Filter tasks by project if projectId is in URL
  let filteredTasks = tasks;
  
  if (projectId) {
    filteredTasks = tasks.filter((t) => t.projectId === projectId);
  }

  // Apply additional filters
  if (filter !== "all") {
    filteredTasks = filter === "my_tasks"
      ? filteredTasks.filter((t) => t.assignee === "Team Member")
      : filteredTasks.filter((t) => t.status === filter);
  }

  const getProjectName = (projectId: string) => {
    return getProject(projectId)?.name || "Unknown Project";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-secondary text-secondary-foreground";
      case "in_progress": return "bg-primary text-primary-foreground";
      case "blocked": return "bg-destructive text-destructive-foreground";
      case "done": return "bg-success text-success-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-destructive text-destructive-foreground";
      case "medium": return "bg-warning text-warning-foreground";
      case "low": return "bg-secondary text-secondary-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handleLogHours = (taskId: string) => {
    const hours = parseFloat(hoursLog[taskId]);
    if (hours && hours > 0) {
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        updateTask(taskId, { hoursLogged: task.hoursLogged + hours });
        toast({
          title: "Hours logged",
          description: `Logged ${hours} hours for task`,
        });
        setHoursLog((prev) => ({ ...prev, [taskId]: "" }));
      }
    }
  };

  const handleStatusChange = (taskId: string, newStatus: Task["status"]) => {
    updateTask(taskId, { status: newStatus });
    toast({
      title: "Status updated",
      description: `Task status changed to ${newStatus.replace("_", " ")}`,
    });
  };

  const handleCreateTask = () => {
    if (projectId) {
      // Navigate to create task with projectId
      setIsCreateTaskOpen(true);
    } else {
      setIsCreateTaskOpen(true);
    }
  };

  const handleDeleteClick = (taskId: string) => {
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-4">
                  {projectId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/projects/${projectId}`)}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Project
                    </Button>
                  )}
                  <div>
                    <h1 className="text-3xl font-bold">Tasks</h1>
                    <p className="text-muted-foreground mt-1">
                      {projectId 
                        ? `Tasks for ${getProjectName(projectId)}`
                        : "Track and manage all project tasks"}
                    </p>
                  </div>
                </div>
              </div>
              <Button onClick={handleCreateTask}>
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                onClick={() => setFilter("all")}
              >
                All Tasks
              </Button>
              <Button
                variant={filter === "my_tasks" ? "default" : "outline"}
                onClick={() => setFilter("my_tasks")}
              >
                My Tasks
              </Button>
              <Button
                variant={filter === "new" ? "default" : "outline"}
                onClick={() => setFilter("new")}
              >
                New
              </Button>
              <Button
                variant={filter === "in_progress" ? "default" : "outline"}
                onClick={() => setFilter("in_progress")}
              >
                In Progress
              </Button>
              <Button
                variant={filter === "blocked" ? "default" : "outline"}
                onClick={() => setFilter("blocked")}
              >
                Blocked
              </Button>
              <Button
                variant={filter === "done" ? "default" : "outline"}
                onClick={() => setFilter("done")}
              >
                Done
              </Button>
            </div>

            {/* Task Board - Kanban Style */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* New Column */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">New</h3>
                  <Badge variant="secondary">{filteredTasks.filter(t => t.status === "new").length}</Badge>
                </div>
                <div className="space-y-3">
                  {filteredTasks.filter(t => t.status === "new").map((task) => (
                    <Card key={task.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex gap-2">
                            <Badge className={getStatusColor(task.status)}>
                              {task.status.replace("_", " ").toUpperCase()}
                            </Badge>
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority.toUpperCase()}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteClick(task.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <CardTitle className="text-base">{task.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {getProjectName(task.projectId)}
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-3 pt-0">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {task.description}
                        </p>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Assignee:</span>
                            <span className="font-medium">{task.assignee}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Due:</span>
                            <span className="font-medium">{task.dueDate}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Hours:</span>
                            <span className="font-medium">
                              {task.hoursLogged}h / {task.estimatedHours}h
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            placeholder="Log hours"
                            value={hoursLog[task.id] || ""}
                            onChange={(e) =>
                              setHoursLog((prev) => ({ ...prev, [task.id]: e.target.value }))
                            }
                            className="flex-1"
                          />
                          <Button 
                            size="sm" 
                            onClick={() => handleLogHours(task.id)}
                            disabled={!hoursLog[task.id]}
                          >
                            <Clock className="h-4 w-4" />
                          </Button>
                        </div>
                        {task.status === "new" && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-full"
                            onClick={() => handleStatusChange(task.id, "in_progress")}
                          >
                            Start
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* In Progress Column */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">In Progress</h3>
                  <Badge variant="secondary">{filteredTasks.filter(t => t.status === "in_progress").length}</Badge>
                </div>
                <div className="space-y-3">
                  {filteredTasks.filter(t => t.status === "in_progress").map((task) => (
                    <Card key={task.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex gap-2">
                            <Badge className={getStatusColor(task.status)}>
                              {task.status.replace("_", " ").toUpperCase()}
                            </Badge>
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority.toUpperCase()}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteClick(task.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <CardTitle className="text-base">{task.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {getProjectName(task.projectId)}
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-3 pt-0">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {task.description}
                        </p>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Assignee:</span>
                            <span className="font-medium">{task.assignee}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Due:</span>
                            <span className="font-medium">{task.dueDate}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Hours:</span>
                            <span className="font-medium">
                              {task.hoursLogged}h / {task.estimatedHours}h
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            placeholder="Log hours"
                            value={hoursLog[task.id] || ""}
                            onChange={(e) =>
                              setHoursLog((prev) => ({ ...prev, [task.id]: e.target.value }))
                            }
                            className="flex-1"
                          />
                          <Button 
                            size="sm" 
                            onClick={() => handleLogHours(task.id)}
                            disabled={!hoursLog[task.id]}
                          >
                            <Clock className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => handleStatusChange(task.id, "blocked")}
                          >
                            Block
                          </Button>
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleStatusChange(task.id, "done")}
                          >
                            Complete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Done Column */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Done</h3>
                  <Badge variant="secondary">{filteredTasks.filter(t => t.status === "done").length}</Badge>
                </div>
                <div className="space-y-3">
                  {filteredTasks.filter(t => t.status === "done").map((task) => (
                    <Card key={task.id} className="hover:shadow-lg transition-shadow cursor-pointer opacity-75">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex gap-2">
                            <Badge className={getStatusColor(task.status)}>
                              {task.status.replace("_", " ").toUpperCase()}
                            </Badge>
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority.toUpperCase()}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteClick(task.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <CardTitle className="text-base">{task.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {getProjectName(task.projectId)}
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-3 pt-0">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {task.description}
                        </p>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Assignee:</span>
                            <span className="font-medium">{task.assignee}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Due:</span>
                            <span className="font-medium">{task.dueDate}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Hours:</span>
                            <span className="font-medium">
                              {task.hoursLogged}h / {task.estimatedHours}h
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Legacy Grid View (hidden, kept for reference) */}
            <div className="hidden grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTasks.map((task) => (
                <Card key={task.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex gap-2">
                        <Badge className={getStatusColor(task.status)}>
                          {task.status.replace("_", " ").toUpperCase()}
                        </Badge>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority.toUpperCase()}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteClick(task.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardTitle className="text-lg">{task.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {getProjectName(task.projectId)}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {task.description}
                    </p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Assignee:</span>
                        <span className="font-medium">{task.assignee}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Due Date:</span>
                        <span className="font-medium">{task.dueDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Hours:</span>
                        <span className="font-medium">
                          {task.hoursLogged}h / {task.estimatedHours}h
                        </span>
                      </div>
                    </div>

                    {/* Log Hours */}
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Log hours"
                        value={hoursLog[task.id] || ""}
                        onChange={(e) =>
                          setHoursLog((prev) => ({ ...prev, [task.id]: e.target.value }))
                        }
                      />
                      <Button 
                        size="sm" 
                        onClick={() => handleLogHours(task.id)}
                        disabled={!hoursLog[task.id]}
                      >
                        <Clock className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Status Change Buttons */}
                    <div className="flex gap-2">
                      {task.status === "new" && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => handleStatusChange(task.id, "in_progress")}
                        >
                          Start
                        </Button>
                      )}
                      {task.status === "in_progress" && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => handleStatusChange(task.id, "blocked")}
                          >
                            Block
                          </Button>
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleStatusChange(task.id, "done")}
                          >
                            Complete
                          </Button>
                        </>
                      )}
                      {task.status === "blocked" && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => handleStatusChange(task.id, "in_progress")}
                        >
                          Unblock
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
      <TaskFormDialog 
        open={isCreateTaskOpen} 
        onOpenChange={setIsCreateTaskOpen}
        defaultProjectId={projectId || undefined}
      />
      <AlertDialog open={!!taskToDelete} onOpenChange={(open) => !open && setTaskToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
