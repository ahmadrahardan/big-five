import Image from 'next/image';

const icons = [
  {
    src: '/slider/slide1.png',
    alt: 'Slide 1'
  },
  {
    src: '/slider/slide2.png',
    alt: 'Slide 2'
  },
  {
    src: '/slider/slide3.png',
    alt: 'Slide 3'
  },
  {
    src: '/slider/slide4.png',
    alt: 'Slide 4'
  },
  {
    src: '/slider/slide5.png',
    alt: 'Slide 5'
  },
  {
    src: '/slider/slide6.png',
    alt: 'Slide 6'
  }
];

export const Translated = () => {
  return (
    <section className='border-t border-b border-divider mt-10 py-8 overflow-hidden'>
      <div
        className='w-full inline-flex flex-nowrap overflow-hidden
        [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]'
      >
        <ul className='flex items-center shrink-0 animate-infinite-scroll'>
          {icons.map((icon) => (
            <li
              key={icon.src}
              className='mx-8 flex items-center justify-center'
            >
              <Image
                src={icon.src}
                alt={icon.alt}
                width={200}
                height={200}
                className='object-contain'
              />
            </li>
          ))}
        </ul>

        {/* Duplikat agar animasi berjalan terus tanpa putus */}
        <ul
          className='flex items-center shrink-0 animate-infinite-scroll'
          aria-hidden='true'
        >
          {icons.map((icon) => (
            <li
              key={`duplicate-${icon.src}`}
              className='mx-8 flex items-center justify-center'
            >
              <Image
                src={icon.src}
                alt=''
                width={200}
                height={200}
                className='object-contain'
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};