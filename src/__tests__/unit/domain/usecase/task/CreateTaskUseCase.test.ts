import { CreateTaskUseCase } from "@/domain/use-cases/task/CreateTaskUseCase";
import { ITaskRepository } from "@/domain/repositories/ITaskRepository";
import { TaskStatus } from "@/domain/entities/Task";

describe("CreateTaskUseCase", () => {
  let createTaskUseCase: CreateTaskUseCase;
  let mockTaskRepository: jest.Mocked<ITaskRepository>;

  beforeEach(() => {
    mockTaskRepository = {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
    };
    createTaskUseCase = new CreateTaskUseCase(mockTaskRepository);
  });

  it("should create a new task successfully", async () => {
    const taskData = {
      title: "Test Task",
      description: "Test Description",
      userId: "123e4567-e89b-12d3-a456-426614174000",
      status: "todo",
      dueDate: "2024-01-01T00:00:00.000Z",
    };

    const createdTask = {
      id: "1",
      ...taskData,
      status: "todo" as TaskStatus,
      dueDate: new Date(taskData.dueDate),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockTaskRepository.create.mockResolvedValue(createdTask);

    const result = await createTaskUseCase.execute(taskData);

    expect(mockTaskRepository.create).toHaveBeenCalledWith({
      title: taskData.title,
      description: taskData.description,
      status: "todo",
      dueDate: new Date(taskData.dueDate),
      userId: taskData.userId,
    });
    expect(result).toEqual(createdTask);
  });

  it("should create a new task with minimal required fields", async () => {
    const taskData = {
      title: "Test Task",
      userId: "123e4567-e89b-12d3-a456-426614174000",
      dueDate: "2024-01-01T00:00:00.000Z",
    };

    const createdTask = {
      id: "1",
      title: taskData.title,
      description: null,
      userId: taskData.userId,
      status: "todo" as TaskStatus,
      dueDate: new Date(taskData.dueDate),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockTaskRepository.create.mockResolvedValue(createdTask);

    const result = await createTaskUseCase.execute(taskData);

    expect(mockTaskRepository.create).toHaveBeenCalledWith({
      title: taskData.title,
      description: null,
      status: "todo",
      dueDate: new Date(taskData.dueDate),
      userId: taskData.userId,
    });
    expect(result).toEqual(createdTask);
  });

  it("should throw validation error when dueDate is missing", async () => {
    const taskData = {
      title: "Test Task",
      userId: "123e4567-e89b-12d3-a456-426614174000",
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await expect(createTaskUseCase.execute(taskData as any)).rejects.toThrow();
  });

  it("should handle date string conversion for dueDate", async () => {
    const dateString = "2024-01-01T00:00:00.000Z";
    const taskData = {
      title: "Test Task",
      userId: "123e4567-e89b-12d3-a456-426614174000",
      dueDate: dateString,
    };

    const createdTask = {
      id: "1",
      title: taskData.title,
      description: null,
      userId: taskData.userId,
      status: "todo" as TaskStatus,
      dueDate: new Date(dateString),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockTaskRepository.create.mockResolvedValue(createdTask);

    await createTaskUseCase.execute(taskData);

    expect(mockTaskRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        dueDate: new Date(dateString),
      })
    );
  });

  it("should throw an error if title is empty", async () => {
    const taskData = {
      title: "",
      userId: "user1",
      dueDate: "2024-01-01",
    };

    await expect(createTaskUseCase.execute(taskData)).rejects.toThrow();
    expect(mockTaskRepository.create).not.toHaveBeenCalled();
  });
});
