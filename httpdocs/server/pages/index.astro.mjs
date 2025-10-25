import { c as createComponent, r as renderComponent, b as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_YlAN3CX0.mjs';
import 'kleur/colors';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_CRd09uuf.mjs';
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const API_URL = "http://localhost:4100";
  let todayData = null;
  try {
    const response = await fetch(`${API_URL}/api/today`);
    todayData = await response.json();
  } catch (error) {
    console.error("Failed to fetch today data:", error);
  }
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Home", "description": "Welcome to Pjuskeby \u2013 a living world of stories, characters and discoveries" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<section style="text-align: center; padding: 3rem 0;"> <h1 style="font-size: 3rem; margin-bottom: 1rem;">Welcome to Pjuskeby</h1> <p style="font-size: 1.25rem; color: #64748b; max-width: 600px; margin: 0 auto;">
An interactive storytelling experience with living characters, mysterious places and weekly updates.
</p> </section> ${todayData && renderTemplate`<section style="background: white; border-radius: 8px; padding: 2rem; margin: 2rem 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1);"> <h2 style="margin-bottom: 1rem;">Today on the Map</h2> <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;"> ${todayData.featured_person && renderTemplate`<div> <h3 style="color: #3b82f6;">📍 Person</h3> <p style="font-weight: bold;">${todayData.featured_person.name}</p> <p style="color: #64748b; font-size: 0.9rem;">${todayData.featured_person.occupation}</p> </div>`} ${todayData.featured_place && renderTemplate`<div> <h3 style="color: #10b981;">🏛️ Place</h3> <p style="font-weight: bold;">${todayData.featured_place.name}</p> <p style="color: #64748b; font-size: 0.9rem;">${todayData.featured_place.category}</p> </div>`} ${todayData.featured_street && renderTemplate`<div> <h3 style="color: #f59e0b;">🛣️ Street</h3> <p style="font-weight: bold;">${todayData.featured_street.name}</p> </div>`} </div> <a href="/kart" style="display: inline-block; margin-top: 1rem; color: #3b82f6; text-decoration: none;">
View on map →
</a> </section>`}<section style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin: 3rem 0;"> <div style="background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);"> <h2 style="margin-bottom: 1rem;">📚 Stories</h2> <p style="color: #64748b; margin-bottom: 1rem;">Follow life in Pjuskeby through diaries, rumors and events.</p> <a href="/historier" style="color: #3b82f6; text-decoration: none;">Read stories →</a> </div> <div style="background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);"> <h2 style="margin-bottom: 1rem;">👥 People</h2> <p style="color: #64748b; margin-bottom: 1rem;">Meet the colorful residents living in Pjuskeby.</p> <a href="/personer" style="color: #3b82f6; text-decoration: none;">View people →</a> </div> <div style="background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);"> <h2 style="margin-bottom: 1rem;">🗺️ Explore</h2> <p style="color: #64748b; margin-bottom: 1rem;">Interactive map of places, streets and events.</p> <a href="/kart" style="color: #3b82f6; text-decoration: none;">Open map →</a> </div> </section> ` })}`;
}, "/var/www/vhosts/pjuskeby.org/src/pages/index.astro", void 0);

const $$file = "/var/www/vhosts/pjuskeby.org/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
