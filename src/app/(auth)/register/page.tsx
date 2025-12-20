import Link from 'next/link';
import RegisterForm from './RegisterForm';
import { useTranslation } from '@/hooks/useTranslation';

export default function RegisterPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 glass-panel p-8 rounded-2xl shadow-xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold bg-clip-text text-transparent bg-linear-to-r from-purple-700 to-indigo-600">
            {t('auth.register.sign_up')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('auth.register.sign_in')}{' '}
            <Link href="/login" className="font-medium text-purple-600 hover:text-purple-500">
              {t('auth.register.sign_in_cta')}
            </Link>
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
