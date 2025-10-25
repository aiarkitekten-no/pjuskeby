import { g as getCollection } from '../chunks/_astro_content_CMlsy09b.mjs';
import mysql from 'mysql2/promise';
export { renderers } from '../renderers.mjs';

const pool = mysql.createPool({
  host: process.env.DATABASE_HOST || "localhost",
  user: process.env.DATABASE_USER || "root",
  password: process.env.DATABASE_PASSWORD || "",
  database: process.env.DATABASE_NAME || "pjuskeby",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
const GET = async () => {
  const stories = await getCollection("stories", ({ data }) => data.published);
  let people = [];
  let places = [];
  try {
    const [peopleRows] = await pool.query("SELECT slug FROM people ORDER BY slug");
    const [placesRows] = await pool.query("SELECT slug FROM places ORDER BY slug");
    people = peopleRows;
    places = placesRows;
  } catch (error) {
    console.error("Database query failed:", error);
  }
  const baseUrl = "https://pjuskeby.org";
  const staticPages = [
    { url: "", priority: 1, changefreq: "daily" },
    { url: "/historier", priority: 0.9, changefreq: "daily" },
    { url: "/podcast", priority: 0.9, changefreq: "weekly" },
    { url: "/personer", priority: 0.8, changefreq: "weekly" },
    { url: "/steder", priority: 0.8, changefreq: "weekly" },
    { url: "/kart", priority: 0.7, changefreq: "weekly" },
    { url: "/stott-oss", priority: 0.6, changefreq: "monthly" }
  ];
  const storyPages = stories.map((story) => ({
    url: `/historier/${story.slug}`,
    priority: 0.7,
    changefreq: "monthly",
    lastmod: story.data.date.toISOString()
  }));
  const peoplePages = people.map((person) => ({
    url: `/personer/${person.slug}`,
    priority: 0.6,
    changefreq: "monthly"
  }));
  const placePages = places.map((place) => ({
    url: `/steder/${place.slug}`,
    priority: 0.6,
    changefreq: "monthly"
  }));
  const allPages = [...staticPages, ...storyPages, ...peoplePages, ...placePages];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map((page) => `  <url>
    <loc>${baseUrl}${page.url}</loc>${page.lastmod ? `
    <lastmod>${page.lastmod}</lastmod>` : ""}
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join("\n")}
</urlset>`;
  return new Response(sitemap, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8"
    }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
