import { useTranslations } from 'next-intl';
import { Link } from '@nextui-org/link';
import { button as buttonStyles } from '@nextui-org/theme';
import { title, subtitle } from '@/components/primitives';
import clsx from 'clsx';
import { ArrowRightIcon } from '@/components/icons';
import { unstable_setRequestLocale } from 'next-intl/server';
import { Translated } from '@/components/translated';

interface Props {
  params: {
    locale: string;
  };
}

export default function Home({ params: { locale } }: Props) {
  unstable_setRequestLocale(locale);

  const t = useTranslations('frontpage');

  const titleDescription = t.rich('description.top', {
    violet: (chunks) => (
      <span
        className={title({
          color: 'orange'
        })}
      >
        {chunks}
      </span>
    )
  });

  return (
    <section className='relative'>
      {/* HERO - menggunakan background image */}
      {/* HERO */}
      <section
        className='relative
             w-[100vw]
             left-[50%]
             right-[50%]
             ml-[-50vw]
             mr-[-50vw]
             min-h-[calc(100vh-64px)]
             flex flex-col items-center justify-center
             bg-cover bg-center bg-no-repeat
             overflow-hidden'
        style={{
          backgroundImage: "url('/home.jpeg')"
        }}
      >
        {/* Overlay gelap tipis seluruh gambar */}
        <div className='absolute inset-0 bg-black/20' />

        {/* Gradient: hitam bawah → transparan atas */}
        <div
          className='absolute inset-0
             bg-gradient-to-t
             from-white
             via-white/10
             to-transparent
             dark:from-black
             dark:via-black/40
             dark:to-transparent'
        />

        {/* Konten */}
        <div
          className='relative z-20
               flex flex-col gap-6
               w-full max-w-5xl
               px-6 mx-auto'
        >
          <div className='text-center'>
            <h1
              className={title({
                class: 'text-white dark:text-white'
              })}
            >
              {titleDescription}
            </h1>

            <h2
              className={subtitle({
                class: 'mt-6 text-white'
              })}
            >
              {t('description.info')}
            </h2>
          </div>

          <div className='flex justify-center'>
            <Link
              href='/test'
              className={clsx(
                buttonStyles({
                  radius: 'full',
                  size: 'lg'
                }),
                'bg-orange-600 text-white hover:bg-orange-700'
              )}
            >
              {t('call_to_action')}
              <ArrowRightIcon />
            </Link>
          </div>
        </div>
      </section>

      {/* Tidak terkena background image */}
      <Translated />
    </section>
  );
}
