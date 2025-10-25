import { c as createComponent, a as createAstro, r as renderComponent, b as renderTemplate, m as maybeRenderHead, d as addAttribute, F as Fragment } from '../../chunks/astro/server_YlAN3CX0.mjs';
import 'kleur/colors';
import { $ as $$BaseLayout } from '../../chunks/BaseLayout_CRd09uuf.mjs';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
/* empty css                                     */
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro();
const $$slug = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$slug;
  const { slug } = Astro2.params;
  const businessData = JSON.parse(
    await readFile(join(process.cwd(), "content/data/businesses.normalized.json"), "utf-8")
  );
  const business = businessData.find((b) => b.slug === slug);
  if (!business) {
    return Astro2.redirect("/404");
  }
  const peopleData = JSON.parse(
    await readFile(join(process.cwd(), "content/data/people.normalized.json"), "utf-8")
  );
  const streetsData = JSON.parse(
    await readFile(join(process.cwd(), "content/data/streets.normalized.json"), "utf-8")
  );
  let storiesData = [];
  try {
    const storiesPath = join(process.cwd(), "content/data/stories.normalized.json");
    if (existsSync(storiesPath)) {
      storiesData = JSON.parse(await readFile(storiesPath, "utf-8"));
    }
  } catch (e) {
    console.log("Stories not found");
  }
  let extendedData = {};
  try {
    const extendedPath = join(process.cwd(), `content/data/${slug}-extended.json`);
    if (existsSync(extendedPath)) {
      extendedData = JSON.parse(await readFile(extendedPath, "utf-8"));
    }
  } catch (e) {
  }
  const fullBusiness = { ...business, ...extendedData };
  const employees = peopleData.filter(
    (p) => p.employer_id === business.id || business.employees && business.employees.includes(p.id)
  );
  const street = business.street_id ? streetsData.find((s) => s.id === business.street_id) : null;
  const mentioningStories = storiesData.filter((story) => {
    const mentions = story.mentions || [];
    return mentions.some(
      (m) => m.entity_id === business.id || m.entity_slug === slug && m.entity_type === "business"
    );
  });
  const contactInfo = fullBusiness.contact_info || "Send a raven";
  const openingHours = fullBusiness.opening_hours || [
    "If the door is open, we're open. If it's closed... guess!",
    "Weekends: When the sun feels like it",
    "Tuesdays: Closed for contemplation"
  ];
  const statistics = fullBusiness.statistics || [
    { label: "Mysterious Occurrences", value: "42" },
    { label: "Troll Sightings", value: "7" },
    { label: "Customer Giggles/Day", value: "23" },
    { label: "Unexplained Events", value: "156" }
  ];
  const funFacts = fullBusiness.fun_facts || [
    "Once visited by a troll (allegedly)",
    "Walls hum at 3:17 PM daily",
    "Best reviewed by forest creatures"
  ];
  const sections = [];
  if (fullBusiness.description_full) {
    const parts = fullBusiness.description_full.split(/\*\*\[([^\]]+)\]\*\*/);
    for (let i = 1; i < parts.length; i += 2) {
      sections.push({
        title: parts[i],
        content: parts[i + 1]?.trim() || ""
      });
    }
  }
  const title = fullBusiness.name;
  const description = fullBusiness.description_short || fullBusiness.description || `${fullBusiness.name} - A business in Pjuskeby`;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": title, "description": description, "data-astro-cid-mpsh3itv": true }, { "default": async ($$result2) => renderTemplate`  ${maybeRenderHead()}<div class="business-container" data-astro-cid-mpsh3itv> <header class="business-header" data-astro-cid-mpsh3itv> <h1 class="business-name" data-astro-cid-mpsh3itv>${fullBusiness.name}</h1> ${fullBusiness.category && renderTemplate`<p class="business-category" data-astro-cid-mpsh3itv>${fullBusiness.category}</p>`} </header> ${fullBusiness.slug && renderTemplate`<div class="business-image" data-astro-cid-mpsh3itv> <img${addAttribute(`/assets/agatha/business/${fullBusiness.slug}.png`, "src")}${addAttribute(fullBusiness.name, "alt")} onerror="this.style.display='none'" data-astro-cid-mpsh3itv> </div>`} <div class="business-grid" data-astro-cid-mpsh3itv> <!-- LEFT COLUMN: Description --> <div data-astro-cid-mpsh3itv> ${sections.length > 0 ? sections.map((section) => renderTemplate`<div class="card" data-astro-cid-mpsh3itv> <h2 class="card-title" data-astro-cid-mpsh3itv>${section.title}</h2> <div class="card-content" data-astro-cid-mpsh3itv>${section.content}</div> </div>`) : fullBusiness.description_full ? renderTemplate`<div class="card" data-astro-cid-mpsh3itv> <h2 class="card-title" data-astro-cid-mpsh3itv>About This Business</h2> <div class="card-content" data-astro-cid-mpsh3itv>${fullBusiness.description_full}</div> </div>` : renderTemplate`<div class="card" data-astro-cid-mpsh3itv> <h2 class="card-title" data-astro-cid-mpsh3itv>About This Business</h2> <p style="color: #94a3b8;" data-astro-cid-mpsh3itv>No description available yet.</p> </div>`} </div> <!-- RIGHT COLUMN: Info Boxes --> <div data-astro-cid-mpsh3itv>  <div class="info-box" data-astro-cid-mpsh3itv> <h3 class="info-box-title" data-astro-cid-mpsh3itv>📍 Address & Contact</h3> <div class="info-box-content" data-astro-cid-mpsh3itv> ${street ? renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "data-astro-cid-mpsh3itv": true }, { "default": async ($$result3) => renderTemplate` <strong data-astro-cid-mpsh3itv>${street.name}</strong><br data-astro-cid-mpsh3itv> <small style="color: #92400e;" data-astro-cid-mpsh3itv>Pjuskeby, Norway (probably)</small> ` })}` : renderTemplate`<p data-astro-cid-mpsh3itv>Somewhere between here and there</p>`} <a href="/kart" class="info-box-link" data-astro-cid-mpsh3itv>View on Map →</a> <hr style="border: none; border-top: 1px solid #fbbf24; margin: 1rem 0;" data-astro-cid-mpsh3itv> <p style="margin: 0.5rem 0;" data-astro-cid-mpsh3itv><strong data-astro-cid-mpsh3itv>How to reach us:</strong> ${contactInfo}</p> </div> </div>  <div class="info-box" data-astro-cid-mpsh3itv> <h3 class="info-box-title" data-astro-cid-mpsh3itv>🕐 Opening Hours</h3> <div class="info-box-content" data-astro-cid-mpsh3itv> <ul style="margin: 0; padding-left: 1rem; list-style: none;" data-astro-cid-mpsh3itv> ${openingHours.map((hour) => renderTemplate`<li style="margin-bottom: 0.5rem;" data-astro-cid-mpsh3itv>• ${hour}</li>`)} </ul> </div> </div>  ${employees.length > 0 && renderTemplate`<div class="info-box" data-astro-cid-mpsh3itv> <h3 class="info-box-title" data-astro-cid-mpsh3itv>👥 People Working Here (${employees.length})</h3> <ul class="employee-list" data-astro-cid-mpsh3itv> ${employees.map((emp) => renderTemplate`<li data-astro-cid-mpsh3itv> <a${addAttribute(`/personer/${emp.slug}`, "href")} class="info-box-link" data-astro-cid-mpsh3itv> ${emp.name} </a> </li>`)} </ul> </div>`}  ${mentioningStories.length > 0 && renderTemplate`<div class="info-box" data-astro-cid-mpsh3itv> <h3 class="info-box-title" data-astro-cid-mpsh3itv>📖 Featured in Stories (${mentioningStories.length})</h3> <ul class="story-list" data-astro-cid-mpsh3itv> ${mentioningStories.slice(0, 5).map((story) => renderTemplate`<li data-astro-cid-mpsh3itv> <a${addAttribute(`/historier/${story.slug}`, "href")} class="info-box-link" data-astro-cid-mpsh3itv> ${story.title} </a> </li>`)} </ul> ${mentioningStories.length > 5 && renderTemplate`<p style="margin-top: 0.5rem; font-size: 0.9rem; color: #92400e;" data-astro-cid-mpsh3itv>
