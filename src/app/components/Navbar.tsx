import { logoutAction } from '@/presentation/actions/auth';
import { LogOut } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function Navbar() {
  const { t } = useTranslation();
  return (
    <nav className="glass-panel sticky top-0 z-50 border-b border-white/40">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-indigo-600 to-purple-600">{t('common.appName')}</h1>
        <form action={logoutAction}>
          <button className="flex items-center text-gray-700 hover:text-red-600 transition-colors font-medium">
            <LogOut className="w-5 h-5 mr-2" />
            {t('common.logout')}
          </button>
        </form>
      </div>
    </nav>
  );
}
