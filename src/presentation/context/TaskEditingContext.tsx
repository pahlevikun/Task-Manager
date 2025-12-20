'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';
import { Task } from '@/domain/entities/Task';
import { clientContainer } from '@/services/client/client_container';
import { TaskEditingService } from '@/services/client/TaskEditingService';

/**
 * TaskEditingContext
 * Instead of managing state directly, this Provider now acts as a bridge
 * between the Component Tree and the Awilix-injected TaskEditingService.
 */

interface TaskEditingContextType {
  editingTask: Task | null;
  setEditingTask: (task: Task | null) => void;
}

export const TaskEditingContext = createContext<TaskEditingContextType | undefined>(undefined);

export function TaskEditingProvider({ children }: { children: ReactNode }) {
  const taskService = useMemo(() => clientContainer.resolve<TaskEditingService>('taskEditingService'), []);
  const [editingTask, setEditingTaskState] = useState<Task | null>(taskService.editingTask);

  useEffect(() => {
    const unsubscribe = taskService.subscribe((task) => {
      setEditingTaskState(task);
    });

    return () => {
      unsubscribe();
    };
  }, [taskService]);

  const setEditingTask = (task: Task | null) => {
    taskService.setEditingTask(task);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const value = useMemo(() => ({ editingTask, setEditingTask }), [editingTask]);

  return (
    <TaskEditingContext.Provider value={value}>
      {children}
    </TaskEditingContext.Provider>
  );
}

export function useTaskEditing() {
  const context = useContext(TaskEditingContext);
  if (context === undefined) {
    throw new Error('useTaskEditing must be used within a TaskEditingProvider');
  }
  return context;
}
