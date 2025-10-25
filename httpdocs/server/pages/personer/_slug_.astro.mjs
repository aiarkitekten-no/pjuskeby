import { c as createComponent, a as createAstro, r as renderComponent, b as renderTemplate, d as addAttribute, f as defineScriptVars, m as maybeRenderHead } from '../../chunks/astro/server_YlAN3CX0.mjs';
import 'kleur/colors';
import { $ as $$BaseLayout } from '../../chunks/BaseLayout_CRd09uuf.mjs';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
/* empty css                                     */
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
  const peopleData = JSON.parse(
    await readFile(join(process.cwd(), "content/data/people.normalized.json"), "utf-8")
  );
  const person = peopleData.find((p) => p.slug === slug);
  if (!person) {
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
  const fullPerson = { ...person, ...extendedData };
  if (fullPerson.birthdate) {
    const birthDate = new Date(fullPerson.birthdate);
    const today = /* @__PURE__ */ new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || monthDiff === 0 && today.getDate() < birthDate.getDate()) {
      age--;
    }
    fullPerson.calculatedAge = age;
  }
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": person.name, "description": person.bio || `Meet ${person.name} from Pjuskeby`, "data-astro-cid-kbplbk4p": true }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template(["  ", '<div class="profile-container" data-astro-cid-kbplbk4p> <!-- Header Banner --> <div class="profile-header" data-astro-cid-kbplbk4p></div> <!-- Profile Content --> <div class="profile-content" data-astro-cid-kbplbk4p> <!-- Avatar & Name --> <div class="profile-avatar-container" data-astro-cid-kbplbk4p> <div class="profile-avatar" data-astro-cid-kbplbk4p> <img loading="lazy"', "", ` onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><rect fill=%22%23e2e8f0%22 width=%22200%22 height=%22200%22/><text x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2260%22>\u{1F464}</text></svg>'" data-astro-cid-kbplbk4p> </div> <div class="profile-info" data-astro-cid-kbplbk4p> <h1 class="profile-name" data-astro-cid-kbplbk4p>`, '</h1> <p style="font-size: 1.4rem; color: white; font-weight: 700; margin: 0 0 1.5rem 0; text-shadow: 2px 2px 8px rgba(0,0,0,0.3); letter-spacing: 0.5px;" data-astro-cid-kbplbk4p> ', ' </p> <div class="profile-meta" data-astro-cid-kbplbk4p> <div class="profile-meta-item" data-astro-cid-kbplbk4p> <span data-astro-cid-kbplbk4p>\u{1F382}</span> <span data-astro-cid-kbplbk4p><strong data-astro-cid-kbplbk4p>', "</strong> years old", '</span> </div> <div class="profile-meta-item" data-astro-cid-kbplbk4p> <span data-astro-cid-kbplbk4p>\u{1F4BC}</span> <span data-astro-cid-kbplbk4p><strong data-astro-cid-kbplbk4p>', "</strong></span> </div> ", ' <div class="profile-meta-item" data-astro-cid-kbplbk4p> <span data-astro-cid-kbplbk4p>\u{1F4CD}</span> <span data-astro-cid-kbplbk4p><strong data-astro-cid-kbplbk4p>Pjuskeby</strong></span> </div> </div> </div> </div> <!-- Main Grid --> <div class="profile-grid" data-astro-cid-kbplbk4p> <!-- Left Column --> <div data-astro-cid-kbplbk4p> <!-- Short Bio Quote --> ', " <!-- Full Biography --> ", " <!-- Hobbies & Interests --> ", " <!-- Favorite Places --> ", ' <!-- Stories Section --> <div class="card" style="margin-top: 1.5rem;" data-astro-cid-kbplbk4p> <h2 class="card-title" data-astro-cid-kbplbk4p> <span data-astro-cid-kbplbk4p>\u{1F4D6}</span>\nStories & Experiences\n</h2> <div id="stories-loading" style="text-align: center; padding: 2rem;" data-astro-cid-kbplbk4p> <p style="color: #64748b; font-size: 1.1rem;" data-astro-cid-kbplbk4p>\n\u{1F50D} Loading stories...\n</p> </div> <div id="stories-list" style="display: none;" data-astro-cid-kbplbk4p></div> <div id="stories-empty" style="display: none; text-align: center; padding: 2rem;" data-astro-cid-kbplbk4p> <p style="color: #64748b; font-size: 1.1rem;" data-astro-cid-kbplbk4p>\n\u{1F31F} No stories about ', ' yet...\n</p> <p style="color: #94a3b8; font-size: 0.9rem; margin-top: 1rem;" data-astro-cid-kbplbk4p>\nAgatha Splint is constantly noting new observations from Pjuskeby\n</p> </div> </div> <script>(function(){', `
            // Fetch stories mentioning this person
            fetch(\`https://pjuskeby.org/api/entities/person/\${slug}/stories\`)
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
                      <a href="\${story.url}" style="display: block; text-decoration: none; color: inherit; padding: 1.25rem; background: #f8fafc; border-radius: 12px; margin-bottom: 1rem; border-left: 4px solid #3b82f6; transition: all 0.2s ease;">
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
          })();<\/script> </div> <!-- Right Column - Info Cards --> <div data-astro-cid-kbplbk4p> <!-- Age Info --> <div class="info-card" data-astro-cid-kbplbk4p> <p class="info-card-title" data-astro-cid-kbplbk4p>Age</p> <p class="info-card-value" data-astro-cid-kbplbk4p>`, " years old</p> ", " </div> <!-- Address --> ", " <!-- Workplace --> ", ' <!-- Stats --> <div class="card" style="margin-top: 1.5rem;" data-astro-cid-kbplbk4p> <h3 class="card-title" style="font-size: 1.2rem;" data-astro-cid-kbplbk4p> <span data-astro-cid-kbplbk4p>\u{1F4CA}</span>\nStatistics\n</h3> <div class="stats-grid" data-astro-cid-kbplbk4p> <div class="stat-card" data-astro-cid-kbplbk4p> <p class="stat-value" data-astro-cid-kbplbk4p>', '</p> <p class="stat-label" data-astro-cid-kbplbk4p>Hobbies</p> </div> <div class="stat-card" data-astro-cid-kbplbk4p> <p class="stat-value" data-astro-cid-kbplbk4p>', '</p> <p class="stat-label" data-astro-cid-kbplbk4p>Favorite Places</p> </div> <div class="stat-card" data-astro-cid-kbplbk4p> <p class="stat-value" data-astro-cid-kbplbk4p>', '</p> <p class="stat-label" data-astro-cid-kbplbk4p>Years Old</p> </div> <div class="stat-card" data-astro-cid-kbplbk4p> <p class="stat-value" data-astro-cid-kbplbk4p>\u221E</p> <p class="stat-label" data-astro-cid-kbplbk4p>Absurdity</p> </div> </div> </div> <!-- Fun Facts --> <div class="card" style="margin-top: 1.5rem; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);" data-astro-cid-kbplbk4p> <h3 class="card-title" style="font-size: 1.2rem; color: #78350f;" data-astro-cid-kbplbk4p> <span data-astro-cid-kbplbk4p>\u{1F3AA}</span>\nFun Facts\n</h3> <ul style="list-style: none; padding: 0; margin: 0;" data-astro-cid-kbplbk4p> <li style="padding: 0.75rem 0; border-bottom: 1px solid #fbbf24;" data-astro-cid-kbplbk4p> <span style="color: #92400e;" data-astro-cid-kbplbk4p>\u{1F31F} First observed:</span> <span style="float: right; font-weight: 600; color: #78350f;" data-astro-cid-kbplbk4p>2025</span> </li> <li style="padding: 0.75rem 0; border-bottom: 1px solid #fbbf24;" data-astro-cid-kbplbk4p> <span style="color: #92400e;" data-astro-cid-kbplbk4p>\u{1F3AD} Status:</span> <span style="float: right; font-weight: 600; color: #78350f;" data-astro-cid-kbplbk4p>Active</span> </li> <li style="padding: 0.75rem 0;" data-astro-cid-kbplbk4p> <span style="color: #92400e;" data-astro-cid-kbplbk4p>\u{1F3A8} Portrayed by:</span> <span style="float: right; font-weight: 600; color: #78350f;" data-astro-cid-kbplbk4p>Agatha Splint</span> </li> </ul> </div> </div> </div> <!-- Back Button --> <a href="/personer" class="back-button" data-astro-cid-kbplbk4p> <span data-astro-cid-kbplbk4p>\u2190</span> <span data-astro-cid-kbplbk4p>Back to all people</span> </a> </div> </div> '], ["  ", '<div class="profile-container" data-astro-cid-kbplbk4p> <!-- Header Banner --> <div class="profile-header" data-astro-cid-kbplbk4p></div> <!-- Profile Content --> <div class="profile-content" data-astro-cid-kbplbk4p> <!-- Avatar & Name --> <div class="profile-avatar-container" data-astro-cid-kbplbk4p> <div class="profile-avatar" data-astro-cid-kbplbk4p> <img loading="lazy"', "", ` onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><rect fill=%22%23e2e8f0%22 width=%22200%22 height=%22200%22/><text x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2260%22>\u{1F464}</text></svg>'" data-astro-cid-kbplbk4p> </div> <div class="profile-info" data-astro-cid-kbplbk4p> <h1 class="profile-name" data-astro-cid-kbplbk4p>`, '</h1> <p style="font-size: 1.4rem; color: white; font-weight: 700; margin: 0 0 1.5rem 0; text-shadow: 2px 2px 8px rgba(0,0,0,0.3); letter-spacing: 0.5px;" data-astro-cid-kbplbk4p> ', ' </p> <div class="profile-meta" data-astro-cid-kbplbk4p> <div class="profile-meta-item" data-astro-cid-kbplbk4p> <span data-astro-cid-kbplbk4p>\u{1F382}</span> <span data-astro-cid-kbplbk4p><strong data-astro-cid-kbplbk4p>', "</strong> years old", '</span> </div> <div class="profile-meta-item" data-astro-cid-kbplbk4p> <span data-astro-cid-kbplbk4p>\u{1F4BC}</span> <span data-astro-cid-kbplbk4p><strong data-astro-cid-kbplbk4p>', "</strong></span> </div> ", ' <div class="profile-meta-item" data-astro-cid-kbplbk4p> <span data-astro-cid-kbplbk4p>\u{1F4CD}</span> <span data-astro-cid-kbplbk4p><strong data-astro-cid-kbplbk4p>Pjuskeby</strong></span> </div> </div> </div> </div> <!-- Main Grid --> <div class="profile-grid" data-astro-cid-kbplbk4p> <!-- Left Column --> <div data-astro-cid-kbplbk4p> <!-- Short Bio Quote --> ', " <!-- Full Biography --> ", " <!-- Hobbies & Interests --> ", " <!-- Favorite Places --> ", ' <!-- Stories Section --> <div class="card" style="margin-top: 1.5rem;" data-astro-cid-kbplbk4p> <h2 class="card-title" data-astro-cid-kbplbk4p> <span data-astro-cid-kbplbk4p>\u{1F4D6}</span>\nStories & Experiences\n</h2> <div id="stories-loading" style="text-align: center; padding: 2rem;" data-astro-cid-kbplbk4p> <p style="color: #64748b; font-size: 1.1rem;" data-astro-cid-kbplbk4p>\n\u{1F50D} Loading stories...\n</p> </div> <div id="stories-list" style="display: none;" data-astro-cid-kbplbk4p></div> <div id="stories-empty" style="display: none; text-align: center; padding: 2rem;" data-astro-cid-kbplbk4p> <p style="color: #64748b; font-size: 1.1rem;" data-astro-cid-kbplbk4p>\n\u{1F31F} No stories about ', ' yet...\n</p> <p style="color: #94a3b8; font-size: 0.9rem; margin-top: 1rem;" data-astro-cid-kbplbk4p>\nAgatha Splint is constantly noting new observations from Pjuskeby\n</p> </div> </div> <script>(function(){', `
            // Fetch stories mentioning this person
            fetch(\\\`https://pjuskeby.org/api/entities/person/\\\${slug}/stories\\\`)
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
                      <a href="\\\${story.url}" style="display: block; text-decoration: none; color: inherit; padding: 1.25rem; background: #f8fafc; border-radius: 12px; margin-bottom: 1rem; border-left: 4px solid #3b82f6; transition: all 0.2s ease;">
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
          })();<\/script> </div> <!-- Right Column - Info Cards --> <div data-astro-cid-kbplbk4p> <!-- Age Info --> <div class="info-card" data-astro-cid-kbplbk4p> <p class="info-card-title" data-astro-cid-kbplbk4p>Age</p> <p class="info-card-value" data-astro-cid-kbplbk4p>`, " years old</p> ", " </div> <!-- Address --> ", " <!-- Workplace --> ", ' <!-- Stats --> <div class="card" style="margin-top: 1.5rem;" data-astro-cid-kbplbk4p> <h3 class="card-title" style="font-size: 1.2rem;" data-astro-cid-kbplbk4p> <span data-astro-cid-kbplbk4p>\u{1F4CA}</span>\nStatistics\n</h3> <div class="stats-grid" data-astro-cid-kbplbk4p> <div class="stat-card" data-astro-cid-kbplbk4p> <p class="stat-value" data-astro-cid-kbplbk4p>', '</p> <p class="stat-label" data-astro-cid-kbplbk4p>Hobbies</p> </div> <div class="stat-card" data-astro-cid-kbplbk4p> <p class="stat-value" data-astro-cid-kbplbk4p>', '</p> <p class="stat-label" data-astro-cid-kbplbk4p>Favorite Places</p> </div> <div class="stat-card" data-astro-cid-kbplbk4p> <p class="stat-value" data-astro-cid-kbplbk4p>', '</p> <p class="stat-label" data-astro-cid-kbplbk4p>Years Old</p> </div> <div class="stat-card" data-astro-cid-kbplbk4p> <p class="stat-value" data-astro-cid-kbplbk4p>\u221E</p> <p class="stat-label" data-astro-cid-kbplbk4p>Absurdity</p> </div> </div> </div> <!-- Fun Facts --> <div class="card" style="margin-top: 1.5rem; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);" data-astro-cid-kbplbk4p> <h3 class="card-title" style="font-size: 1.2rem; color: #78350f;" data-astro-cid-kbplbk4p> <span data-astro-cid-kbplbk4p>\u{1F3AA}</span>\nFun Facts\n</h3> <ul style="list-style: none; padding: 0; margin: 0;" data-astro-cid-kbplbk4p> <li style="padding: 0.75rem 0; border-bottom: 1px solid #fbbf24;" data-astro-cid-kbplbk4p> <span style="color: #92400e;" data-astro-cid-kbplbk4p>\u{1F31F} First observed:</span> <span style="float: right; font-weight: 600; color: #78350f;" data-astro-cid-kbplbk4p>2025</span> </li> <li style="padding: 0.75rem 0; border-bottom: 1px solid #fbbf24;" data-astro-cid-kbplbk4p> <span style="color: #92400e;" data-astro-cid-kbplbk4p>\u{1F3AD} Status:</span> <span style="float: right; font-weight: 600; color: #78350f;" data-astro-cid-kbplbk4p>Active</span> </li> <li style="padding: 0.75rem 0;" data-astro-cid-kbplbk4p> <span style="color: #92400e;" data-astro-cid-kbplbk4p>\u{1F3A8} Portrayed by:</span> <span style="float: right; font-weight: 600; color: #78350f;" data-astro-cid-kbplbk4p>Agatha Splint</span> </li> </ul> </div> </div> </div> <!-- Back Button --> <a href="/personer" class="back-button" data-astro-cid-kbplbk4p> <span data-astro-cid-kbplbk4p>\u2190</span> <span data-astro-cid-kbplbk4p>Back to all people</span> </a> </div> </div> '])), maybeRenderHead(), addAttribute(`/assets/agatha/person/${person.slug}.png`, "src"), addAttribute(`Portrait of ${person.name}`, "alt"), fullPerson.name, fullPerson.workplace?.role || fullPerson.occupation, fullPerson.calculatedAge || fullPerson.age, fullPerson.birthdate && ` (${new Date(fullPerson.birthdate).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })})`, fullPerson.workplace?.name || fullPerson.occupation, fullPerson.address && renderTemplate`<div class="profile-meta-item" data-astro-cid-kbplbk4p> <span data-astro-cid-kbplbk4p>🏠</span> <span data-astro-cid-kbplbk4p><strong data-astro-cid-kbplbk4p>${fullPerson.address.full}</strong></span> </div>`, fullPerson.bio_short && renderTemplate`<div class="card" data-astro-cid-kbplbk4p> <h2 class="card-title" data-astro-cid-kbplbk4p> <span data-astro-cid-kbplbk4p>💭</span>
Known for
</h2> <div class="quote-card" data-astro-cid-kbplbk4p> <p class="quote-text" data-astro-cid-kbplbk4p>${fullPerson.bio_short}</p> </div> <div class="agatha-signature" data-astro-cid-kbplbk4p>
— As observed by Agatha Splint
</div> </div>`, fullPerson.bio_full && renderTemplate`<div class="card" style="margin-top: 1.5rem;" data-astro-cid-kbplbk4p> <h2 class="card-title" data-astro-cid-kbplbk4p> <span data-astro-cid-kbplbk4p>📖</span>
The Full Story of ${fullPerson.name} </h2> <div style="line-height: 1.9; color: #475569; font-size: 1.05rem;" data-astro-cid-kbplbk4p> ${fullPerson.bio_full.split("\n\n").map((paragraph) => renderTemplate`<p style="margin-bottom: 1.5rem; text-align: justify;" data-astro-cid-kbplbk4p> ${paragraph.startsWith("**") && paragraph.endsWith("**") ? renderTemplate`<strong style="display: block; font-size: 1.2rem; color: #1e293b; margin: 2rem 0 1rem 0;" data-astro-cid-kbplbk4p> ${paragraph.slice(2, -2)} </strong>` : paragraph.startsWith("- ") ? renderTemplate`<span style="display: block; padding-left: 1.5rem; position: relative;" data-astro-cid-kbplbk4p> <span style="position: absolute; left: 0;" data-astro-cid-kbplbk4p>•</span> ${paragraph.slice(2)} </span>` : paragraph} </p>`)} </div> <div class="agatha-signature" data-astro-cid-kbplbk4p>
— From Agatha Splint's detailed observations
</div> </div>`, fullPerson.traits && fullPerson.traits.length > 0 && renderTemplate`<div class="card" style="margin-top: 1.5rem;" data-astro-cid-kbplbk4p> <h2 class="card-title" data-astro-cid-kbplbk4p> <span data-astro-cid-kbplbk4p>✨</span>
Hobbies & Passions
</h2> <div class="traits-grid" data-astro-cid-kbplbk4p> ${fullPerson.traits.map((trait) => renderTemplate`<div class="trait-item" data-astro-cid-kbplbk4p> <span class="trait-icon" data-astro-cid-kbplbk4p>🎯</span> <span class="trait-text" data-astro-cid-kbplbk4p>${trait}</span> </div>`)} </div> </div>`, fullPerson.favorites?.places && fullPerson.favorites.places.length > 0 && renderTemplate`<div class="card" style="margin-top: 1.5rem;" data-astro-cid-kbplbk4p> <h2 class="card-title" data-astro-cid-kbplbk4p> <span data-astro-cid-kbplbk4p>❤️</span>
Favorite Places
</h2> <div style="display: flex; flex-direction: column; gap: 1rem;" data-astro-cid-kbplbk4p> ${fullPerson.favorites.places.map((place) => renderTemplate`<a${addAttribute(`/steder/${place.slug}`, "href")} style="text-decoration: none; color: inherit; display: block; padding: 1.25rem; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; border-left: 4px solid #f59e0b; transition: transform 0.2s ease;" onmouseover="this.style.transform='translateX(8px)'" onmouseout="this.style.transform='translateX(0)'" data-astro-cid-kbplbk4p> <div style="font-size: 1.1rem; font-weight: 600; color: #92400e; margin-bottom: 0.5rem;" data-astro-cid-kbplbk4p>
📍 ${place.name} </div> <div style="font-size: 0.95rem; color: #78350f; font-style: italic;" data-astro-cid-kbplbk4p> ${place.reason} </div> </a>`)} </div> </div>`, fullPerson.name, defineScriptVars({ slug, name: fullPerson.name }), fullPerson.calculatedAge || fullPerson.age, fullPerson.birthdate && renderTemplate`<p style="color: #92400e; font-size: 0.9rem; margin-top: 0.5rem;" data-astro-cid-kbplbk4p>
🎂 Born ${new Date(fullPerson.birthdate).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })} </p>`, fullPerson.address && renderTemplate`<div class="info-card" style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-color: #3b82f6;" data-astro-cid-kbplbk4p> <p class="info-card-title" style="color: #1e40af;" data-astro-cid-kbplbk4p>Address</p> <p class="info-card-value" style="color: #1e3a8a;" data-astro-cid-kbplbk4p>${fullPerson.address.full}</p> </div>`, fullPerson.workplace && renderTemplate`<div class="info-card" style="background: linear-gradient(135deg, #ddd6fe 0%, #c7d2fe 100%); border-color: #8b5cf6;" data-astro-cid-kbplbk4p> <p class="info-card-title" style="color: #5b21b6;" data-astro-cid-kbplbk4p>Workplace</p> <p class="info-card-value" style="color: #4c1d95;" data-astro-cid-kbplbk4p> <a${addAttribute(`/bedrifter/${fullPerson.workplace.slug}`, "href")} style="color: inherit; text-decoration: none;" data-astro-cid-kbplbk4p> ${fullPerson.workplace.name} </a> </p> ${fullPerson.workplace.role && renderTemplate`<p style="color: #6d28d9; font-size: 0.9rem; margin-top: 0.5rem;" data-astro-cid-kbplbk4p>
💼 ${fullPerson.workplace.role} </p>`} </div>`, fullPerson.traits?.length || 0, fullPerson.favorites?.places?.length || 0, fullPerson.calculatedAge || fullPerson.age) })}`;
}, "/var/www/vhosts/pjuskeby.org/src/pages/personer/[slug].astro", void 0);

const $$file = "/var/www/vhosts/pjuskeby.org/src/pages/personer/[slug].astro";
const $$url = "/personer/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$slug,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
