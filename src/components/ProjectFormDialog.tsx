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
import { Project } from "@/data/staticData";
import { useProjects } from "@/contexts/ProjectContext";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  status: z.enum(["planned", "in_progress", "completed", "on_hold"]),
  manager: z.string().min(1, "Manager is required"),
  team: z.array(z.string()),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(), // End date is now optional
  budget: z.number().min(0, "Budget must be positive"),
  spent: z.number().min(0).default(0),
  progress: z.number().min(0).max(100, "Progress must be between 0 and 100").default(0),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project | null;
}

interface TeamMember {
  name: string;
  timeSpent: number;
}

export function ProjectFormDialog({ open, onOpenChange, project }: ProjectFormDialogProps) {
  const { addProject, updateProject } = useProjects();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(
    project?.team.map(name => ({ name, timeSpent: 0 })) || []
  );
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberTime, setNewMemberTime] = useState("");

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "planned",
      manager: "",
      team: [],
      startDate: "",
      endDate: "",
      budget: 0,
      spent: 0,
      progress: 0,
    },
  });

  useEffect(() => {
    if (project) {
      form.reset({
        name: project.name,
        description: project.description,
        status: project.status,
        manager: project.manager,
        team: project.team,
        startDate: project.startDate,
        endDate: project.endDate,
        budget: project.budget,
        spent: project.spent,
        progress: project.progress,
      });
      setTeamMembers(project.team.map(name => ({ name, timeSpent: 0 })));
    } else {
      form.reset({
        name: "",
        description: "",
        status: "planned",
        manager: "",
        team: [],
        startDate: "",
        endDate: "",
        budget: 0,
        spent: 0,
        progress: 0,
      });
      setTeamMembers([]);
    }
    setNewMemberName("");
  }, [project, form]);

  const onSubmit = (data: ProjectFormValues) => {
    // Clean up empty endDate - convert empty string to undefined
    const cleanedData = {
      ...data,
      team: teamMembers.map(m => m.name),
      endDate: data.endDate && data.endDate.trim() !== "" ? data.endDate : undefined,
    };
    
    if (project) {
      // Update existing project
      updateProject(project.id, cleanedData);
    } else {
      // Create new project
      const newProject: Project = {
        ...cleanedData,
        id: Date.now().toString(),
      };
      addProject(newProject);
    }
    onOpenChange(false);
    form.reset();
    setTeamMembers([]);
    setNewMemberName("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{project ? "Edit Project" : "Create New Project"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter project name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter project description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                        <SelectItem value="planned">Planned</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="manager"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Manager</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter manager name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter budget"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="progress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Progress (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter progress"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => {}}>
                  Add User
                </Button>
                <Button type="button" variant="outline" onClick={() => {}}>
                  Add Task
                </Button>
                <Button type="button" variant="outline" onClick={() => {}}>
                  Add Expense
                </Button>
                <Button type="button" variant="outline" onClick={() => {}}>
                  Add Product
                </Button>
              </div>

              <div>
                <Label>Team Members</Label>
                <div className="border rounded-lg mt-2">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Time Spent</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teamMembers.map((member, index) => (
                        <TableRow key={index}>
                          <TableCell>{member.name}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={member.timeSpent}
                              onChange={(e) => {
                                const updated = [...teamMembers];
                                updated[index].timeSpent = parseFloat(e.target.value) || 0;
                                setTeamMembers(updated);
                              }}
                              className="w-24"
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setTeamMembers(teamMembers.filter((_, i) => i !== index));
                              }}
                            >
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Employee name"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (newMemberName.trim()) {
                          setTeamMembers([...teamMembers, { name: newMemberName.trim(), timeSpent: 0 }]);
                          setNewMemberName("");
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      if (newMemberName.trim()) {
                        setTeamMembers([...teamMembers, { name: newMemberName.trim(), timeSpent: 0 }]);
                        setNewMemberName("");
                      }
                    }}
                  >
                    Add new
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">{project ? "Save Changes" : "Create Project"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

