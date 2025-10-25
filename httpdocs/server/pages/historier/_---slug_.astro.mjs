import { c as createComponent, a as createAstro, r as renderComponent, b as renderTemplate, m as maybeRenderHead, e as renderScript, d as addAttribute } from '../../chunks/astro/server_YlAN3CX0.mjs';
import 'kleur/colors';
import { g as getCollection } from '../../chunks/_astro_content_CMlsy09b.mjs';
import { $ as $$BaseLayout } from '../../chunks/BaseLayout_CRd09uuf.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro();
const $$ = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$;
  const { slug } = Astro2.params;
  const stories = await getCollection("stories");
  const story = stories.find((s) => s.slug === slug);
  if (!story) {
    return Astro2.redirect("/404");
  }
  const { Content } = await story.render();
  const storyTypeLabels = {
    "agatha-diary": "Agatha's Diary",
    "rumor": "Town Rumors",
    "event": "Events"
  };
  const hasIllustrations = story.data.hasIllustrations !== false;
  const featuredImage = story.data.featuredImage || (hasIllustrations ? `/assets/agatha/story/${slug}-featured.png` : null);
  const inline1Image = `/assets/agatha/story/${slug}-inline1.png`;
  const inline2Image = `/assets/agatha/story/${slug}-inline2.png`;
  console.log("[DEBUG] Story:", slug, "hasIllustrations:", hasIllustrations, "inline1:", inline1Image, "inline2:", inline2Image);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "headline": story.data.title,
    "description": story.data.summary,
    "datePublished": story.data.date.toISOString(),
    "author": {
      "@type": "Person",
      "name": "Agatha Splint"
    },
    ...featuredImage && {
      "image": featuredImage
    }
  };
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": story.data.title, "description": story.data.summary, "ogType": "article", "article": {
    publishedTime: story.data.date.toISOString(),
    section: storyTypeLabels[story.data.type],
    tags: story.data.characters || []
  }, "structuredData": structuredData }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<article style="max-width: 900px; margin: 0 auto;"> <header style="margin-bottom: 2rem;"> <div style="color: #64748b; font-size: 0.9rem; margin-bottom: 0.5rem;"> ${new Date(story.data.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  })} </div> <h1 style="font-size: 2.5rem; margin-bottom: 1rem; font-family: Georgia, serif;">${story.data.title}</h1> <div style="display: inline-block; background: #e0f2fe; color: #0369a1; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.9rem;"> ${storyTypeLabels[story.data.type]} </div> </header> <!-- Featured Image - Left aligned, max 500x500px --> ${featuredImage && renderTemplate`<div style="float: left; margin: 0 2rem 1rem 0; max-width: 500px;"> <img${addAttribute(featuredImage, "src")}${addAttribute(`Illustration for ${story.data.title} by Agatha Splint`, "alt")} style="width: 100%; max-width: 500px; height: auto; display: block; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" loading="eager"> <div style="font-size: 0.85rem; color: #64748b; font-style: italic; margin-top: 0.5rem;">
Illustrated by Agatha Splint
</div> </div>`} <!-- Inline images are now embedded via <agatha-illustration> tags in MDX content --> <div style="font-size: 1.125rem; line-height: 1.75; color: #1e293b; font-family: Georgia, serif;"> ${renderComponent($$result2, "Content", Content, {})} </div> <!-- Inline illustrations are embedded via custom component in MDX --> ${renderScript($$result2, "/var/www/vhosts/pjuskeby.org/src/pages/historier/[...slug].astro?astro&type=script&index=0&lang.ts")} ${story.data.characters && story.data.characters.length > 0 && renderTemplate`<section style="background: #f8fafc; padding: 1.5rem; border-radius: 8px; margin-top: 2rem;"> <h2 style="font-size: 1.25rem; margin-bottom: 1rem;">👤 Featured Characters</h2> <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;"> ${story.data.characters.map((char) => {
    const slug2 = char.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return renderTemplate`<a${addAttribute(`/personer/${slug2}`, "href")} style="background: white; padding: 0.5rem 1rem; border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); text-decoration: none; color: #3b82f6; transition: all 0.2s ease; display: inline-block;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.1)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 1px 2px rgba(0,0,0,0.05)';"> ${char} </a>`;
  })} </div> </section>`} ${story.data.locations && story.data.locations.length > 0 && renderTemplate`<section style="background: #f0fdf4; padding: 1.5rem; border-radius: 8px; margin-top: 1rem;"> <h2 style="font-size: 1.25rem; margin-bottom: 1rem;">� Featured Locations</h2> <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;"> ${story.data.locations.map((loc) => {
    const slug2 = loc.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return renderTemplate`<a${addAttribute(`/steder/${slug2}`, "href")} style="background: white; padding: 0.5rem 1rem; border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); text-decoration: none; color: #10b981; transition: all 0.2s ease; display: inline-block;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.1)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 1px 2px rgba(0,0,0,0.05)';"> ${loc} </a>`;
  })} </div> </section>`} <div style="margin-top: 2rem;"> <a href="/historier" style="color: #3b82f6; text-decoration: none;">← Back to all stories</a> </div> </article> ` })}`;
}, "/var/www/vhosts/pjuskeby.org/src/pages/historier/[...slug].astro", void 0);

const $$file = "/var/www/vhosts/pjuskeby.org/src/pages/historier/[...slug].astro";
const $$url = "/historier/[...slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
