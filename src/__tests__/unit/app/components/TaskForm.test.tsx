import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TaskForm from '@/app/components/TaskForm';
import { TaskEditingContext } from '@/presentation/context/TaskEditingContext';
import { Task } from '@/domain/entities/Task';

jest.mock('@/presentation/actions/task', () => ({
  createTaskAction: jest.fn(),
  updateTaskAction: jest.fn(),
}));
jest.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));
const mockUseActionState = jest.fn();
jest.mock('react', () => {
  const original = jest.requireActual('react');
  return {
    ...original,
    useActionState: (fn: unknown, initialState: unknown) => mockUseActionState(fn, initialState),
  };
});

describe('TaskForm', () => {
  const mockSetEditingTask = jest.fn();
  const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    status: 'todo',
    userId: 'user1',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    dueDate: new Date('2023-12-31T12:00:00.000Z'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseActionState.mockReturnValue([{ error: '', success: false }, jest.fn(), false]);
  });

  const renderTaskForm = (props: Partial<{ task: Task; isInline: boolean; disableContext: boolean }> = {}, editingTask: Task | null = null) => {
    return render(
      <TaskEditingContext.Provider value={{ editingTask, setEditingTask: mockSetEditingTask }}>
        <TaskForm {...props} />
      </TaskEditingContext.Provider>
    );
  };

  it('renders create form correctly', () => {
    renderTaskForm();
    expect(screen.getByPlaceholderText('task.title_placeholder')).toBeInTheDocument();
    expect(screen.getByText('task.add')).toBeInTheDocument();
  });

  it('renders edit form correctly when editingTask is in context', () => {
    renderTaskForm({}, mockTask);
    expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
    expect(screen.getByText('task.update')).toBeInTheDocument();
  });

  it('renders edit form correctly when task prop is passed', () => {
    renderTaskForm({ task: mockTask });
    expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
    expect(screen.getByText('task.update')).toBeInTheDocument();
  });

  it('updates date state on date input change', () => {
    renderTaskForm();
    const dateInput = screen.getByPlaceholderText('task.select_date');
    fireEvent.change(dateInput, { target: { value: '2023-12-25' } });
    expect(dateInput).toHaveValue('2023-12-25');
  });

  it('clears date state when date input is cleared', () => {
    renderTaskForm({ task: mockTask });
    const dateInput = screen.getByPlaceholderText('task.select_date');
    expect(dateInput).not.toHaveValue('');
    fireEvent.change(dateInput, { target: { value: '' } });
    expect(dateInput).toHaveValue('');
  });

  it('displays success message for creation', () => {
    mockUseActionState.mockReturnValue([{ error: '', success: true }, jest.fn(), false]);
    renderTaskForm(); // Create mode
    expect(screen.getByText('task.created')).toBeInTheDocument();
  });

  it('displays success message for update', () => {
    mockUseActionState.mockReturnValue([{ error: '', success: true }, jest.fn(), false]);
    renderTaskForm({}, mockTask); // Edit mode
    expect(screen.getByText('task.updated')).toBeInTheDocument();
  });

  it('resets form and closes edit mode on success', async () => {
    mockUseActionState.mockReturnValue([{ error: '', success: true }, jest.fn(), false]);

    renderTaskForm({}, mockTask);

    await waitFor(() => {
      expect(mockSetEditingTask).toHaveBeenCalledWith(null);
    });
  });

  it('displays error message when error exists', () => {
    mockUseActionState.mockReturnValue([{ error: 'Validation Error', success: false }, jest.fn(), false]);

    renderTaskForm();
    expect(screen.getByText('Validation Error')).toBeInTheDocument();
  });

  it('renders correctly with task without due date', () => {
    const taskWithoutDate = { ...mockTask, dueDate: undefined };
    renderTaskForm({ task: taskWithoutDate });
    const dateInput = screen.getByPlaceholderText('task.select_date');
    expect(dateInput).toHaveValue('');
  });

  it('renders edit form correctly with null description', () => {
    const taskWithNullDesc = { ...mockTask, description: null };
    renderTaskForm({ task: taskWithNullDesc });
    expect(screen.getByText('task.update')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('task.description_placeholder')).toHaveValue('');
  });

  it('updates time state on time input change', () => {
    renderTaskForm();
    const timeInput = screen.getByLabelText('task.time');
    fireEvent.change(timeInput, { target: { value: '14:30' } });
    expect(timeInput).toHaveValue('14:30');
  });

  it('calls setEditingTask(null) when cancel button is clicked', () => {
    renderTaskForm({}, mockTask);

    const cancelButton = screen.getByText('common.cancel');
    fireEvent.click(cancelButton);

    expect(mockSetEditingTask).toHaveBeenCalledWith(null);
  });

  it('updates hidden input with combined date and time', () => {
    const { container } = renderTaskForm();

    const dateInput = screen.getByPlaceholderText('task.select_date');
    const timeInput = screen.getByLabelText('task.time');

    fireEvent.change(dateInput, { target: { value: '2023-12-25' } });
    fireEvent.change(timeInput, { target: { value: '10:00' } });

    const hiddenInput = container.querySelector('input[name="dueDate"]') as HTMLInputElement;
    expect(hiddenInput).toHaveValue('2023-12-25T10:00');
  });

  it('has required attribute on date input', () => {
    renderTaskForm();
    const dateInput = screen.getByPlaceholderText('task.select_date');
    expect(dateInput).toBeRequired();
  });
});
