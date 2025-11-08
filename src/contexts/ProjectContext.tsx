// src/contexts/ProjectContext.tsx
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from './AuthContext'; // To re-fetch on login

// Define your Project type
export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold';
  // Add other fields from your model
}

type NewProjectData = Omit<Project, 'id'>;

interface ProjectContextType {
  projects: Project[];
  isLoading: boolean;
  fetchProjects: () => Promise<void>;
  addProject: (projectData: NewProjectData) => Promise<Project | void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<Project | void>;
  deleteProject: (id: string) => Promise<void>;
  getProjectById: (id: string) => Project | undefined;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth(); // Get auth state

  const fetchProjects = useCallback(async () => {
    if (!isAuthenticated) return; // Don't fetch if not logged in
    setIsLoading(true);
    try {
      const data = await api<Project[]>('/api/projects/');
      setProjects(data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      setProjects([]); // Clear projects on error
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const addProject = async (projectData: NewProjectData) => {
    try {
      const newProject = await api<Project>('/api/projects/', {
        method: 'POST',
        body: JSON.stringify(projectData),
      });
      setProjects((prev) => [...prev, newProject]);
      return newProject;
    } catch (error) {
      console.error('Failed to add project:', error);
      // Here you should show a toast to the user
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    // Optimistic UI update
    const originalProjects = projects;
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );

    try {
      const updatedProject = await api<Project>(`/api/projects/${id}/`, {
        method: 'PATCH', // Use PATCH for partial updates
        body: JSON.stringify(updates),
      });
      // Replace with confirmed data from server
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? updatedProject : p))
      );
      return updatedProject;
    } catch (error) {
      console.error('Failed to update project:', error);
      setProjects(originalProjects); // Rollback
    }
  };

  const deleteProject = async (id: string) => {
    // Optimistic UI update
    const originalProjects = projects;
    setProjects((prev) => prev.filter((p) => p.id !== id));

    try {
      await api(`/api/projects/${id}/`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to delete project:', error);
      setProjects(originalProjects); // Rollback
    }
  };

  const getProjectById = (id: string) => {
    return projects.find((p) => p.id === id);
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        isLoading,
        fetchProjects,
        addProject,
        updateProject,
        deleteProject,
        getProjectById,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};