import { getTasks } from '@/presentation/actions/task';
import TaskList from '@/app/components/TaskList';
import TaskForm from '@/app/components/TaskForm';
import Navbar from '@/app/components/Navbar';
import TaskFilters from '@/app/components/TaskFilters';

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const status = params.status;
  const tasks = await getTasks(status);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/3">
               <div className="sticky top-24">
                  <TaskForm disableContext={true} />
               </div>
          </div>
          <div className="md:w-2/3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h1 className="text-2xl font-bold text-purple-700 bg-clip-text bg-linear-to-r from-purple-700 to-indigo-600">My Tasks</h1>
                <TaskFilters currentStatus={status} />
              </div>
              <TaskList tasks={tasks} />
          </div>
        </div>
      </div>
    </div>
  );
}
