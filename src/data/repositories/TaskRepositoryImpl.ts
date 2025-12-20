import { ITaskRepository } from "../../domain/repositories/ITaskRepository";
import { Task, TaskStatus } from "../../domain/entities/Task";
import { db } from "../db";

export class TaskRepositoryImpl implements ITaskRepository {
  async create(
    task: Omit<Task, "id" | "createdAt" | "updatedAt">
  ): Promise<Task> {
    const query = `
      INSERT INTO tasks (title, description, status, due_date, user_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, title, description, status, due_date as "dueDate", user_id as "userId", created_at as "createdAt", updated_at as "updatedAt"
    `;
    const values = [
      task.title,
      task.description,
      task.status,
      task.dueDate,
      task.userId,
    ];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  async update(
    id: string,
    task: Partial<Omit<Task, "id" | "createdAt" | "updatedAt" | "userId">>
  ): Promise<Task | null> {
    const setClause = Object.keys(task)
      .map(
        (key, index) =>
          `${key.replace(
            /[A-Z]/g,
            (letter) => `_${letter.toLowerCase()}`
          )} = $${index + 2}`
      )
      .join(", ");

    if (!setClause) return null;

    const query = `
      UPDATE tasks
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, title, description, status, due_date as "dueDate", user_id as "userId", created_at as "createdAt", updated_at as "updatedAt"
    `;
    const values = [id, ...Object.values(task)];
    const result = await db.query(query, values);
    return result.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const query = "DELETE FROM tasks WHERE id = $1";
    const result = await db.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  async findById(id: string): Promise<Task | null> {
    const query = `
      SELECT id, title, description, status, due_date as "dueDate", user_id as "userId", created_at as "createdAt", updated_at as "updatedAt"
      FROM tasks
      WHERE id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }

  async findByUserId(userId: string): Promise<Task[]> {
    const query = `
      SELECT id, title, description, status, due_date as "dueDate", user_id as "userId", created_at as "createdAt", updated_at as "updatedAt"
      FROM tasks
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
  }

  async findByUserIdAndStatus(
    userId: string,
    status: TaskStatus
  ): Promise<Task[]> {
    const query = `
      SELECT id, title, description, status, due_date as "dueDate", user_id as "userId", created_at as "createdAt", updated_at as "updatedAt"
      FROM tasks
      WHERE user_id = $1 AND status = $2
      ORDER BY created_at DESC
    `;
    const result = await db.query(query, [userId, status]);
    return result.rows;
  }
}
