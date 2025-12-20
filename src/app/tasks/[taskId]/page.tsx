import { getTaskById } from '@/presentation/actions/task';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/app/components/Navbar';

export default async function TaskDetailPage({ params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await params;
  const task = await getTaskById(taskId);

  if (!task) {
    notFound();
  }

  const statusColors = {
    todo: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
    done: 'bg-green-100 text-green-800 border-green-200',
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto glass-panel shadow-xl rounded-2xl p-8 transition-all duration-300">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-purple-700 to-indigo-600">{task.title}</h1>
            <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${
                statusColors[task.status]
            }`}>
                {task.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          
          <div className="mb-8">
            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{task.description || 'No description provided.'}</p>
          </div>
          
          {task.dueDate && (
               <div className="mb-8 p-4 bg-white/50 rounded-xl border border-white/60">
                  <p className="text-sm text-gray-700">
                      <span className="font-semibold text-purple-700">Due Date:</span> {new Date(task.dueDate).toLocaleString()}
                  </p>
               </div>
          )}

          <div className="flex space-x-4 pt-6 border-t border-gray-100">
            <Link href={`/tasks/${task.id}/edit`} className="bg-linear-to-r from-purple-600 to-blue-600 text-white px-6 py-2.5 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                Edit Task
            </Link>
            <Link href="/tasks" className="text-gray-600 hover:text-purple-700 px-6 py-2.5 transition-colors font-medium">
                Back to List
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
