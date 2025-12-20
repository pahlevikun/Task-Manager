import { createContainer, asClass, InjectionMode } from "awilix";
import { UserRepositoryImpl } from "../data/repositories/UserRepositoryImpl";
import { TaskRepositoryImpl } from "../data/repositories/TaskRepositoryImpl";
import { RegisterUseCase } from "../domain/use-cases/auth/RegisterUseCase";
import { LoginUseCase } from "../domain/use-cases/auth/LoginUseCase";
import { CreateTaskUseCase } from "../domain/use-cases/task/CreateTaskUseCase";
import { GetTasksUseCase } from "../domain/use-cases/task/GetTasksUseCase";
import { UpdateTaskUseCase } from "../domain/use-cases/task/UpdateTaskUseCase";
import { DeleteTaskUseCase } from "../domain/use-cases/task/DeleteTaskUseCase";
import { GetTaskByIdUseCase } from "../domain/use-cases/task/GetTaskByIdUseCase";

const serverContainer = createContainer({
  injectionMode: InjectionMode.CLASSIC,
});

serverContainer.register({
  // Repositories
  userRepository: asClass(UserRepositoryImpl).singleton(),
  taskRepository: asClass(TaskRepositoryImpl).singleton(),

  // Use Cases
  registerUseCase: asClass(RegisterUseCase).singleton(),
  loginUseCase: asClass(LoginUseCase).singleton(),
  createTaskUseCase: asClass(CreateTaskUseCase).singleton(),
  getTasksUseCase: asClass(GetTasksUseCase).singleton(),
  updateTaskUseCase: asClass(UpdateTaskUseCase).singleton(),
  deleteTaskUseCase: asClass(DeleteTaskUseCase).singleton(),
  getTaskByIdUseCase: asClass(GetTaskByIdUseCase).singleton(),
});

export { serverContainer };
