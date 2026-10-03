import { MetadataRoute } from 'next';
import { basePath, locales } from '@/config/site';

const articles = [
  'agreeableness',
  'conscientiousness',
  'extraversion',
  'neuroticism',
  'openness',
  'conscientiousness_longevity',
  'bigfive_relationships',
  'personality_diseases',
  'the_dark_of_personality',
  'link_between_personality_trais_psychological_needs'
];

export default function sitemap(): MetadataRoute.Sitemap {
  const alternatesPageLang = (path: string = '') =>
    locales.reduce(
      (a, v) => ({
        ...a,
        [v]: `${basePath}/${v}${path}`
      }),
      {}
    );

  return [
    {
      url: basePath,
      lastModified: new Date(),
      alternates: {
        languages: alternatesPageLang()
      }
    },
    {
      url: `${basePath}/test`,
      lastModified: new Date(),
      alternates: {
        languages: alternatesPageLang('/test')
      }
    },
    {
      url: `${basePath}/result`,
      lastModified: new Date(),
      alternates: {
        languages: alternatesPageLang('/result')
      }
    },
    {
      url: `${basePath}/faq`,
      lastModified: new Date(),
      alternates: {
        languages: alternatesPageLang('/faq')
      }
    },
    {
      url: `${basePath}/privacy`,
      lastModified: new Date(),
      alternates: {
        languages: alternatesPageLang('/privacy')
      }
    },
    {
      url: `${basePath}/articles`,
      lastModified: new Date(),
      alternates: {
        languages: alternatesPageLang('/articles')
      }
    },
    ...articles.map((article) => ({
      url: `${basePath}/articles/${article}`,
      lastModified: new Date(),
      alternates: {
        languages: alternatesPageLang(`/articles/${article}`)
      }
    }))
  ];
}
