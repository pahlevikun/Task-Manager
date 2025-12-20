"use server";

import { serverContainer } from "@/services/server_container";
import { getUserId } from "@/services/auth";
import { revalidatePath } from "next/cache";
import { Task, TaskStatus } from "@/domain/entities/Task";
import { z } from "zod";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().default(""),
  status: z.enum(["todo", "in_progress", "done"]),
  dueDate: z
    .string()
    .optional()
    .transform((val) => val || undefined),
});

function revalidateTasks(taskId?: string) {
  revalidatePath("/");
  revalidatePath("/tasks");
  if (taskId) {
    revalidatePath(`/tasks/${taskId}`);
  }
}

export async function createTaskAction(
  prevState: unknown,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const userId = await getUserId();
  if (!userId) return { error: "Unauthorized" };

  const rawData = Object.fromEntries(formData.entries());
  const validation = taskSchema.safeParse(rawData);

  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  const { title, description, status, dueDate } = validation.data;

  try {
    const createTaskUseCase = serverContainer.resolve("createTaskUseCase");
    await createTaskUseCase.execute({
      title,
      description,
      status,
      dueDate,
      userId,
    });

    revalidateTasks();
    return { success: true };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

export async function updateTaskAction(
  id: string,
  prevState: unknown,
  formData: FormData
) {
  const userId = await getUserId();
  if (!userId) return { error: "Unauthorized" };

  const rawData = Object.fromEntries(formData.entries());
  const validation = taskSchema.safeParse(rawData);

  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  const { title, description, status, dueDate } = validation.data;

  try {
    const updateTaskUseCase = serverContainer.resolve("updateTaskUseCase");
    await updateTaskUseCase.execute({
      id,
      userId,
      title,
      description,
      status,
      dueDate,
    });

    revalidateTasks(id);
    return { success: true };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

export async function deleteTaskAction(id: string) {
  const userId = await getUserId();
  if (!userId) return { error: "Unauthorized" };

  try {
    const deleteTaskUseCase = serverContainer.resolve("deleteTaskUseCase");
    await deleteTaskUseCase.execute(id, userId);

    revalidateTasks();
    return { success: true };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

export async function getTaskById(id: string): Promise<Task | null> {
  const userId = await getUserId();
  if (!userId) return null;

  try {
    const getTaskByIdUseCase = serverContainer.resolve("getTaskByIdUseCase");
    return await getTaskByIdUseCase.execute(id, userId);
  } catch {
    return null;
  }
}

export async function getTasks(status?: string) {
  const userId = await getUserId();
  if (!userId) return [];

  const getTasksUseCase = serverContainer.resolve("getTasksUseCase");

  const validStatuses: TaskStatus[] = ["todo", "in_progress", "done"];
  const taskStatus =
    status && validStatuses.includes(status as TaskStatus)
      ? (status as TaskStatus)
      : undefined;

  return getTasksUseCase.execute(userId, taskStatus);
}
