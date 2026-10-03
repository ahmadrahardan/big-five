'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@nextui-org/button';
import { RadioGroup, Radio } from '@nextui-org/radio';
import { Progress } from '@nextui-org/progress';
import { Card, CardHeader } from '@nextui-org/card';
import confetti from 'canvas-confetti';

import { useRouter } from '@/navigation';
import { CloseIcon, InfoIcon } from '@/components/icons';
import { type Question } from '@bigfive-org/questions';
import { sleep, formatTimer, isDev } from '@/lib/helpers';
import useWindowDimensions from '@/hooks/useWindowDimensions';
import useTimer from '@/hooks/useTimer';
import { type Answer } from '@/types';

interface SurveyProps {
  questions: Question[];
  nextText: string;
  prevText: string;
  resultsText: string;
  language: string;
}

export const Survey = ({
  questions,
  nextText,
  prevText,
  resultsText,
  language
}: SurveyProps) => {
  const router = useRouter();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionsPerPage, setQuestionsPerPage] = useState(1);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(false);
  const [restored, setRestored] = useState(false);
  const [inProgress, setInProgress] = useState(false);

  const { width } = useWindowDimensions();
  const seconds = useTimer();

  /*
   * Mengatur jumlah pertanyaan per halaman.
   * Desktop = 3 pertanyaan.
   * Mobile = 1 pertanyaan.
   */
  useEffect(() => {
    const handleResize = () => {
      setQuestionsPerPage(window.innerWidth > 768 ? 3 : 1);
    };

    handleResize();
  }, [width]);

  /*
   * Restore progress tes jika sebelumnya user
   * melakukan refresh halaman.
   */
  useEffect(() => {
    if (dataInLocalStorage()) {
      console.log('Restoring data from local storage');
      restoreDataFromLocalStorage();
    }
  }, []);

  const currentQuestions = useMemo(
    () =>
      questions.slice(
        currentQuestionIndex,
        currentQuestionIndex + questionsPerPage
      ),
    [currentQuestionIndex, questions, questionsPerPage]
  );

  const isTestDone = questions.length === answers.length;

  const progress = Math.round((answers.length / questions.length) * 100);

  const nextButtonDisabled =
    inProgress ||
    currentQuestionIndex + questionsPerPage > answers.length ||
    (isTestDone &&
      currentQuestionIndex === questions.length - questionsPerPage) ||
    loading;

  const backButtonDisabled = currentQuestionIndex === 0 || loading;

  /*
   * Menyimpan jawaban user ke React state.
   */
  async function handleAnswer(id: string, value: string) {
    const question = questions.find((question) => question.id === id);

    if (!question) return;

    const newAnswer: Answer = {
      id,
      score: Number(value),
      domain: question.domain,
      facet: question.facet
    };

    const updatedAnswers = [
      ...answers.filter((answer) => answer.id !== id),
      newAnswer
    ];

    setAnswers(updatedAnswers);

    /*
     * Simpan progress ke localStorage.
     * Tujuannya agar jawaban tidak hilang ketika refresh.
     */
    populateDataInLocalStorage(updatedAnswers, currentQuestionIndex);

    const latestAnswerId = answers.slice(-1)[0]?.id;

    /*
     * Pada tampilan mobile, setelah memilih jawaban
     * otomatis lanjut ke pertanyaan berikutnya.
     */
    if (
      questionsPerPage === 1 &&
      questions.length !== answers.length + 1 &&
      id !== latestAnswerId
    ) {
      setInProgress(true);

      await sleep(700);

      const nextIndex = currentQuestionIndex + 1;

      setCurrentQuestionIndex(nextIndex);

      /*
       * Update posisi pertanyaan di localStorage.
       */
      populateDataInLocalStorage(updatedAnswers, nextIndex);

      window.scrollTo(0, 0);

      setInProgress(false);
    }
  }

  function handlePreviousQuestions() {
    const previousIndex = currentQuestionIndex - questionsPerPage;

    setCurrentQuestionIndex(previousIndex);

    populateDataInLocalStorage(answers, previousIndex);

    window.scrollTo(0, 0);
  }

  function handleNextQuestions() {
    if (inProgress) return;

    const nextIndex = currentQuestionIndex + questionsPerPage;

    setCurrentQuestionIndex(nextIndex);

    populateDataInLocalStorage(answers, nextIndex);

    window.scrollTo(0, 0);

    if (restored) {
      setRestored(false);
    }
  }

  /*
   * Hanya digunakan ketika development.
   * Mengisi jawaban secara random agar tidak perlu
   * menjawab seluruh pertanyaan saat testing.
   */
  function skipToEnd() {
    const randomAnswers: Answer[] = questions
      .map((question) => ({
        id: question.id,
        score: Math.floor(Math.random() * 5) + 1,
        domain: question.domain,
        facet: question.facet
      }))
      .slice(0, questions.length - 1);

    setAnswers(randomAnswers);

    setCurrentQuestionIndex(questions.length - 1);
  }

  /*
   * Encode data menjadi Base64 URL-safe.
   *
   * Data ini nantinya dimasukkan ke URL sehingga
   * hasil bisa dibuka di browser/laptop lain
   * tanpa database.
   */
  function encodeResult(data: object) {
    const json = JSON.stringify(data);

    const bytes = new TextEncoder().encode(json);

    let binary = '';

    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });

    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  /*
   * Submit tes TANPA database.
   */
  // async function submitTest() {
  //   setLoading(true);

  //   confetti({});

  //   const resultData = {
  //     lang: language,
  //     dateStamp: Date.now(),
  //     answers
  //   };

  //   /*
  //    * Simpan hasil sementara pada browser.
  //    * Berguna apabila user masih berada
  //    * pada session browser yang sama.
  //    */
  //   sessionStorage.setItem(
  //     'b5result',
  //     JSON.stringify(resultData)
  //   );

  //   /*
  //    * Encode hasil untuk membuat share link.
  //    */
  //   const encodedResult =
  //     encodeResult(resultData);

  //   /*
  //    * Tes sudah selesai sehingga progress
  //    * lama tidak diperlukan lagi.
  //    */
  //   localStorage.removeItem('inProgress');
  //   localStorage.removeItem('b5data');

  //   /*
  //    * Hasil dibawa melalui URL.
  //    *
  //    * Contoh:
  //    * /result?r=eyJsYW5nIjoi...
  //    */
  //   router.push(
  //     `/result?r=${encodedResult}`
  //   );
  // }

  async function submitTest() {
    setLoading(true);
    confetti({});

    /*
     * Simpan versi lengkap hanya di session browser ini.
     */
    const localResultData = {
      lang: language,
      dateStamp: Date.now(),
      answers
    };

    sessionStorage.setItem('b5result', JSON.stringify(localResultData));

    /*
     * Buat data ringkas untuk share link.
     * Hanya menyimpan skor sesuai urutan pertanyaan.
     *
     * Contoh:
     * 3542154312...
     */
    const scoreString = questions
      .map((question) => {
        const answer = answers.find((item) => item.id === question.id);

        return answer?.score ?? 0;
      })
      .join('');

    /*
     * Payload share link dibuat sesingkat mungkin.
     *
     * v = versi format
     * l = language
     * s = scores
     */
    const shareData = {
      v: 1,
      l: language,
      s: scoreString
    };

    /*
     * Encode data ringkas ke URL-safe Base64.
     */
    const encodedResult = encodeResult(shareData);

    /*
     * Tes sudah selesai.
     * Progress pengerjaan tidak diperlukan lagi.
     */
    localStorage.removeItem('inProgress');
    localStorage.removeItem('b5data');

    /*
     * Buka halaman hasil.
     */
    router.push(`/result?r=${encodedResult}`);
  }

  function dataInLocalStorage() {
    return !!localStorage.getItem('inProgress');
  }

  /*
   * Simpan progress pengerjaan tes.
   */
  function populateDataInLocalStorage(
    currentAnswers: Answer[],
    questionIndex: number
  ) {
    localStorage.setItem('inProgress', 'true');

    localStorage.setItem(
      'b5data',
      JSON.stringify({
        answers: currentAnswers,
        currentQuestionIndex: questionIndex
      })
    );
  }

  /*
   * Restore progress setelah refresh.
   */
  function restoreDataFromLocalStorage() {
    const data = localStorage.getItem('b5data');

    if (!data) return;

    try {
      const { answers, currentQuestionIndex } = JSON.parse(data);

      setAnswers(answers);

      setCurrentQuestionIndex(currentQuestionIndex);

      setRestored(true);
    } catch (error) {
      console.error('Failed to restore test data:', error);

      clearDataInLocalStorage();
    }
  }

  /*
   * Menghapus progress dan memulai tes baru.
   */
  function clearDataInLocalStorage() {
    console.log('Clearing data from local storage');

    localStorage.removeItem('inProgress');

    localStorage.removeItem('b5data');

    location.reload();
  }

  return (
    <div className='mt-2'>
      <Progress
        aria-label='Progress bar'
        value={progress}
        className='max-w'
        showValueLabel={true}
        label={formatTimer(seconds)}
        minValue={0}
        maxValue={100}
        size='lg'
        classNames={{
          indicator: 'bg-orange-600'
        }}
      />

      {restored && (
        <Card className='mt-4 bg-warning/20 text-warning-600 dark:text-warning'>
          <CardHeader className='justify-between'>
            <Button isIconOnly variant='light' color='warning'>
              <InfoIcon />
            </Button>

            <p>
              Your answers have been restored. Click here to&nbsp;
              <a
                className='underline cursor-pointer'
                onClick={clearDataInLocalStorage}
                aria-label='Clear data'
              >
                start a new test
              </a>
              .
            </p>

            <Button
              isIconOnly
              variant='light'
              color='warning'
              onClick={() => setRestored(false)}
            >
              <CloseIcon />
            </Button>
          </CardHeader>
        </Card>
      )}

      {currentQuestions.map((question) => (
        <div key={'q' + question.num}>
          <h2 className='text-2xl my-4'>{question.text}</h2>

          <div>
            <RadioGroup
              onValueChange={(value) => handleAnswer(question.id, value)}
              value={answers
                .find((answer) => answer.id === question.id)
                ?.score.toString()}
              isDisabled={inProgress}
            >
              {question.choices.map((choice, index) => (
                <Radio
                  key={index + question.id}
                  value={choice.score.toString()}
                  classNames={{
                    wrapper: 'group-data-[selected=true]:border-orange-600',
                    control: 'bg-orange-600'
                  }}
                >
                  {choice.text}
                </Radio>
              ))}
            </RadioGroup>
          </div>
        </div>
      ))}

      <div className='my-12 space-x-4 inline-flex'>
        <Button
          className='bg-orange-600 text-white hover:bg-orange-700'
          isDisabled={backButtonDisabled}
          onClick={handlePreviousQuestions}
        >
          {prevText.toUpperCase()}
        </Button>

        <Button
          className='bg-orange-600 text-white hover:bg-orange-700'
          isDisabled={nextButtonDisabled}
          onClick={handleNextQuestions}
        >
          {nextText.toUpperCase()}
        </Button>

        {isTestDone && (
          <Button
            className='bg-orange-600 text-white hover:bg-orange-700'
            onClick={submitTest}
            disabled={loading}
            isLoading={loading}
          >
            {resultsText.toUpperCase()}
          </Button>
        )}

        {isDev && !isTestDone && (
          <Button className='bg-orange-600 text-white hover:bg-orange-700'>
            {nextText}
          </Button>
        )}
      </div>
    </div>
  );
};
