import { GetTasksUseCase } from "@/domain/use-cases/task/GetTasksUseCase";
import { ITaskRepository } from "@/domain/repositories/ITaskRepository";
import { Task } from "@/domain/entities/Task";

const mockTaskRepository = {
  findByUserId: jest.fn(),
  findByUserIdAndStatus: jest.fn(),
};

describe("GetTasksUseCase", () => {
  let getTasksUseCase: GetTasksUseCase;

  beforeEach(() => {
    getTasksUseCase = new GetTasksUseCase(
      mockTaskRepository as unknown as ITaskRepository
    );
    jest.clearAllMocks();
  });

  it("should return all tasks for user when no status provided", async () => {
    const mockTasks: Task[] = [
      { id: "1", userId: "u1", title: "T1", status: "todo" } as Task,
      { id: "2", userId: "u1", title: "T2", status: "done" } as Task,
    ];

    mockTaskRepository.findByUserId.mockResolvedValue(mockTasks);

    const result = await getTasksUseCase.execute("u1");
    expect(result).toEqual(mockTasks);
    expect(mockTaskRepository.findByUserId).toHaveBeenCalledWith("u1");
  });

  it("should return filtered tasks when status provided", async () => {
    const mockTasks: Task[] = [
      { id: "1", userId: "u1", title: "T1", status: "todo" } as Task,
    ];

    mockTaskRepository.findByUserIdAndStatus.mockResolvedValue(mockTasks);

    const result = await getTasksUseCase.execute("u1", "todo");
    expect(result).toEqual(mockTasks);
    expect(mockTaskRepository.findByUserIdAndStatus).toHaveBeenCalledWith(
      "u1",
      "todo"
    );
  });

  it("should throw error if userId is missing", async () => {
    await expect(getTasksUseCase.execute("")).rejects.toThrow("Unauthorized");
  });
});
