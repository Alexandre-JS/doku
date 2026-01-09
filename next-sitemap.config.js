/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://documoz.com',
  generateRobotsTxt: true, // (optional)
  exclude: ['/admin', '/admin/*', '/profile', '/api/*'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/profile', '/api'],
      },
    ],
  },
}
