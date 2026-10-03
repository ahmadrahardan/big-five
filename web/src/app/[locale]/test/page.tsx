import { getItems, getInfo } from '@bigfive-org/questions';
import { Survey } from './survey';
import { useTranslations } from 'next-intl';
import { unstable_setRequestLocale } from 'next-intl/server';
import { TestLanguageSwitch } from './test-language-switch';

const questionLanguages = getInfo().languages;

interface Props {
  params: {
    locale: string;
  };
  searchParams: {
    lang?: string;
  };
}

export default function TestPage({
  params: { locale },
  searchParams: { lang }
}: Props) {
  unstable_setRequestLocale(locale);

  const language =
    lang || (questionLanguages.some((l) => l.id === locale) ? locale : 'en');

  const questions = getItems(language);
  const t = useTranslations('test');

  return (
    <main className='w-full'>
      <div className='w-full max-w-6xl mx-auto px-5 md:px-8 lg:px-10 py-8'>

        {/* Pilihan bahasa tes */}
        <div className='flex mb-6'>
          <TestLanguageSwitch
            availableLanguages={questionLanguages}
            language={language}
          />
        </div>

        {/* Pertanyaan tes */}
        <Survey
          questions={questions}
          nextText={t('next')}
          prevText={t('back')}
          resultsText={t('seeResults')}
          language={language}
        />

      </div>
    </main>
  );
}