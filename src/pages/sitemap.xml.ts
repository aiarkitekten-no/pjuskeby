/**
 * Dynamic Sitemap for Pjuskeby
 * Includes all static pages, stories, people, and places
 */

import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import mysql from 'mysql2/promise';

// Database connection for sitemap
const pool = mysql.createPool({
  host: process.env.DATABASE_HOST || 'localhost',
  user: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE_NAME || 'pjuskeby',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export const GET: APIRoute = async () => {
  // Get all stories
  const stories = await getCollection('stories', ({ data }) => data.published);

  // Get all people and places from database
  let people: any[] = [];
  let places: any[] = [];

  try {
    const [peopleRows] = await pool.query('SELECT slug FROM people ORDER BY slug');
    const [placesRows] = await pool.query('SELECT slug FROM places ORDER BY slug');
    people = peopleRows as any[];
    places = placesRows as any[];
  } catch (error) {
    console.error('Database query failed:', error);
  }

  const baseUrl = 'https://pjuskeby.org';

  // Static pages
  const staticPages = [
    { url: '', priority: 1.0, changefreq: 'daily' },
    { url: '/historier', priority: 0.9, changefreq: 'daily' },
    { url: '/podcast', priority: 0.9, changefreq: 'weekly' },
    { url: '/personer', priority: 0.8, changefreq: 'weekly' },
    { url: '/steder', priority: 0.8, changefreq: 'weekly' },
    { url: '/kart', priority: 0.7, changefreq: 'weekly' },
    { url: '/stott-oss', priority: 0.6, changefreq: 'monthly' },
  ];

  // Story pages
  const storyPages = stories.map(story => ({
    url: `/historier/${story.slug}`,
    priority: 0.7,
    changefreq: 'monthly',
    lastmod: story.data.date.toISOString()
  }));

  // People pages
  const peoplePages = people.map(person => ({
    url: `/personer/${person.slug}`,
    priority: 0.6,
    changefreq: 'monthly'
  }));

  // Place pages
  const placePages = places.map(place => ({
    url: `/steder/${place.slug}`,
    priority: 0.6,
    changefreq: 'monthly'
  }));

  const allPages = [...staticPages, ...storyPages, ...peoplePages, ...placePages];

  // Generate XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>${page.lastmod ? `
    <lastmod>${page.lastmod}</lastmod>` : ''}
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
