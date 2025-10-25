import { c as createComponent, r as renderComponent, b as renderTemplate, m as maybeRenderHead, d as addAttribute } from '../chunks/astro/server_YlAN3CX0.mjs';
import 'kleur/colors';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_CRd09uuf.mjs';
export { renderers } from '../renderers.mjs';

const $$StottOss = createComponent(async ($$result, $$props, $$slots) => {
  const KOFI_USERNAME = "pjuskeby";
  const API_URL = "http://localhost:4100";
  let supporters = [];
  try {
    const response = await fetch(`${API_URL}/api/supporters`);
    const data = await response.json();
    supporters = data.supporters || [];
  } catch (error) {
    console.error("Failed to fetch supporters:", error);
  }
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Support Us", "description": "Support the Pjuskeby project with a donation" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div style="max-width: 800px; margin: 0 auto;"> <h1 style="font-size: 2.5rem; margin-bottom: 1rem; text-align: center;">Support Pjuskeby</h1> <p style="color: #64748b; text-align: center; font-size: 1.1rem; margin-bottom: 3rem;">
Help keep the stories flowing. Every coffee helps! ☕
</p> <div style="background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center; margin-bottom: 3rem;"> <h2 style="margin-bottom: 1rem;">Make a Donation via Ko-fi</h2> <p style="color: #64748b; margin-bottom: 2rem;">
Your support helps us continue creating new stories and developing the platform.
</p> <!-- Ko-fi Button --> <a${addAttribute(`https://ko-fi.com/${KOFI_USERNAME}`, "href")} target="_blank" rel="noopener noreferrer" style="display: inline-block; background: #ff5e5b; color: white; padding: 1rem 2rem; border-radius: 8px; text-decoration: none; font-weight: bold; transition: background 0.2s; box-shadow: 0 4px 6px rgba(255, 94, 91, 0.3);"> <span style="font-size: 1.2rem;">☕</span> Buy us a coffee on Ko-fi
</a> <p style="color: #94a3b8; font-size: 0.9rem; margin-top: 1.5rem;">
Secure donations powered by Ko-fi
</p> </div> <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 8px; color: white; margin-bottom: 3rem; text-align: center;"> <h2 style="margin-bottom: 1rem; color: white;">Why Support Pjuskeby?</h2> <div style="display: grid; gap: 1rem; text-align: left; max-width: 600px; margin: 0 auto;"> <div style="background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 6px;"> <strong>📚 Daily Stories:</strong> AI-generated tales from Pjuskeby
</div> <div style="background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 6px;"> <strong>🗺️ Interactive Maps:</strong> Explore the town and its locations
</div> <div style="background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 6px;"> <strong>👥 Character Database:</strong> 100+ unique residents
</div> <div style="background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 6px;"> <strong>🎙️ Future Podcast:</strong> Audio stories coming soon
</div> </div> </div> ${supporters.length > 0 && renderTemplate`<div style="background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);"> <h2 style="margin-bottom: 1.5rem; text-align: center;">🌟 Our Amazing Supporters</h2> <div style="display: grid; gap: 1rem;"> ${supporters.map((supporter) => renderTemplate`<div style="padding: 1rem; background: #f8fafc; border-radius: 6px;"> <p style="font-weight: bold; color: #1e293b;">${supporter.name}</p> <p style="color: #64748b; font-size: 0.9rem;"> ${supporter.donationCount} ${supporter.donationCount === 1 ? "donation" : "donations"} </p> </div>`)} </div> </div>`} </div> ` })}`;
}, "/var/www/vhosts/pjuskeby.org/src/pages/stott-oss.astro", void 0);

const $$file = "/var/www/vhosts/pjuskeby.org/src/pages/stott-oss.astro";
const $$url = "/stott-oss";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$StottOss,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
