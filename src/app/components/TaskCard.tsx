'use client';

import { Task } from '@/domain/entities/Task';
import { updateTaskAction, deleteTaskAction } from '@/presentation/actions/task';
import { useState, useTransition } from 'react';
import clsx from 'clsx';
import { Trash2, Edit2, Calendar, Clock } from 'lucide-react';
import DeleteConfirmationModal from './DeleteModal';
import { useTranslation } from '@/hooks/useTranslation';

interface TaskCardProps {
  task: Task;
}

import { useTaskEditing } from '@/presentation/context/TaskEditingContext';
import { useRouter } from 'next/navigation';

export default function TaskCard({ task }: TaskCardProps) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { setEditingTask } = useTaskEditing();
  const router = useRouter();

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Check if desktop (md breakpoint is 768px)
    if (window.innerWidth >= 768) {
      setEditingTask(task);
    } else {
      router.push(`/tasks/${task.id}/edit`);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === task.status) return;

    const formData = new FormData();
    formData.append('title', task.title);
    formData.append('description', task.description || '');
    formData.append('status', newStatus);
    if (task.dueDate) {
      formData.append('dueDate', new Date(task.dueDate).toISOString());
    }

    startTransition(async () => {
      await updateTaskAction(task.id, null, formData);
    });
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    startTransition(async () => {
      await deleteTaskAction(task.id);
      setShowDeleteModal(false);
    });
  };

  const statusColors = {
    todo: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
    done: 'bg-green-100 text-green-800 border-green-200',
  };

  const isExpired = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  return (
    <div className="group relative glass-panel p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-white/50">
      <div className="flex justify-between items-start mb-3">
        <h3 className={clsx(
          "text-lg font-bold text-gray-800 transition-colors",
          task.status === 'done' && "line-through text-gray-500"
        )}>
          {task.title}
        </h3>

        {/* Quick Status Selector */}
        <div className="relative z-10">
          <select
            value={task.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={isPending}
            className={clsx(
              "appearance-none text-xs font-semibold px-3 py-1 rounded-full border cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all text-center min-w-25",
              statusColors[task.status as keyof typeof statusColors],
              isPending && "opacity-50 cursor-wait"
            )}
          >
            <option value="todo">{t('task.todo')}</option>
            <option value="in_progress">{t('task.inProgress')}</option>
            <option value="done">{t('task.done')}</option>
          </select>
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {task.description || <span className="italic text-gray-400">{t('task.no_description')}</span>}
      </p>

      <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
        <div className="flex items-center space-x-3 text-xs">
          {task.dueDate && (
            <div className={clsx(
              "flex items-center space-x-1 px-2 py-1 rounded-lg",
              isExpired ? "text-red-600 bg-red-50" : "text-gray-500 bg-gray-50"
            )}>
              <Calendar size={12} />
              <span className={clsx(isExpired && "font-bold")}>
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
              <Clock size={12} className="ml-1" />
              <span>
                {new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleEditClick}
            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
            title={t('common.edit')}
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={handleDeleteClick}
            disabled={isPending}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
            title={t('common.delete')}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title={t('task.delete_title')}
        message={t('task.delete_confirm', { title: task.title })}
        isDeleting={isPending}
      />
    </div>
  );
}
