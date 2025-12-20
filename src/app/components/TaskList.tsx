'use client';

import { Task } from '@/domain/entities/Task';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import { useTaskEditing } from '@/presentation/context/TaskEditingContext';
import { useTranslation } from '@/hooks/useTranslation';

interface TaskListProps {
  tasks: Task[];
}

export default function TaskList({ tasks }: TaskListProps) {
  const { editingTask } = useTaskEditing();
  const { t } = useTranslation();

  if (tasks.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500 bg-white/60 rounded-lg shadow-sm glass-panel">
        {t('task.emptyList')}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        editingTask?.id === task.id ? (
          <TaskForm key={task.id} task={task} isInline={true} />
        ) : (
          <TaskCard key={task.id} task={task} />
        )
      ))}
    </div>
  );
}
