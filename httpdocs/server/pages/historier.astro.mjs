import { c as createComponent, r as renderComponent, b as renderTemplate, m as maybeRenderHead, d as addAttribute } from '../chunks/astro/server_YlAN3CX0.mjs';
import 'kleur/colors';
import { g as getCollection } from '../chunks/_astro_content_CMlsy09b.mjs';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_CRd09uuf.mjs';
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const stories = await getCollection("stories", ({ data }) => {
    return data.published;
  });
  const sortedStories = stories.sort((a, b) => {
    const dateCompare = new Date(b.data.date).getTime() - new Date(a.data.date).getTime();
    if (dateCompare !== 0) return dateCompare;
    return b.slug.localeCompare(a.slug);
  });
  const storyTypeLabels = {
    "agatha-diary": "Agatha's Diary",
    "rumor": "Town Rumors",
    "event": "Events"
  };
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Stories from Pjuskeby", "description": "Daily stories and tales from around town" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<h1 style="font-size: 2.5rem; margin-bottom: 2rem;">📖 Daily Stories</h1> ${sortedStories.length === 0 ? renderTemplate`<div style="background: white; padding: 3rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center;"> <p style="font-size: 2rem; margin-bottom: 1rem;">📚</p> <h2 style="margin-bottom: 1rem;">Stories coming soon</h2> <p style="color: #64748b; max-width: 600px; margin: 0 auto;">
AI-generated daily stories will be published here. Follow Agatha's life, town rumors, and events in Pjuskeby.
</p> </div>` : renderTemplate`<div style="display: grid; gap: 2rem;"> ${sortedStories.map((story) => renderTemplate`<article style="background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)'"> <div style="display: inline-block; background: #3498db; color: white; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.875rem; font-weight: 600; margin-bottom: 1rem;"> ${storyTypeLabels[story.data.type]} </div> <h2 style="margin: 0 0 0.5rem 0; font-size: 1.5rem;"> <a${addAttribute(`/historier/${story.slug}`, "href")} style="color: #2c3e50; text-decoration: none;"> ${story.data.title} </a> </h2> <time${addAttribute(story.data.date, "datetime")} style="display: block; color: #95a5a6; font-size: 0.9rem; margin-bottom: 1rem;"> ${new Date(story.data.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  })} </time> <p style="line-height: 1.6; color: #555; margin-bottom: 1rem;">${story.data.summary}</p> ${story.data.characters && story.data.characters.length > 0 && renderTemplate`<div style="font-size: 0.9rem; color: #7f8c8d; margin-bottom: 0.5rem;"> <strong style="color: #2c3e50;">Characters:</strong> ${story.data.characters.join(", ")} </div>`} ${story.data.locations && story.data.locations.length > 0 && renderTemplate`<div style="font-size: 0.9rem; color: #7f8c8d; margin-bottom: 0.5rem;"> <strong style="color: #2c3e50;">Locations:</strong> ${story.data.locations.join(", ")} </div>`} <a${addAttribute(`/historier/${story.slug}`, "href")} style="display: inline-block; margin-top: 1rem; color: #3498db; text-decoration: none; font-weight: 600;">
Read full story →
</a> </article>`)} </div>`}<section style="margin-top: 3rem;"> <h2 style="margin-bottom: 1.5rem;">Story Series</h2> <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;"> <div style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);"> <h3 style="color: #3b82f6; margin-bottom: 0.5rem;">📖 Agatha's Diary</h3> <p style="color: #64748b; font-size: 0.9rem;">Personal entries from Agatha's life in Pjuskeby.</p> </div> <div style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);"> <h3 style="color: #10b981; margin-bottom: 0.5rem;">💬 Town Rumors</h3> <p style="color: #64748b; font-size: 0.9rem;">Gossip, rumors and news from the residents.</p> </div> <div style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);"> <h3 style="color: #f59e0b; margin-bottom: 0.5rem;">⚡ Events</h3> <p style="color: #64748b; font-size: 0.9rem;">Happenings and experiences in Pjuskeby.</p> </div> </div> </section> ` })}`;
}, "/var/www/vhosts/pjuskeby.org/src/pages/historier/index.astro", void 0);

const $$file = "/var/www/vhosts/pjuskeby.org/src/pages/historier/index.astro";
const $$url = "/historier";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
