import { Task } from "@/domain/entities/Task";

/**
 * TaskEditingService
 *
 * A client-side service that manages the logic for editing a task.
 * We will use a simple listener pattern for state updates.
 */
export class TaskEditingService {
  private _editingTask: Task | null = null;
  private listeners: Set<(task: Task | null) => void> = new Set();

  get editingTask(): Task | null {
    return this._editingTask;
  }

  setEditingTask(task: Task | null): void {
    this._editingTask = task;
    this.notifyListeners();
  }

  subscribe(listener: (task: Task | null) => void): () => void {
    this.listeners.add(listener);
    listener(this._editingTask); // initial

    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this._editingTask));
  }
}
