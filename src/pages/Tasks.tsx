import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useProjects } from "@/contexts/ProjectContext";
import { tasks } from "@/data/staticData";
import { Plus, Clock, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Tasks() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");
  const navigate = useNavigate();
  const { getProject } = useProjects();
  const [filter, setFilter] = useState("all");
  const [hoursLog, setHoursLog] = useState<{ [key: string]: string }>({});

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
    const hours = hoursLog[taskId];
    if (hours) {
      alert(`Logged ${hours} hours for task ${taskId}`);
      setHoursLog((prev) => ({ ...prev, [taskId]: "" }));
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
              <Button>
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

            {/* Task Board */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTasks.map((task) => (
                <Card key={task.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge className={getStatusColor(task.status)}>
                        {task.status.replace("_", " ").toUpperCase()}
                      </Badge>
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority.toUpperCase()}
                      </Badge>
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
                        <Button size="sm" variant="outline" className="flex-1">
                          Start
                        </Button>
                      )}
                      {task.status === "in_progress" && (
                        <>
                          <Button size="sm" variant="outline" className="flex-1">
                            Block
                          </Button>
                          <Button size="sm" className="flex-1">
                            Complete
                          </Button>
                        </>
                      )}
                      {task.status === "blocked" && (
                        <Button size="sm" variant="outline" className="flex-1">
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
    </div>
  );
}
