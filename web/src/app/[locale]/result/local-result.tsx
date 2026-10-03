'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@nextui-org/button';

import calculateScore from '@bigfive-org/score';
import generateResult, {
  Domain,
  getInfo,
  Language
} from '@bigfive-org/results';

import { getItems } from '@bigfive-org/questions';

import { BarChart } from '@/components/bar-chart';
import { DomainTabs } from './[id]/domain-tabs';
import { ReportLanguageSwitch } from './[id]/report-language-switch';
import { title } from '@/components/primitives';
import { useRouter } from '@/navigation';
import { type Answer } from '@/types';

interface ShareResult {
  v: number;
  l: string;
  s: string;
}

/*
 * Decode Base64 URL-safe.
 */
function decodeResult(encoded: string): ShareResult {
  const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');

  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);

  const binary = atob(padded);

  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));

  const json = new TextDecoder().decode(bytes);

  return JSON.parse(json);
}

export const LocalResult = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [results, setResults] = useState<Domain[] | null>(null);

  const [language, setLanguage] = useState('en');

  const [error, setError] = useState(false);

  const [copied, setCopied] = useState(false);

  /*
   * Daftar bahasa yang tersedia
   * untuk report.
   */
  const resultLanguages = getInfo().languages;

  // useEffect(() => {
  //   try {
  //     const encoded =
  //       searchParams.get('r');

  //     /*
  //      * Bahasa yang dipilih user melalui:
  //      *
  //      * ?lang=id
  //      * ?lang=en
  //      * dll.
  //      */
  //     const requestedLanguage =
  //       searchParams.get('lang');

  //     /*
  //      * ========================================
  //      * HASIL DARI SHARE LINK
  //      * ========================================
  //      */
  //     if (encoded) {
  //       const shareData =
  //         decodeResult(encoded);

  //       /*
  //        * Validasi format share link.
  //        */
  //       if (
  //         shareData.v !== 1 ||
  //         !shareData.l ||
  //         !shareData.s
  //       ) {
  //         throw new Error(
  //           'Invalid result format'
  //         );
  //       }

  //       /*
  //        * Struktur pertanyaan harus tetap
  //        * menggunakan bahasa saat tes
  //        * dikerjakan.
  //        */
  //       const questions =
  //         getItems(shareData.l);

  //       /*
  //        * Pastikan jumlah skor sama dengan
  //        * jumlah pertanyaan.
  //        */
  //       if (
  //         shareData.s.length !==
  //         questions.length
  //       ) {
  //         throw new Error(
  //           'Invalid number of answers'
  //         );
  //       }

  //       /*
  //        * Rekonstruksi Answer[] dari scoreString.
  //        */
  //       const answers: Answer[] =
  //         questions.map(
  //           (question, index) => {
  //             const score = Number(
  //               shareData.s[index]
  //             );

  //             if (
  //               !Number.isInteger(score) ||
  //               score < 1 ||
  //               score > 5
  //             ) {
  //               throw new Error(
  //                 'Invalid answer score'
  //               );
  //             }

  //             return {
  //               id: question.id,
  //               score,
  //               domain: question.domain,
  //               facet: question.facet
  //             };
  //           }
  //         );

  //       /*
  //        * Prioritas bahasa report:
  //        *
  //        * 1. ?lang=...
  //        * 2. bahasa asli dari share link
  //        */
  //       const reportLanguage =
  //         requestedLanguage ||
  //         shareData.l;

  //       generateReport(
  //         answers,
  //         reportLanguage
  //       );

  //       return;
  //     }

  //     /*
  //      * ========================================
  //      * FALLBACK SESSION STORAGE
  //      * ========================================
  //      */
  //     const stored =
  //       sessionStorage.getItem(
  //         'b5result'
  //       );

  //     if (!stored) {
  //       setError(true);
  //       return;
  //     }

  //     const data =
  //       JSON.parse(stored);

  //     if (
  //       !data.answers ||
  //       !Array.isArray(data.answers)
  //     ) {
  //       throw new Error(
  //         'Invalid session data'
  //       );
  //     }

  //     const reportLanguage =
  //       requestedLanguage ||
  //       data.lang;

  //     generateReport(
  //       data.answers,
  //       reportLanguage
  //     );
  //   } catch (error) {
  //     console.error(
  //       'Failed to generate result:',
  //       error
  //     );

  //     setError(true);
  //   }
  // }, [searchParams]);
  useEffect(() => {
    try {
      const encoded = searchParams.get('r');

      const requestedLanguage = searchParams.get('lang');

      /*
       * ========================================
       * HASIL DARI SHARE LINK
       * ========================================
       */
      if (encoded) {
        /*
         * Simpan hasil terakhir ke localStorage.
         *
         * Digunakan ketika user kembali ke
         * halaman Result melalui navbar.
         */
        localStorage.setItem('b5-last-result', encoded);

        const shareData = decodeResult(encoded);

        if (shareData.v !== 1 || !shareData.l || !shareData.s) {
          throw new Error('Invalid result format');
        }

        const questions = getItems(shareData.l);

        if (shareData.s.length !== questions.length) {
          throw new Error('Invalid number of answers');
        }

        const answers: Answer[] = questions.map((question, index) => {
          const score = Number(shareData.s[index]);

          if (!Number.isInteger(score) || score < 1 || score > 5) {
            throw new Error('Invalid answer score');
          }

          return {
            id: question.id,
            score,
            domain: question.domain,
            facet: question.facet
          };
        });

        const reportLanguage = requestedLanguage || shareData.l;

        generateReport(answers, reportLanguage);

        return;
      }

      /*
       * ========================================
       * HASIL TERAKHIR DARI LOCAL STORAGE
       * ========================================
       *
       * Jika user membuka /result melalui navbar
       * tanpa parameter ?r=...
       */
      const savedResult = localStorage.getItem('b5-last-result');

      if (savedResult) {
        router.replace(`/result?r=${savedResult}`);

        return;
      }

      /*
       * ========================================
       * FALLBACK SESSION STORAGE
       * ========================================
       */
      const stored = sessionStorage.getItem('b5result');

      if (!stored) {
        setError(true);
        return;
      }

      const data = JSON.parse(stored);

      if (!data.answers || !Array.isArray(data.answers)) {
        throw new Error('Invalid session data');
      }

      const reportLanguage = requestedLanguage || data.lang;

      generateReport(data.answers, reportLanguage);
    } catch (error) {
      console.error('Failed to generate result:', error);

      setError(true);
    }
  }, [searchParams]);
  /*
   * ========================================
   * GENERATE BIG FIVE REPORT
   * ========================================
   */
  function generateReport(answers: Answer[], lang: string) {
    /*
     * Library @bigfive-org/score
     * mengharapkan facet sebagai string.
     */
    const scoreAnswers = answers.map((answer) => ({
      id: answer.id,
      score: answer.score,
      domain: answer.domain,
      facet: String(answer.facet)
    }));

    const scores = calculateScore({
      answers: scoreAnswers
    });

    /*
     * Pastikan bahasa report tersedia.
     * Jika tidak tersedia, fallback ke English.
     */
    const selectedLanguage: Language['id'] =
      resultLanguages.find((item) => item.id === lang)?.id ?? 'en';

    /*
     * Yang berubah ketika user mengganti
     * bahasa hanya teks report.
     *
     * Skor Big Five tetap sama.
     */
    const generatedResults = generateResult({
      lang: selectedLanguage,
      scores
    });

    setLanguage(selectedLanguage);

    setResults(generatedResults);

    setError(false);
  }

  /*
   * ========================================
   * COPY SHARE LINK
   * ========================================
   */
  async function copyShareLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  }

  /*
   * ========================================
   * ERROR
   * ========================================
   */
  if (error) {
    return (
      <main className='w-full'>
        <div className='w-full max-w-6xl mx-auto px-5 md:px-8 lg:px-10 py-8'>
          <div className='text-center mt-10'>
            <h1 className='text-2xl font-bold'>Hasil tidak ditemukan</h1>

            <p className='mt-4'>
              Link hasil tidak valid atau data hasil tidak tersedia.
            </p>

            <Button
              className='mt-6 bg-orange-600 text-white hover:bg-orange-700'
              onClick={() => router.push('/test')}
            >
              Mulai Tes
            </Button>
          </div>
        </div>
      </main>
    );
  }

  /*
   * ========================================
   * LOADING
   * ========================================
   */
  if (!results) {
    return (
      <main className='w-full'>
        <div className='w-full max-w-6xl mx-auto px-5 md:px-8 lg:px-10 py-8'>
          <div className='text-center mt-10'>
            <p>Memuat hasil tes...</p>
          </div>
        </div>
      </main>
    );
  }

  /*
   * ========================================
   * RESULT
   * ========================================
   */
  return (
    <main className='w-full'>
      <div className='w-full max-w-6xl mx-auto px-5 md:px-8 lg:px-10 py-8'>
        {/* Bahasa report + tombol share */}
        <div
          className='flex flex-col gap-4
                     sm:flex-row
                     sm:justify-between
                     sm:items-center'
        >
          <ReportLanguageSwitch
            language={language}
            availableLanguages={resultLanguages}
          />

          <Button
            className={
              copied
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-orange-600 text-white hover:bg-orange-700'
            }
            onClick={copyShareLink}
          >
            {copied ? 'Link Tersalin!' : 'Salin Link Hasil'}
          </Button>
        </div>

        {/* Judul */}
        <div className='flex mt-10'>
          <h1 className={title()}>The Big Five</h1>
        </div>

        {/* Grafik */}
        <div className='mt-6'>
          <BarChart max={120} results={results} />
        </div>

        {/* Detail domain */}
        <div className='mt-8'>
          <DomainTabs
            results={results}
            showExpanded={false}
            scoreText='Score'
          />
        </div>
      </div>
    </main>
  );
};
