import { c as createComponent, r as renderComponent, b as renderTemplate, m as maybeRenderHead, d as addAttribute } from '../chunks/astro/server_YlAN3CX0.mjs';
import 'kleur/colors';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_CRd09uuf.mjs';
import { readFile } from 'fs/promises';
import { join } from 'path';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const placesData = JSON.parse(
    await readFile(join(process.cwd(), "content/data/places.normalized.json"), "utf-8")
  );
  const categories = {
    "cafe": "\u2615 Caf\xE9",
    "park": "\u{1F333} Park",
    "landmark": "\u{1F3DB}\uFE0F Landmark",
    "fictional": "\u2728 Fictional",
    "shop": "\u{1F6CD}\uFE0F Shop",
    "other": "\u{1F4CD} Other"
  };
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Places", "description": "Explore the places in Pjuskeby", "data-astro-cid-4fuskwbl": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<h1 style="font-size: 2.5rem; margin-bottom: 2rem;" data-astro-cid-4fuskwbl>Places in Pjuskeby</h1> <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem;" data-astro-cid-4fuskwbl> ${placesData.map((place) => renderTemplate`<a${addAttribute(`/steder/${place.slug}`, "href")} style="text-decoration: none; color: inherit;" data-astro-cid-4fuskwbl> <article style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); transition: transform 0.2s; cursor: pointer; height: 100%;" data-astro-cid-4fuskwbl> <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;" data-astro-cid-4fuskwbl> <h2 style="color: #10b981; margin: 0;" data-astro-cid-4fuskwbl>${place.name}</h2> </div> <p style="background: #d1fae5; color: #065f46; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.85rem; display: inline-block; margin-bottom: 1rem;" data-astro-cid-4fuskwbl> ${categories[place.category] || place.category} </p> ${place.description && renderTemplate`<p style="color: #475569; font-size: 0.9rem; line-height: 1.5;" data-astro-cid-4fuskwbl> ${place.description.slice(0, 120)}${place.description.length > 120 ? "..." : ""} </p>`} </article> </a>`)} </div> ` })} `;
}, "/var/www/vhosts/pjuskeby.org/src/pages/steder/index.astro", void 0);

const $$file = "/var/www/vhosts/pjuskeby.org/src/pages/steder/index.astro";
const $$url = "/steder";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
