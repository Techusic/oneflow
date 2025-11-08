import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  endDate: z.string().min(1, "End date is required"),
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

export function ProjectFormDialog({ open, onOpenChange, project }: ProjectFormDialogProps) {
  const { addProject, updateProject } = useProjects();
  const [teamMembers, setTeamMembers] = useState<string[]>(project?.team || []);

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
      setTeamMembers(project.team);
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
  }, [project, form]);

  const onSubmit = (data: ProjectFormValues) => {
    if (project) {
      // Update existing project
      updateProject(project.id, data);
    } else {
      // Create new project
      const newProject: Project = {
        ...data,
        id: Date.now().toString(),
      };
      addProject(newProject);
    }
    onOpenChange(false);
    form.reset();
    setTeamMembers([]);
  };

  const addTeamMember = () => {
    const input = document.getElementById("team-member-input") as HTMLInputElement;
    if (input && input.value.trim()) {
      const newMember = input.value.trim();
      if (!teamMembers.includes(newMember)) {
        const updated = [...teamMembers, newMember];
        setTeamMembers(updated);
        form.setValue("team", updated);
        input.value = "";
      }
    }
  };

  const removeTeamMember = (member: string) => {
    const updated = teamMembers.filter((m) => m !== member);
    setTeamMembers(updated);
    form.setValue("team", updated);
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
                    <FormLabel>End Date</FormLabel>
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

            <div>
              <Label>Team Members</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="team-member-input"
                  placeholder="Enter team member name"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTeamMember();
                    }
                  }}
                />
                <Button type="button" onClick={addTeamMember}>
                  Add
                </Button>
              </div>
              {teamMembers.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {teamMembers.map((member) => (
                    <div
                      key={member}
                      className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm"
                    >
                      <span>{member}</span>
                      <button
                        type="button"
                        onClick={() => removeTeamMember(member)}
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
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

