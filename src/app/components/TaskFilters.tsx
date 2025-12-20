import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';

interface TaskFiltersProps {
  currentStatus?: string;
}

export default function TaskFilters({ currentStatus }: TaskFiltersProps) {
  const { t } = useTranslation();
  const filters = [
    { label: t('common.all'), value: undefined },
    { label: t('task.todo'), value: 'todo' },
    { label: t('task.inProgress'), value: 'in_progress' },
    { label: t('task.done'), value: 'done' },
  ];

  return (
    <div className="flex gap-2 text-sm overflow-x-auto pb-2 md:pb-0 no-scrollbar">
      {filters.map((filter) => {
        const isActive = filter.value === currentStatus || (!filter.value && !currentStatus);
        const href = filter.value ? `/tasks?status=${filter.value}` : '/tasks';

        return (
          <Link
            key={filter.label}
            href={href}
            className={`
              px-4 py-2 rounded-full font-medium transition-all duration-200 whitespace-nowrap
              ${isActive
                ? 'bg-purple-600 text-white shadow-md transform scale-105'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-purple-200 hover:text-purple-600'
              }
            `}
          >
            {filter.label}
          </Link>
        );
      })}
    </div>
  );
}
