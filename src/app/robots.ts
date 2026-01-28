import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/admin/', '/dashboard/admin/'],
        },
        sitemap: 'https://solaris-ai.com/sitemap.xml',
    }
}
