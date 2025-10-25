import { c as createComponent, a as createAstro, r as renderComponent, b as renderTemplate, f as defineScriptVars, d as addAttribute, m as maybeRenderHead } from '../../chunks/astro/server_YlAN3CX0.mjs';
import 'kleur/colors';
import { $ as $$BaseLayout } from '../../chunks/BaseLayout_CRd09uuf.mjs';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
export { renderers } from '../../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$Astro = createAstro();
const $$slug = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$slug;
  const { slug } = Astro2.params;
  const placesData = JSON.parse(
    await readFile(join(process.cwd(), "content/data/places.normalized.json"), "utf-8")
  );
  const place = placesData.find((p) => p.slug === slug);
  if (!place) {
    return Astro2.redirect("/404");
  }
  let extendedData = {};
  try {
    const extendedPath = join(process.cwd(), `content/data/${slug}-extended.json`);
    if (existsSync(extendedPath)) {
      extendedData = JSON.parse(await readFile(extendedPath, "utf-8"));
    }
  } catch (e) {
  }
  const fullPlace = { ...place, ...extendedData };
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": fullPlace.name }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template([" ", '<article style="max-width: 800px; margin: 0 auto;"> <!-- Header with image if available --> ', ' <h1 style="font-size: 2.5rem; margin-bottom: 0.5rem;">', "</h1> ", '  <p style="font-size: 1.25rem; color: #475569; line-height: 1.8; margin: 2rem 0;"> ', " </p>  ", "  ", ' <!-- Stories mentioning this place --> <div style="background: white; border-radius: 16px; padding: 2rem; box-shadow: 0 4px 20px rgba(0,0,0,0.08); margin-top: 2rem;"> <h2 style="font-size: 1.5rem; font-weight: 700; color: #1e293b; margin: 0 0 1.5rem 0;"> <span>\u{1F4D6}</span> Stories & Experiences\n</h2> <div id="stories-loading" style="text-align: center; padding: 2rem;"> <p style="color: #64748b; font-size: 1.1rem;">\u{1F50D} Loading stories...</p> </div> <div id="stories-list" style="display: none;"></div> <div id="stories-empty" style="display: none; text-align: center; padding: 2rem;"> <p style="color: #64748b; font-size: 1.1rem;">\n\u{1F31F} No stories about ', " yet...\n</p> </div> </div> <script>(function(){", `
      fetch(\`https://pjuskeby.org/api/entities/place/\${slug}/stories\`)
        .then(res => res.json())
        .then(data => {
          const loadingEl = document.getElementById('stories-loading');
          const listEl = document.getElementById('stories-list');
          const emptyEl = document.getElementById('stories-empty');
          
          if (loadingEl) loadingEl.style.display = 'none';
          
          if (data.stories && data.stories.length > 0) {
            if (listEl) {
              listEl.style.display = 'block';
              listEl.innerHTML = data.stories.map(story => \`
                <a href="\${story.url}" style="display: block; text-decoration: none; color: inherit; padding: 1.25rem; background: #f8fafc; border-radius: 12px; margin-bottom: 1rem; border-left: 4px solid #10b981; transition: all 0.2s ease;">
                  <div style="font-size: 1.1rem; font-weight: 600; color: #1e293b; margin-bottom: 0.5rem;">
                    \${story.title}
                  </div>
                  \${story.excerpt ? \`
                    <p style="color: #64748b; font-size: 0.95rem; margin-bottom: 0.75rem; line-height: 1.6;">
                      \${story.excerpt}
                    </p>
                  \` : ''}
                  <div style="color: #94a3b8; font-size: 0.85rem;">
                    \u{1F4C5} \${new Date(story.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </a>
              \`).join('');
            }
          } else {
            if (emptyEl) emptyEl.style.display = 'block';
          }
        })
        .catch(err => {
          console.error('Failed to load stories:', err);
          const loadingEl = document.getElementById('stories-loading');
          const emptyEl = document.getElementById('stories-empty');
          if (loadingEl) loadingEl.style.display = 'none';
          if (emptyEl) emptyEl.style.display = 'block';
        });
    })();<\/script> <div style="margin-top: 2rem;"> <a href="/steder" style="color: #3b82f6; text-decoration: none;">\u2190 Back to all places</a> </div> </article> `], [" ", '<article style="max-width: 800px; margin: 0 auto;"> <!-- Header with image if available --> ', ' <h1 style="font-size: 2.5rem; margin-bottom: 0.5rem;">', "</h1> ", '  <p style="font-size: 1.25rem; color: #475569; line-height: 1.8; margin: 2rem 0;"> ', " </p>  ", "  ", ' <!-- Stories mentioning this place --> <div style="background: white; border-radius: 16px; padding: 2rem; box-shadow: 0 4px 20px rgba(0,0,0,0.08); margin-top: 2rem;"> <h2 style="font-size: 1.5rem; font-weight: 700; color: #1e293b; margin: 0 0 1.5rem 0;"> <span>\u{1F4D6}</span> Stories & Experiences\n</h2> <div id="stories-loading" style="text-align: center; padding: 2rem;"> <p style="color: #64748b; font-size: 1.1rem;">\u{1F50D} Loading stories...</p> </div> <div id="stories-list" style="display: none;"></div> <div id="stories-empty" style="display: none; text-align: center; padding: 2rem;"> <p style="color: #64748b; font-size: 1.1rem;">\n\u{1F31F} No stories about ', " yet...\n</p> </div> </div> <script>(function(){", `
      fetch(\\\`https://pjuskeby.org/api/entities/place/\\\${slug}/stories\\\`)
        .then(res => res.json())
        .then(data => {
          const loadingEl = document.getElementById('stories-loading');
          const listEl = document.getElementById('stories-list');
          const emptyEl = document.getElementById('stories-empty');
          
          if (loadingEl) loadingEl.style.display = 'none';
          
          if (data.stories && data.stories.length > 0) {
            if (listEl) {
              listEl.style.display = 'block';
              listEl.innerHTML = data.stories.map(story => \\\`
                <a href="\\\${story.url}" style="display: block; text-decoration: none; color: inherit; padding: 1.25rem; background: #f8fafc; border-radius: 12px; margin-bottom: 1rem; border-left: 4px solid #10b981; transition: all 0.2s ease;">
                  <div style="font-size: 1.1rem; font-weight: 600; color: #1e293b; margin-bottom: 0.5rem;">
                    \\\${story.title}
                  </div>
                  \\\${story.excerpt ? \\\`
                    <p style="color: #64748b; font-size: 0.95rem; margin-bottom: 0.75rem; line-height: 1.6;">
                      \\\${story.excerpt}
                    </p>
                  \\\` : ''}
                  <div style="color: #94a3b8; font-size: 0.85rem;">
                    \u{1F4C5} \\\${new Date(story.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </a>
              \\\`).join('');
            }
          } else {
            if (emptyEl) emptyEl.style.display = 'block';
          }
        })
        .catch(err => {
          console.error('Failed to load stories:', err);
          const loadingEl = document.getElementById('stories-loading');
          const emptyEl = document.getElementById('stories-empty');
          if (loadingEl) loadingEl.style.display = 'none';
          if (emptyEl) emptyEl.style.display = 'block';
        });
    })();<\/script> <div style="margin-top: 2rem;"> <a href="/steder" style="color: #3b82f6; text-decoration: none;">\u2190 Back to all places</a> </div> </article> `])), maybeRenderHead(), fullPlace.slug && renderTemplate`<div style="margin-bottom: 2rem; border-radius: 12px; overflow: hidden;"> <img${addAttribute(`/assets/agatha/place/${fullPlace.slug}.png`, "src")}${addAttribute(fullPlace.name, "alt")} loading="lazy" style="width: 100%; height: auto; display: block;" onerror="this.style.display='none'"> </div>`, fullPlace.name, fullPlace.category && renderTemplate`<span style="display: inline-block; background: #e0f2fe; color: #0369a1; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.85rem; margin-bottom: 1rem;"> ${fullPlace.category} </span>`, fullPlace.description_short || fullPlace.description, fullPlace.description_full && renderTemplate`<div style="background: white; border-radius: 16px; padding: 2rem; box-shadow: 0 4px 20px rgba(0,0,0,0.08); margin-top: 2rem;"> <h2 style="font-size: 1.5rem; font-weight: 700; color: #1e293b; margin: 0 0 1.5rem 0;"> <span>📍</span> About This Place
</h2> <div style="line-height: 1.9; color: #475569; font-size: 1.05rem;"> ${fullPlace.description_full.split("\n\n").map((paragraph) => renderTemplate`<p style="margin-bottom: 1.5rem; text-align: justify;"> ${paragraph.startsWith("**") && paragraph.endsWith("**") ? renderTemplate`<strong style="display: block; font-size: 1.2rem; color: #1e293b; margin: 2rem 0 1rem 0;"> ${paragraph.slice(2, -2)} </strong>` : paragraph} </p>`)} </div> <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 2px solid #f1f5f9; font-style: italic; color: #64748b; font-size: 0.95rem;">
— From Agatha Splint's detailed observations
</div> </div>`, fullPlace.characteristics && fullPlace.characteristics.length > 0 && renderTemplate`<div style="background: white; border-radius: 16px; padding: 2rem; box-shadow: 0 4px 20px rgba(0,0,0,0.08); margin-top: 2rem;"> <h2 style="font-size: 1.5rem; font-weight: 700; color: #1e293b; margin: 0 0 1.5rem 0;"> <span>✨</span> Notable Features
</h2> <div style="display: grid; gap: 0.75rem;"> ${fullPlace.characteristics.map((feature) => renderTemplate`<div style="display: flex; align-items: start; gap: 0.75rem; padding: 1rem; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 8px; border-left: 4px solid #f59e0b;"> <span style="font-size: 1.2rem;">🎯</span> <span style="color: #78350f; font-size: 1rem;">${feature}</span> </div>`)} </div> </div>`, fullPlace.name, defineScriptVars({ slug, name: fullPlace.name })) })}`;
}, "/var/www/vhosts/pjuskeby.org/src/pages/steder/[slug].astro", void 0);

const $$file = "/var/www/vhosts/pjuskeby.org/src/pages/steder/[slug].astro";
const $$url = "/steder/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$slug,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
