import { getTranslations } from 'next-intl/server';

export type SiteConfig = typeof siteConfig;

export const basePath = 'https://bigfive-test.com';

export const supportEmail = 'bigfive-test@rubynor.com';

export type Language = {
  code: string;
  name: string;
  countryCode?: string;
  map?: string[];
};

export const languages: Language[] = [
  { code: 'en', name: 'English', countryCode: 'us', map: ['en-GB'] },
  { code: 'id', name: 'Indonesian', countryCode: 'id' }
];

export const locales = languages.map((lang) => lang.code) as string[];

export const siteConfig = {
  name: 'Big Five Personality Test',
  creator: '@maccyber',
  description:
    'Learn to know yourself better with a free, open-source personality test.',
  navItems: [
    {
      label: 'home',
      href: '/'
    },
    {
      label: 'result',
      href: '/result'
    },
    // {
    //   label: 'compare',
    //   href: '/compare'
    // },
    // {
    //   label: 'articles',
    //   href: '/articles'
    // },
    // {
    //   label: 'about',
    //   href: '/about'
    // }
  ],
  navMenuItems: [
    {
      label: 'home',
      href: '/'
    },
    {
      label: 'see_results',
      href: '/result'
    },
    // {
    //   label: 'compare_with',
    //   href: '/compare'
    // },
    // {
    //   label: 'articles',
    //   href: '/articles'
    // },
    // {
    //   label: 'privacy',
    //   href: '/privacy'
    // },
    // {
    //   label: 'about',
    //   href: '/about'
    // },
    // {
    //   label: 'faq',
    //   href: '/faq'
    // }
  ],
  footerLinks: [
    // {
    //   label: 'home',
    //   href: '/'
    // },
    // {
    //   label: 'articles',
    //   href: '/articles'
    // },
    // {
    //   label: 'privacy',
    //   href: '/privacy'
    // },
    // {
    //   label: 'about',
    //   href: '/about'
    // }
    // {
    //   label: 'faq',
    //   href: '/faq'
    // }
  ],
  links: {
    instagram: 'https://www.instagram.com/himasif',
    tiktok: 'https://www.tiktok.com/@himasifuj',
    youtube: 'https://www.youtube.com/@himasif',
    website: 'https://himasif.id/'
  }
};

export const getNavItems = async ({
  locale,
  linkType
}: {
  locale: string;
  linkType: 'navItems' | 'navMenuItems' | 'footerLinks';
}) => {
  const t = await getTranslations({ locale, namespace: 'toolbar' });
  return siteConfig[linkType].map((link) => ({
    label: t(`${link.label}`),
    href: link.href
  }));
};
