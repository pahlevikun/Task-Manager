'use client';

import { registerAction } from '@/presentation/actions/auth';
import { useActionState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

const initialState = {
  error: '',
};

export default function RegisterForm() {
  const { t } = useTranslation();
  const [state, formAction, isPending] = useActionState(registerAction, initialState);

  return (
    <form className="mt-8 space-y-6" action={formAction}>
      <input type="hidden" name="remember" value="true" />
      <div className="space-y-4">
        <div>
          <label htmlFor="email-address" className="sr-only">
            {t('auth.register.email')}
          </label>
          <input
            id="email-address"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="appearance-none relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm bg-white/80"
            placeholder="Email address"
          />
        </div>
        <div>
          <label htmlFor="password" className="sr-only">
            {t('auth.register.password')}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            className="appearance-none relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm bg-white/80"
            placeholder="Password"
          />
        </div>
      </div>

      {state?.error && (
        <div className="p-3 rounded-xl bg-red-50/80 border border-red-100 text-red-700 text-sm backdrop-blur-sm text-center">
          {state.error}
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={isPending}
          className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 shadow-lg shadow-indigo-500/20 transition-all duration-300 transform hover:-translate-y-1"
        >
          {isPending ? t('auth.register.cta_loading') : t('auth.register.cta_sign_up')}
        </button>
      </div>
    </form>
  );
}
