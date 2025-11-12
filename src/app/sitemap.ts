import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: 'https://imutask.com',
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: 'https://imutask.com/tasks',
            lastModified: new Date(),
            changeFrequency: 'hourly',
            priority: 0.9,
        },
    ];
}
