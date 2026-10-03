'use client';

import { Select, SelectItem } from '@nextui-org/select';
import { ChangeEvent } from 'react';
import { Language } from '@bigfive-org/results';
import { useRouter } from '@/navigation';
import { useSearchParams } from 'next/navigation';

export const ReportLanguageSwitch = ({
  language,
  availableLanguages
}: {
  language: string;
  availableLanguages: Language[];
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  function onSelectChange(
    event: ChangeEvent<HTMLSelectElement>
  ) {
    const selectedLanguage =
      event.target.value;

    /*
     * Salin semua query parameter yang
     * sudah ada, termasuk ?r=...
     */
    const params =
      new URLSearchParams(
        searchParams.toString()
      );

    /*
     * Hanya ubah parameter bahasa.
     * Parameter r tetap dipertahankan.
     */
    params.set(
      'lang',
      selectedLanguage
    );

    router.push(
      `?${params.toString()}`
    );

    router.refresh();
  }

  return (
    <div className='w-30'>
      <Select
        selectedKeys={[language]}
        onChange={onSelectChange}
        aria-label='Select language'
        name='localeSelectSmall'
        className='w-48'
        size='sm'
        label='Report language'
      >
        {availableLanguages.map(
          (lang) => (
            <SelectItem
              key={lang.id}
              value={lang.id}
              textValue={lang.text}
            >
              {lang.text}
            </SelectItem>
          )
        )}
      </Select>
    </div>
  );
};