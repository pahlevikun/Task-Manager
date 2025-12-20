import { GetTaskByIdUseCase } from "@/domain/use-cases/task/GetTaskByIdUseCase";
import { ITaskRepository } from "@/domain/repositories/ITaskRepository";
import { Task } from "@/domain/entities/Task";

const mockTaskRepository = {
  findById: jest.fn(),
};

describe("GetTaskByIdUseCase", () => {
  let getTaskByIdUseCase: GetTaskByIdUseCase;

  beforeEach(() => {
    getTaskByIdUseCase = new GetTaskByIdUseCase(
      mockTaskRepository as unknown as ITaskRepository
    );
    jest.clearAllMocks();
  });

  it("should return task when found and authorized", async () => {
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

    const result = await getTaskByIdUseCase.execute("task-1", "user-1");
    expect(result).toEqual(mockTask);
  });

  it("should throw error when task not found", async () => {
    mockTaskRepository.findById.mockResolvedValue(null);

    await expect(
      getTaskByIdUseCase.execute("task-1", "user-1")
    ).rejects.toThrow("Task not found");
  });

  it("should throw error when unauthorized", async () => {
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

    await expect(
      getTaskByIdUseCase.execute("task-1", "user-1")
    ).rejects.toThrow("Unauthorized");
  });
});
