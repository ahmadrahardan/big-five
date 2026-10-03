import { Suspense } from 'react';
import { LocalResult } from './local-result';
import { unstable_setRequestLocale } from 'next-intl/server';

interface Props {
  params: {
    locale: string;
  };
}

export default function ResultPage({ params: { locale } }: Props) {
  unstable_setRequestLocale(locale);

  return (
    <Suspense
      fallback={
        <main className='w-full'>
          <div className='w-full max-w-6xl mx-auto px-5 md:px-8 lg:px-10 py-8'>
            <p>Loading...</p>
          </div>
        </main>
      }
    >
      <LocalResult />
    </Suspense>
  );
}