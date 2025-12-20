import { render, screen } from '@testing-library/react';
import TaskList from '@/app/components/TaskList';
import { Task } from '@/domain/entities/Task';
import { TaskEditingContext } from '@/presentation/context/TaskEditingContext';

// Mock dependencies
jest.mock('@/app/components/TaskCard', () => ({
  __esModule: true,
  default: ({ task }: { task: Task }) => <div data-testid="task-card">{task.title}</div>,
}));

jest.mock('@/app/components/TaskForm', () => ({
  __esModule: true,
  default: ({ task }: { task: Task }) => <div data-testid="task-form-inline">{task.title}</div>,
}));

jest.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key === 'task.emptyList' ? 'No tasks' : key,
  }),
}));

describe('TaskList', () => {
  const mockTasks: Task[] = [
    { id: '1', title: 'Task 1', description: 'Desc 1', status: 'todo', userId: 'u1', createdAt: new Date(), updatedAt: new Date() },
    { id: '2', title: 'Task 2', description: 'Desc 2', status: 'done', userId: 'u1', createdAt: new Date(), updatedAt: new Date() },
  ];

  const renderWithContext = (tasks: Task[], editingTask: Task | null = null) => {
    return render(
      <TaskEditingContext.Provider value={{ editingTask, setEditingTask: jest.fn() }}>
        <TaskList tasks={tasks} />
      </TaskEditingContext.Provider>
    );
  };

  it('renders list of tasks', () => {
    renderWithContext(mockTasks);
    expect(screen.getAllByTestId('task-card')).toHaveLength(2);
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
  });

  it('renders empty state when no tasks', () => {
    renderWithContext([]);
    expect(screen.getByText('No tasks')).toBeInTheDocument();
  });

  it('renders inline form when editing a task', () => {
    renderWithContext(mockTasks, mockTasks[0]);
    expect(screen.getByTestId('task-form-inline')).toBeInTheDocument();
    expect(screen.getByText('Task 1')).toBeInTheDocument(); // Inside the form mock
    expect(screen.getAllByTestId('task-card')).toHaveLength(1); // Only one card (the non-editing one)
  });
});
