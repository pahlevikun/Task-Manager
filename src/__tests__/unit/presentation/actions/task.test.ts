import { 
  createTaskAction, 
  updateTaskAction, 
  deleteTaskAction, 
  getTaskById, 
  getTasks 
} from '@/presentation/actions/task';
import { serverContainer } from '@/services/server_container';
import { revalidatePath } from 'next/cache';
import { getUserId } from '@/services/auth';

jest.mock('@/services/server_container', () => ({
  serverContainer: {
    resolve: jest.fn(),
  },
}));

jest.mock('@/services/auth', () => ({
  getUserId: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('Task Actions', () => {
  // Use case mocks
  let mockCreateTaskUseCase: { execute: jest.Mock };
  let mockUpdateTaskUseCase: { execute: jest.Mock };
  let mockDeleteTaskUseCase: { execute: jest.Mock };
  let mockGetTaskByIdUseCase: { execute: jest.Mock };
  let mockGetTasksUseCase: { execute: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();

    mockCreateTaskUseCase = { execute: jest.fn() };
    mockUpdateTaskUseCase = { execute: jest.fn() };
    mockDeleteTaskUseCase = { execute: jest.fn() };
    mockGetTaskByIdUseCase = { execute: jest.fn() };
    mockGetTasksUseCase = { execute: jest.fn() };

    (serverContainer.resolve as jest.Mock).mockImplementation((key: string) => {
      if (key === 'createTaskUseCase') return mockCreateTaskUseCase;
      if (key === 'updateTaskUseCase') return mockUpdateTaskUseCase;
      if (key === 'deleteTaskUseCase') return mockDeleteTaskUseCase;
      if (key === 'getTaskByIdUseCase') return mockGetTaskByIdUseCase;
      if (key === 'getTasksUseCase') return mockGetTasksUseCase;
      return null;
    });
  });

  const mockAuth = (userId: string | null) => {
    (getUserId as jest.Mock).mockResolvedValue(userId);
  };

  describe('createTaskAction', () => {
    it('should return unauthorized if not logged in', async () => {
      mockAuth(null);
      const formData = new FormData();
      
      const result = await createTaskAction(null, formData);
      
      expect(result).toEqual({ error: 'Unauthorized' });
      expect(mockCreateTaskUseCase.execute).not.toHaveBeenCalled();
    });

    it('should return validation error for invalid input', async () => {
      mockAuth('user-123');
      const formData = new FormData();
      // Missing title and status
      
      const result = await createTaskAction(null, formData);
      
      expect(result).toHaveProperty('error');
      expect(mockCreateTaskUseCase.execute).not.toHaveBeenCalled();
    });

    it('should create task successfully', async () => {
      mockAuth('user-123');
      const formData = new FormData();
      formData.append('title', 'New Task');
      formData.append('description', 'Desc');
      formData.append('status', 'todo');

      mockCreateTaskUseCase.execute.mockResolvedValue(undefined);

      const result = await createTaskAction(null, formData);

      expect(mockCreateTaskUseCase.execute).toHaveBeenCalledWith({
        title: 'New Task',
        description: 'Desc',
        status: 'todo',
        userId: 'user-123',
        dueDate: undefined,
      });
      expect(revalidatePath).toHaveBeenCalledWith('/');
      expect(revalidatePath).toHaveBeenCalledWith('/tasks');
      expect(result).toEqual({ success: true });
    });

    it('should handle use case errors', async () => {
      mockAuth('user-123');
      const formData = new FormData();
      formData.append('title', 'New Task');
      formData.append('status', 'todo');
      
      mockCreateTaskUseCase.execute.mockRejectedValue(new Error('Failed to create'));

      const result = await createTaskAction(null, formData);

      expect(result).toEqual({ error: 'Failed to create' });
    });
  });

  describe('updateTaskAction', () => {
    it('should return unauthorized if not logged in', async () => {
      mockAuth(null);
      const formData = new FormData();
      
      const result = await updateTaskAction('task-1', null, formData);
      
      expect(result).toEqual({ error: 'Unauthorized' });
      expect(mockUpdateTaskUseCase.execute).not.toHaveBeenCalled();
    });

    it('should return validation error for invalid input', async () => {
      mockAuth('user-123');
      const formData = new FormData();
      // Missing required fields
      
      const result = await updateTaskAction('task-1', null, formData);
      
      expect(result).toHaveProperty('error');
      expect(mockUpdateTaskUseCase.execute).not.toHaveBeenCalled();
    });

    it('should update task successfully', async () => {
      mockAuth('user-123');
      const formData = new FormData();
      formData.append('title', 'Updated Task');
      formData.append('description', 'Desc');
      formData.append('status', 'done');

      mockUpdateTaskUseCase.execute.mockResolvedValue(undefined);

      const result = await updateTaskAction('task-1', null, formData);

      expect(mockUpdateTaskUseCase.execute).toHaveBeenCalledWith({
        id: 'task-1',
        userId: 'user-123',
        title: 'Updated Task',
        description: 'Desc',
        status: 'done',
        dueDate: undefined,
      });
      expect(revalidatePath).toHaveBeenCalledWith('/');
      expect(revalidatePath).toHaveBeenCalledWith('/tasks');
      expect(revalidatePath).toHaveBeenCalledWith('/tasks/task-1');
      expect(result).toEqual({ success: true });
    });

    it('should handle use case errors', async () => {
      mockAuth('user-123');
      const formData = new FormData();
      formData.append('title', 'Updated Task');
      formData.append('status', 'done');
      
      mockUpdateTaskUseCase.execute.mockRejectedValue(new Error('Failed to update'));

      const result = await updateTaskAction('task-1', null, formData);

      expect(result).toEqual({ error: 'Failed to update' });
    });
  });

  describe('deleteTaskAction', () => {
    it('should return unauthorized if not logged in', async () => {
      mockAuth(null);
      
      const result = await deleteTaskAction('task-1');
      
      expect(result).toEqual({ error: 'Unauthorized' });
      expect(mockDeleteTaskUseCase.execute).not.toHaveBeenCalled();
    });

    it('should delete task successfully', async () => {
      mockAuth('user-123');

      mockDeleteTaskUseCase.execute.mockResolvedValue(undefined);

      const result = await deleteTaskAction('task-1');

      expect(mockDeleteTaskUseCase.execute).toHaveBeenCalledWith('task-1', 'user-123');
      expect(revalidatePath).toHaveBeenCalledWith('/');
      expect(revalidatePath).toHaveBeenCalledWith('/tasks');
      expect(result).toEqual({ success: true });
    });

    it('should handle errors', async () => {
      mockAuth('user-123');
      mockDeleteTaskUseCase.execute.mockRejectedValue(new Error('Failed to delete'));

      const result = await deleteTaskAction('task-1');

      expect(result).toEqual({ error: 'Failed to delete' });
    });
  });

  describe('getTaskById', () => {
    it('should return null if not logged in', async () => {
      mockAuth(null);
      
      const result = await getTaskById('task-1');
      
      expect(result).toBeNull();
      expect(mockGetTaskByIdUseCase.execute).not.toHaveBeenCalled();
    });

    it('should return task successfully', async () => {
      mockAuth('user-123');
      const mockTask = { id: 'task-1', title: 'Task' };
      mockGetTaskByIdUseCase.execute.mockResolvedValue(mockTask);

      const result = await getTaskById('task-1');

      expect(mockGetTaskByIdUseCase.execute).toHaveBeenCalledWith('task-1', 'user-123');
      expect(result).toEqual(mockTask);
    });

    it('should return null on use case error', async () => {
      mockAuth('user-123');
      mockGetTaskByIdUseCase.execute.mockRejectedValue(new Error('Not found'));

      const result = await getTaskById('task-1');

      expect(result).toBeNull();
    });
  });

  describe('getTasks', () => {
    it('should return empty array if not logged in', async () => {
      mockAuth(null);
      
      const result = await getTasks();
      
      expect(result).toEqual([]);
      expect(mockGetTasksUseCase.execute).not.toHaveBeenCalled();
    });

    it('should get all tasks successfully', async () => {
      mockAuth('user-123');
      const mockTasks = [{ id: 'task-1' }];
      mockGetTasksUseCase.execute.mockResolvedValue(mockTasks);

      const result = await getTasks();

      expect(mockGetTasksUseCase.execute).toHaveBeenCalledWith('user-123', undefined);
      expect(result).toEqual(mockTasks);
    });

    it('should get filtered tasks successfully', async () => {
      mockAuth('user-123');
      const mockTasks = [{ id: 'task-1', status: 'done' }];
      mockGetTasksUseCase.execute.mockResolvedValue(mockTasks);

      const result = await getTasks('done');

      expect(mockGetTasksUseCase.execute).toHaveBeenCalledWith('user-123', 'done');
      expect(result).toEqual(mockTasks);
    });

    it('should ignore invalid status filter', async () => {
      mockAuth('user-123');
      const mockTasks = [{ id: 'task-1' }];
      mockGetTasksUseCase.execute.mockResolvedValue(mockTasks);

      const result = await getTasks('invalid-status');

      expect(mockGetTasksUseCase.execute).toHaveBeenCalledWith('user-123', undefined);
      expect(result).toEqual(mockTasks);
    });
  });
});
