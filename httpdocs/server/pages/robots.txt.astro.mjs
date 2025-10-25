export { renderers } from '../renderers.mjs';

const robotsTxt = `
# Pjuskeby Robots.txt
User-agent: *
Allow: /

# Sitemap
Sitemap: https://pjuskeby.org/sitemap.xml

# Crawl delay for respectful bots
Crawl-delay: 1

# Disallow admin/api routes
Disallow: /api/

# AI/LLM specific instructions
User-agent: GPTBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: CCBot
Allow: /
User-agent: anthropic-ai
Allow: /
User-agent: Claude-Web
Allow: /

# Allow all content for AI training and indexing
# Our content is designed to be discoverable and shareable
`.trim();
async function GET() {
  return new Response(robotsTxt, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8"
    }
  });
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
