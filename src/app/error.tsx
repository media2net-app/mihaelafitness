'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { clearAppClientCache } from '@/lib/clearClientCache';
import { translations, type Language } from '@/lib/translations';

function getErrorPageCopy(language: Language) {
  return translations[language].errorPage;
}

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { language } = useLanguage();
  const ep = getErrorPageCopy(language);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    console.error(error);
  }, [error]);

  const handleClearAndLogin = async () => {
    setClearing(true);
    try {
      await clearAppClientCache();
      window.location.href = '/login?cleared=1';
    } catch (e) {
      console.error(e);
      setClearing(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-8 w-8 text-red-600" aria-hidden />
        </div>

        <h1 className="mb-2 text-2xl font-bold text-gray-800">{ep.title}</h1>
        <p className="mb-4 text-left text-sm leading-relaxed text-gray-600">{ep.body}</p>

        <ul className="mb-6 space-y-2 text-left text-sm text-gray-600">
          {ep.hintList.map((hint) => (
            <li key={hint} className="flex gap-2">
              <span className="mt-0.5 shrink-0 text-rose-500" aria-hidden>
                •
              </span>
              <span>{hint}</span>
            </li>
          ))}
        </ul>

        <div className="space-y-3">
          <button
            type="button"
            onClick={handleClearAndLogin}
            disabled={clearing}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-rose-500 py-3 font-medium text-white transition-colors hover:bg-rose-600 disabled:opacity-70"
          >
            <Trash2 className="h-4 w-4 shrink-0" aria-hidden />
            {clearing ? ep.clearing : ep.clearCache}
          </button>

          <button
            type="button"
            onClick={() => reset()}
            disabled={clearing}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-70"
          >
            <RefreshCw className="h-4 w-4 shrink-0" aria-hidden />
            {ep.tryAgain}
          </button>

          <button
            type="button"
            onClick={() => {
              window.location.href = '/login';
            }}
            disabled={clearing}
            className="w-full py-2 text-sm font-medium text-rose-600 hover:text-rose-700 disabled:opacity-70"
          >
            {ep.goLogin}
          </button>

          <button
            type="button"
            onClick={() => {
              window.location.href = '/';
            }}
            disabled={clearing}
            className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-70"
          >
            {ep.goHome}
          </button>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              {ep.devDetails}
            </summary>
            <pre className="mt-2 max-h-40 overflow-auto rounded bg-red-50 p-3 text-xs text-red-600">
              {error.message}
              {error.digest ? `\nDigest: ${error.digest}` : ''}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
