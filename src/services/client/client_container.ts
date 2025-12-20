import { createContainer, asClass, InjectionMode } from 'awilix';
import { TaskEditingService } from './TaskEditingService';

const clientContainer = createContainer({
  injectionMode: InjectionMode.CLASSIC,
});

clientContainer.register({
  taskEditingService: asClass(TaskEditingService).singleton(),
});

export { clientContainer };
