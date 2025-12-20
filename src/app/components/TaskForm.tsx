'use client';

import { createTaskAction, updateTaskAction } from '@/presentation/actions/task';
import { useActionState } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Task } from '@/domain/entities/Task';
import { useTaskEditing } from '@/presentation/context/TaskEditingContext';
import { useTranslation } from '@/hooks/useTranslation';

const initialState: { error?: string; success?: boolean } = {
  error: '',
  success: false,
};

interface TaskFormProps {
  task?: Task;
  isInline?: boolean;
  disableContext?: boolean;
}

export default function TaskForm({ task: initialTask, isInline = false, disableContext = false }: TaskFormProps) {
  const { t } = useTranslation();
  const { editingTask, setEditingTask } = useTaskEditing();
  const activeTask = (!disableContext && editingTask) ? editingTask : initialTask;

  const action = activeTask ? updateTaskAction.bind(null, activeTask.id) : createTaskAction;
  const [state, formAction, isPending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  const initialDate = activeTask?.dueDate ? new Date(activeTask.dueDate) : null;

  const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate);
  const [selectedTime, setSelectedTime] = useState<string>(
    initialDate
      ? initialDate.toISOString().substring(11, 16) // HH:mm from ISO (UTC)
      : '12:00'
  );

  useEffect(() => {
    if (activeTask) {
      if (activeTask.dueDate) {
        const d = new Date(activeTask.dueDate);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedDate(d);
        setSelectedTime(d.toISOString().substring(11, 16));
      } else {
        setSelectedDate(null);
        setSelectedTime('12:00');
      }

      if (formRef.current) {
        const form = formRef.current;
        (form.elements.namedItem('title') as HTMLInputElement).value = activeTask.title;
        (form.elements.namedItem('description') as HTMLTextAreaElement).value = activeTask.description || '';
        (form.elements.namedItem('status') as HTMLSelectElement).value = activeTask.status;
      }
    } else {
      if (editingTask === null && !initialTask) {
        setSelectedDate(null);
        setSelectedTime('12:00');
        if (formRef.current) formRef.current.reset();
      }
    }
  }, [activeTask, editingTask, initialTask]);

  useEffect(() => {
    if (state?.success) {
      if (activeTask) {
        setEditingTask(null);
      }

      if (formRef.current) {
        formRef.current.reset();
        setTimeout(() => {
          setSelectedDate(null);
          setSelectedTime('12:00');
        }, 0);
      }
    }
  }, [state?.success, activeTask, setEditingTask]);

  const getHiddenValue = () => {
    if (!selectedDate) return '';

    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}T${selectedTime}`;
  };

  const getInputValue = () => {
    if (!selectedDate) return '';
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val) {
      const d = new Date(val);
      if (!isNaN(d.getTime())) {
        const userTimezoneOffset = d.getTimezoneOffset() * 60000;
        const adjustedDate = new Date(d.getTime() + userTimezoneOffset);
        setSelectedDate(adjustedDate);
      }
    } else {
      setSelectedDate(null);
    }
  };

  return (
    <div className={isInline
      ? "glass-panel p-5 rounded-2xl shadow-sm border border-purple-100 transition-all duration-300"
      : "glass-panel p-8 rounded-2xl shadow-xl transition-all duration-300"
    }>
      <div className={isInline ? "flex justify-end mb-2" : "flex justify-between items-center mb-6"}>
        {!isInline && (
          <h2 className="text-2xl font-bold text-purple-700 bg-clip-text bg-linear-to-r from-purple-700 to-indigo-600">
            {activeTask ? t('task.edit') : t('task.new')}
          </h2>
        )}
        {(activeTask || isInline) && (
          <button
            onClick={() => setEditingTask(null)}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            {t('common.cancel')}
          </button>
        )}
      </div>
      <form ref={formRef} action={formAction} className="space-y-5">
        <div>
          <label htmlFor="title" className="block mb-2 text-sm font-medium text-gray-700">{t('task.title')}</label>
          <input
            type="text"
            id="title"
            name="title"
            defaultValue={activeTask?.title || ''}
            placeholder={t('task.title_placeholder')}
            required
            className="bg-white/80 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5 py-3 shadow-sm placeholder-gray-400"
          />
        </div>

        <div>
          <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-700">{t('task.description')}</label>
          <textarea
            id="description"
            name="description"
            defaultValue={activeTask?.description || ''}
            placeholder={t('task.description_placeholder')}
            rows={4}
            className="bg-white/80 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5 py-3 shadow-sm placeholder-gray-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="default-datepicker" className="block mb-2 text-sm font-medium text-gray-700">{t('task.due_date')}</label>
            <div className="relative">
              <input
                type="date"
                id="default-datepicker"
                className="bg-white/80 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5 py-3 relative z-20"
                placeholder={t('task.select_date')}
                value={getInputValue()}
                onChange={handleDateChange}
                suppressHydrationWarning
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="time" className="block mb-2 text-sm font-medium text-gray-700">{t('task.time')}</label>
            <div className="relative">
              <div className="absolute inset-y-0 end-0 top-0 flex items-center pe-3.5 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="time"
                id="time"
                className="bg-white/80 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5 py-3"
                min="09:00"
                max="18:00"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Hidden input to submit the combined value */}
        <input type="hidden" name="dueDate" value={getHiddenValue()} />
        <p className="text-xs text-gray-500 mt-1">{t('task.future_date')}</p>

        <div>
          <label htmlFor="status" className="block mb-2 text-sm font-medium text-gray-700">{t('task.status')}</label>
          <select
            id="status"
            name="status"
            defaultValue={activeTask?.status || 'todo'}
            className="bg-white/80 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5 py-3 shadow-sm"
          >
            <option value="todo">{t('task.todo')}</option>
            <option value="in_progress">{t('task.inProgress')}</option>
            <option value="done">{t('task.done')}</option>
          </select>
        </div>

        {state?.error && (
          <div className="p-3 rounded-xl bg-red-50/80 border border-red-100 text-red-700 text-sm backdrop-blur-sm">
            {state.error}
          </div>
        )}

        {state?.success && (
          <div className="p-3 rounded-xl bg-green-50/80 border border-green-100 text-green-700 text-sm backdrop-blur-sm">
            {activeTask ? t('task.updated') : t('task.created')}
          </div>
        )}

        <button
          type="submit"
          className="w-full shadow-lg shadow-indigo-500/20 bg-linear-to-r from-purple-600 to-blue-600 border-none text-white hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:-translate-y-1 py-1 rounded-lg"
          disabled={isPending}
        >
          <span className="text-base font-semibold py-2 block">
            {activeTask ? t('task.update') : t('task.add')}
          </span>
        </button>
      </form>
    </div>
  );
}