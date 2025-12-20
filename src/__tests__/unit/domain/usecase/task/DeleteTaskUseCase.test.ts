import { DeleteTaskUseCase } from "@/domain/use-cases/task/DeleteTaskUseCase";
import { ITaskRepository } from "@/domain/repositories/ITaskRepository";
import { Task } from "@/domain/entities/Task";

const mockTaskRepository = {
  findById: jest.fn(),
  delete: jest.fn(),
};

describe("DeleteTaskUseCase", () => {
  let deleteTaskUseCase: DeleteTaskUseCase;

  beforeEach(() => {
    deleteTaskUseCase = new DeleteTaskUseCase(
      mockTaskRepository as unknown as ITaskRepository
    );
    jest.clearAllMocks();
  });

  it("should delete task when authorized", async () => {
    const mockTask: Task = {
      id: "task-1",
      userId: "user-1",
      title: "Test Task",
      description: "Desc",
      status: "todo",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockTaskRepository.findById.mockResolvedValue(mockTask);
    mockTaskRepository.delete.mockResolvedValue(true);

    await deleteTaskUseCase.execute("task-1", "user-1");

    expect(mockTaskRepository.delete).toHaveBeenCalledWith("task-1");
  });

  it("should throw error if task not found", async () => {
    mockTaskRepository.findById.mockResolvedValue(null);

    await expect(deleteTaskUseCase.execute("task-1", "user-1")).rejects.toThrow(
      "Task not found"
    );
  });

  it("should throw error if user is not owner", async () => {
    const mockTask: Task = {
      id: "task-1",
      userId: "other-user",
      title: "Test Task",
      description: "Desc",
      status: "todo",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockTaskRepository.findById.mockResolvedValue(mockTask);

    await expect(deleteTaskUseCase.execute("task-1", "user-1")).rejects.toThrow(
      "Unauthorized"
    );
  });
});
