import { c as createComponent, a as createAstro, d as addAttribute, r as renderComponent, F as Fragment, b as renderTemplate, u as unescapeHTML, j as renderSlot, k as renderHead } from './astro/server_YlAN3CX0.mjs';
import 'kleur/colors';
/* empty css                          */

var __freeze$1 = Object.freeze;
var __defProp$1 = Object.defineProperty;
var __template$1 = (cooked, raw) => __freeze$1(__defProp$1(cooked, "raw", { value: __freeze$1(cooked.slice()) }));
var _a$1;
const $$Astro$1 = createAstro();
const $$SEO = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$SEO;
  const {
    title,
    description,
    canonical,
    ogType = "website",
    ogImage = "/og-image.png",
    article,
    structuredData,
    podcastRssFeed
  } = Astro2.props;
  const baseUrl = "https://pjuskeby.org";
  const fullCanonical = canonical ? `${baseUrl}${canonical}` : `${baseUrl}${Astro2.url.pathname}`;
  const fullOgImage = ogImage.startsWith("http") ? ogImage : `${baseUrl}${ogImage}`;
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Pjuskeby",
    "url": baseUrl,
    "logo": `${baseUrl}/favicon.svg`,
    "description": "Interactive storytelling platform featuring AI-generated daily stories from the whimsical Norwegian coastal town of Pjuskeby",
    "sameAs": []
  };
  const combinedStructuredData = structuredData ? [organizationSchema, structuredData] : [organizationSchema];
  return renderTemplate`<!-- Primary Meta Tags --><title>${title} | Pjuskeby</title><meta name="title"${addAttribute(`${title} | Pjuskeby`, "content")}><meta name="description"${addAttribute(description, "content")}><link rel="canonical"${addAttribute(fullCanonical, "href")}><!-- Open Graph / Facebook --><meta property="og:type"${addAttribute(ogType, "content")}><meta property="og:url"${addAttribute(fullCanonical, "content")}><meta property="og:title"${addAttribute(`${title} | Pjuskeby`, "content")}><meta property="og:description"${addAttribute(description, "content")}><meta property="og:image"${addAttribute(fullOgImage, "content")}><meta property="og:site_name" content="Pjuskeby"><meta property="og:locale" content="en_US">${article && renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result2) => renderTemplate`<meta property="article:published_time"${addAttribute(article.publishedTime, "content")}>${article.modifiedTime && renderTemplate`<meta property="article:modified_time"${addAttribute(article.modifiedTime, "content")}>`}${article.author && renderTemplate`<meta property="article:author"${addAttribute(article.author, "content")}>`}${article.section && renderTemplate`<meta property="article:section"${addAttribute(article.section, "content")}>`}${article.tags && article.tags.map((tag) => renderTemplate`<meta property="article:tag"${addAttribute(tag, "content")}>`)}` })}`}<!-- Twitter --><meta property="twitter:card" content="summary_large_image"><meta property="twitter:url"${addAttribute(fullCanonical, "content")}><meta property="twitter:title"${addAttribute(`${title} | Pjuskeby`, "content")}><meta property="twitter:description"${addAttribute(description, "content")}><meta property="twitter:image"${addAttribute(fullOgImage, "content")}><!-- Additional SEO --><meta name="robots" content="index, follow"><meta name="language" content="English"><meta name="author" content="Pjuskeby"><!-- Podcast RSS Feed -->${podcastRssFeed && renderTemplate`<link rel="alternate" type="application/rss+xml" title="Stories from Pjuskeby Podcast"${addAttribute(podcastRssFeed, "href")}>`}<!-- JSON-LD Structured Data -->${combinedStructuredData.map((schema) => renderTemplate(_a$1 || (_a$1 = __template$1(['<script type="application/ld+json">', "<\/script>"])), unescapeHTML(JSON.stringify(schema))))}`;
}, "/var/www/vhosts/pjuskeby.org/src/components/SEO.astro", void 0);

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro();
const $$BaseLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$BaseLayout;
  const {
    title,
    description = "Welcome to Pjuskeby \u2013 an interactive storytelling platform",
    canonical,
    ogType,
    ogImage,
    article,
    structuredData,
    podcastRssFeed
  } = Astro2.props;
  return renderTemplate(_a || (_a = __template(['<html lang="en" data-astro-cid-37fxchfa> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="manifest" href="/manifest.json"><meta name="theme-color" content="#1e293b">', '<!-- SkyDash Analytics --><script src="https://smartesider.skydash.no/marketing/websites/6/tracking-script"><\/script>', '</head> <body data-astro-cid-37fxchfa> <nav data-astro-cid-37fxchfa> <ul data-astro-cid-37fxchfa> <li data-astro-cid-37fxchfa><a href="/" data-astro-cid-37fxchfa>Home</a></li> <li data-astro-cid-37fxchfa><a href="/historier" data-astro-cid-37fxchfa>Stories</a></li> <li data-astro-cid-37fxchfa><a href="/podcast" data-astro-cid-37fxchfa>Podcast</a></li> <li data-astro-cid-37fxchfa><a href="/personer" data-astro-cid-37fxchfa>People</a></li> <li data-astro-cid-37fxchfa><a href="/bedrifter" data-astro-cid-37fxchfa>Businesses</a></li> <li data-astro-cid-37fxchfa><a href="/steder" data-astro-cid-37fxchfa>Places</a></li> <li data-astro-cid-37fxchfa><a href="/kart" data-astro-cid-37fxchfa>Map</a></li> <li data-astro-cid-37fxchfa><a href="/stott-oss" data-astro-cid-37fxchfa>Support Us</a></li> </ul> </nav> <main data-astro-cid-37fxchfa> ', " </main> <footer data-astro-cid-37fxchfa> <p data-astro-cid-37fxchfa>&copy; ", " Pjuskeby. All rights reserved.</p> </footer> </body></html>"])), renderComponent($$result, "SEO", $$SEO, { "title": title, "description": description, "canonical": canonical, "ogType": ogType, "ogImage": ogImage, "article": article, "structuredData": structuredData, "podcastRssFeed": podcastRssFeed, "data-astro-cid-37fxchfa": true }), renderHead(), renderSlot($$result, $$slots["default"]), (/* @__PURE__ */ new Date()).getFullYear());
}, "/var/www/vhosts/pjuskeby.org/src/layouts/BaseLayout.astro", void 0);

export { $$BaseLayout as $ };
