import { MetadataRoute } from 'next';
import { basePath, locales } from '@/config/site';

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
    }
  ];
}
