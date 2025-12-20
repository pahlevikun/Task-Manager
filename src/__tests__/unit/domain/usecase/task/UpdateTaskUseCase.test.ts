import { UpdateTaskUseCase } from "@/domain/use-cases/task/UpdateTaskUseCase";
import { ITaskRepository } from "@/domain/repositories/ITaskRepository";
import { Task } from "@/domain/entities/Task";

const mockTaskRepository = {
  findById: jest.fn(),
  update: jest.fn(),
};

describe("UpdateTaskUseCase", () => {
  let updateTaskUseCase: UpdateTaskUseCase;

  beforeEach(() => {
    updateTaskUseCase = new UpdateTaskUseCase(
      mockTaskRepository as unknown as ITaskRepository
    );
    jest.clearAllMocks();
  });

  it("should update task when authorized", async () => {
    const mockTask: Task = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      userId: "123e4567-e89b-12d3-a456-426614174001",
      title: "Old Title",
      status: "todo",
    } as Task;

    const updatedTask: Task = {
      ...mockTask,
      title: "New Title",
    };

    mockTaskRepository.findById.mockResolvedValue(mockTask);
    mockTaskRepository.update.mockResolvedValue(updatedTask);

    const result = await updateTaskUseCase.execute({
      id: "123e4567-e89b-12d3-a456-426614174000",
      userId: "123e4567-e89b-12d3-a456-426614174001",
      title: "New Title",
    });

    expect(result).toEqual(updatedTask);
    expect(mockTaskRepository.update).toHaveBeenCalledWith(
      "123e4567-e89b-12d3-a456-426614174000",
      expect.objectContaining({
        title: "New Title",
      })
    );
  });

  it("should throw error if unauthorized", async () => {
    const mockTask: Task = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      userId: "123e4567-e89b-12d3-a456-426614174002", // Different owner
      title: "Old Title",
    } as Task;

    mockTaskRepository.findById.mockResolvedValue(mockTask);

    await expect(
      updateTaskUseCase.execute({
        id: "123e4567-e89b-12d3-a456-426614174000",
        userId: "123e4567-e89b-12d3-a456-426614174001", // Requesting user
        title: "New Title",
      })
    ).rejects.toThrow("Unauthorized");
  });

  it("should throw error if task not found", async () => {
    mockTaskRepository.findById.mockResolvedValue(null);

    await expect(
      updateTaskUseCase.execute({
        id: "123e4567-e89b-12d3-a456-426614174000",
        userId: "123e4567-e89b-12d3-a456-426614174001",
        title: "New Title",
      })
    ).rejects.toThrow("Task not found");
  });

  it("should throw error if update fails", async () => {
    const mockTask: Task = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      userId: "123e4567-e89b-12d3-a456-426614174001",
      title: "Old Title",
      status: "todo",
    } as Task;

    mockTaskRepository.findById.mockResolvedValue(mockTask);
    mockTaskRepository.update.mockResolvedValue(null);

    await expect(
      updateTaskUseCase.execute({
        id: "123e4567-e89b-12d3-a456-426614174000",
        userId: "123e4567-e89b-12d3-a456-426614174001",
        title: "New Title",
      })
    ).rejects.toThrow("Failed to update task");
  });

  it("should handle date string conversion for dueDate", async () => {
    const mockTask: Task = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      userId: "123e4567-e89b-12d3-a456-426614174001",
      title: "Old Title",
      status: "todo",
    } as Task;

    const dateString = "2024-01-01T00:00:00.000Z";
    const updatedTask: Task = {
      ...mockTask,
      dueDate: new Date(dateString),
    };

    mockTaskRepository.findById.mockResolvedValue(mockTask);
    mockTaskRepository.update.mockResolvedValue(updatedTask);

    await updateTaskUseCase.execute({
      id: "123e4567-e89b-12d3-a456-426614174000",
      userId: "123e4567-e89b-12d3-a456-426614174001",
      dueDate: dateString,
    });

    expect(mockTaskRepository.update).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        dueDate: new Date(dateString),
      })
    );
  });

  it("should validate input data", async () => {
    await expect(
      updateTaskUseCase.execute({
        id: "invalid-uuid",
        userId: "123e4567-e89b-12d3-a456-426614174001",
      })
    ).rejects.toThrow();
  });
});
