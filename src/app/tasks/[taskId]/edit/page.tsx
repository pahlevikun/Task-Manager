import { getTaskById } from '@/presentation/actions/task';
import TaskForm from '@/app/components/TaskForm';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';

export default async function EditTaskPage({ params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await params;
  const task = await getTaskById(taskId);

  if (!task) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
            <div className="mb-6 flex justify-end">
                <Link href={`/tasks/${taskId}`} className="text-sm font-medium text-gray-500 hover:text-purple-600 transition-colors">
                    &larr; Cancel editing
                </Link>
            </div>
            <TaskForm task={task} disableContext={true} />
        </div>
      </div>
    </div>
  );
}
