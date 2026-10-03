
import { LocalResult } from './local-result';
import { unstable_setRequestLocale } from 'next-intl/server';

interface Props {
  params: {
    locale: string;
  };
}

export default function ResultPage({
  params: { locale }
}: Props) {
  unstable_setRequestLocale(locale);

  return <LocalResult />;
}