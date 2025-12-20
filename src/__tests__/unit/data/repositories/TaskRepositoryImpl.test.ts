import { TaskRepositoryImpl } from "@/data/repositories/TaskRepositoryImpl";

jest.mock("@/data/db", () => ({
  db: {
    query: jest.fn(),
  },
}));

import { db } from "@/data/db";

describe("TaskRepositoryImpl", () => {
  let taskRepository: TaskRepositoryImpl;

  beforeEach(() => {
    taskRepository = new TaskRepositoryImpl();
    jest.clearAllMocks();
  });

  it("should find tasks by user id", async () => {
    const mockTasks = [{ id: "1", title: "T1", userId: "u1" }];
    (db.query as jest.Mock).mockResolvedValue({ rows: mockTasks });

    const result = await taskRepository.findByUserId("u1");

    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining("SELECT id, title"),
      ["u1"]
    );
    expect(result).toEqual(mockTasks);
  });

  it("should create a task", async () => {
    const mockTask = { id: "1", title: "New Task", userId: "u1" };
    (db.query as jest.Mock).mockResolvedValue({ rows: [mockTask] });

    const result = await taskRepository.create({
      title: "New Task",
      description: "Desc",
      userId: "u1",
      status: "todo",
    });

    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO tasks"),
      expect.arrayContaining(["New Task", "Desc", "todo", undefined, "u1"])
    );
    expect(result).toEqual(mockTask);
  });

  it("should find task by id", async () => {
    const mockTask = { id: "1", title: "T1", userId: "u1" };
    (db.query as jest.Mock).mockResolvedValue({ rows: [mockTask] });

    const result = await taskRepository.findById("1");

    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining("SELECT id, title"),
      ["1"]
    );
    expect(result).toEqual(mockTask);
  });

  it("should return null if task not found by id", async () => {
    (db.query as jest.Mock).mockResolvedValue({ rows: [] });

    const result = await taskRepository.findById("999");

    expect(result).toBeNull();
  });

  it("should update a task", async () => {
    const mockTask = { id: "1", title: "Updated", userId: "u1" };
    (db.query as jest.Mock).mockResolvedValue({ rows: [mockTask] });

    const result = await taskRepository.update("1", { title: "Updated" });

    expect(db.query).toHaveBeenCalled();
    expect(result).toEqual(mockTask);
  });

  it("should delete a task", async () => {
    (db.query as jest.Mock).mockResolvedValue({ rows: [] });

    await taskRepository.delete("1");

    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining("DELETE FROM tasks WHERE id = $1"),
      ["1"]
    );
  });
});