...and ${mentioningStories.length - 5} more
</p>`} </div>`}  <div class="info-box" data-astro-cid-mpsh3itv> <h3 class="info-box-title" data-astro-cid-mpsh3itv>📊 Peculiar Statistics</h3> <div class="stats-grid" data-astro-cid-mpsh3itv> ${statistics.map((stat) => renderTemplate`<div class="stat-card" data-astro-cid-mpsh3itv> <p class="stat-value" data-astro-cid-mpsh3itv>${stat.value}</p> <p class="stat-label" data-astro-cid-mpsh3itv>${stat.label}</p> </div>`)} </div> </div>  <div class="info-box" data-astro-cid-mpsh3itv> <h3 class="info-box-title" data-astro-cid-mpsh3itv>🎭 Fun Facts</h3> <div class="info-box-content" data-astro-cid-mpsh3itv> <ul style="margin: 0; padding-left: 1.5rem;" data-astro-cid-mpsh3itv> ${funFacts.map((fact) => renderTemplate`<li data-astro-cid-mpsh3itv>${fact}</li>`)} </ul> </div> </div> </div> </div> <div style="margin-top: 2rem; text-align: center;" data-astro-cid-mpsh3itv> <a href="/bedrifter" style="color: #3b82f6; text-decoration: none; font-weight: 600;" data-astro-cid-mpsh3itv>
← Back to all businesses
</a> </div> </div> ` })}`;
}, "/var/www/vhosts/pjuskeby.org/src/pages/bedrifter/[slug].astro", void 0);

const $$file = "/var/www/vhosts/pjuskeby.org/src/pages/bedrifter/[slug].astro";
const $$url = "/bedrifter/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$slug,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
