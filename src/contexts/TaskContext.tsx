// src/contexts/TaskContext.tsx
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from './AuthContext';

// Define your Task type
export interface Task {
  id: string;
  name: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'in_review' | 'done';
  priority: 'low' | 'medium' | 'high';
  projectId: string;
  assigneeId?: string;
  due_date?: string;
}

type NewTaskData = Omit<Task, 'id'>;

interface TaskContextType {
  tasks: Task[];
  isLoading: boolean;
  fetchTasks: () => Promise<void>;
  addTask: (taskData: NewTaskData) => Promise<Task | void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<Task | void>;
  deleteTask: (id: string) => Promise<void>;
  getTasksByProject: (projectId: string) => Task[];
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  const fetchTasks = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const data = await api<Task[]>('/api/tasks/');
      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async (taskData: NewTaskData) => {
    try {
      const newTask = await api<Task>('/api/tasks/', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });
      setTasks((prev) => [...prev, newTask]);
      return newTask;
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const originalTasks = tasks;
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );

    try {
      const updatedTask = await api<Task>(`/api/tasks/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? updatedTask : t))
      );
      return updatedTask;
    } catch (error) {
      console.error('Failed to update task:', error);
      setTasks(originalTasks);
    }
  };

  const deleteTask = async (id: string) => {
    const originalTasks = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== id));

    try {
      await api(`/api/tasks/${id}/`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to delete task:', error);
      setTasks(originalTasks);
    }
  };

  const getTasksByProject = (projectId: string) => {
    return tasks.filter((t) => t.projectId === projectId);
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        isLoading,
        fetchTasks,
        addTask,
        updateTask,
        deleteTask,
        getTasksByProject,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};