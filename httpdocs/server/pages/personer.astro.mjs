import { c as createComponent, r as renderComponent, b as renderTemplate, m as maybeRenderHead, d as addAttribute } from '../chunks/astro/server_YlAN3CX0.mjs';
import 'kleur/colors';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_CRd09uuf.mjs';
import { readFile } from 'fs/promises';
import { join } from 'path';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const peopleData = JSON.parse(
    await readFile(join(process.cwd(), "content/data/people.normalized.json"), "utf-8")
  );
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "People", "description": "Meet the colorful residents of Pjuskeby", "data-astro-cid-t4lxohp6": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<h1 style="font-size: 2.5rem; margin-bottom: 2rem;" data-astro-cid-t4lxohp6>People in Pjuskeby</h1> <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;" data-astro-cid-t4lxohp6> ${peopleData.map((person) => renderTemplate`<a${addAttribute(`/personer/${person.slug}`, "href")} style="text-decoration: none; color: inherit;" data-astro-cid-t4lxohp6> <article style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); transition: transform 0.2s; cursor: pointer;" data-astro-cid-t4lxohp6> <h2 style="color: #3b82f6; margin-bottom: 0.5rem;" data-astro-cid-t4lxohp6>${person.name}</h2> <p style="color: #64748b; font-size: 0.9rem; margin-bottom: 0.5rem;" data-astro-cid-t4lxohp6> ${person.age} years old • ${person.occupation} </p> ${person.bio && renderTemplate`<p style="color: #475569; font-size: 0.9rem; line-height: 1.5;" data-astro-cid-t4lxohp6> ${person.bio.slice(0, 100)}${person.bio.length > 100 ? "..." : ""} </p>`} </article> </a>`)} </div> ` })} `;
}, "/var/www/vhosts/pjuskeby.org/src/pages/personer/index.astro", void 0);

const $$file = "/var/www/vhosts/pjuskeby.org/src/pages/personer/index.astro";
const $$url = "/personer";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
