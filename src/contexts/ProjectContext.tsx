import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Project } from "@/data/staticData";
import { projects as initialProjects } from "@/data/staticData";

interface ProjectContextType {
  projects: Project[];
  addProject: (project: Project) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  getProject: (id: string) => Project | undefined;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProjects must be used within a ProjectProvider");
  }
  return context;
};

interface ProjectProviderProps {
  children: ReactNode;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(() => {
    // Load from localStorage or use initial data
    const stored = localStorage.getItem("projects");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return initialProjects;
      }
    }
    return initialProjects;
  });

  useEffect(() => {
    localStorage.setItem("projects", JSON.stringify(projects));
  }, [projects]);

  const addProject = (project: Project) => {
    setProjects((prev) => [...prev, project]);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const getProject = (id: string) => {
    return projects.find((p) => p.id === id);
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        addProject,
        updateProject,
        deleteProject,
        getProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

