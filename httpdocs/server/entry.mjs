import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_C-sydSx7.mjs';
import { manifest } from './manifest_C9AyAMiZ.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/bedrifter/_slug_.astro.mjs');
const _page2 = () => import('./pages/bedrifter.astro.mjs');
const _page3 = () => import('./pages/health.astro.mjs');
const _page4 = () => import('./pages/historier.astro.mjs');
const _page5 = () => import('./pages/historier/_---slug_.astro.mjs');
const _page6 = () => import('./pages/kart.astro.mjs');
const _page7 = () => import('./pages/personer/_slug_.astro.mjs');
const _page8 = () => import('./pages/personer.astro.mjs');
const _page9 = () => import('./pages/podcast/_slug_.astro.mjs');
const _page10 = () => import('./pages/podcast.astro.mjs');
const _page11 = () => import('./pages/robots.txt.astro.mjs');
const _page12 = () => import('./pages/search.astro.mjs');
const _page13 = () => import('./pages/sitemap.xml.astro.mjs');
const _page14 = () => import('./pages/steder/_slug_.astro.mjs');
const _page15 = () => import('./pages/steder.astro.mjs');
const _page16 = () => import('./pages/stott-oss.astro.mjs');
const _page17 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/node.js", _page0],
    ["src/pages/bedrifter/[slug].astro", _page1],
    ["src/pages/bedrifter/index.astro", _page2],
    ["src/pages/health.ts", _page3],
    ["src/pages/historier/index.astro", _page4],
    ["src/pages/historier/[...slug].astro", _page5],
    ["src/pages/kart.astro", _page6],
    ["src/pages/personer/[slug].astro", _page7],
    ["src/pages/personer/index.astro", _page8],
    ["src/pages/podcast/[slug].astro", _page9],
    ["src/pages/podcast.astro", _page10],
    ["src/pages/robots.txt.ts", _page11],
    ["src/pages/search.astro", _page12],
    ["src/pages/sitemap.xml.ts", _page13],
    ["src/pages/steder/[slug].astro", _page14],
    ["src/pages/steder/index.astro", _page15],
    ["src/pages/stott-oss.astro", _page16],
    ["src/pages/index.astro", _page17]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./_noop-actions.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "mode": "standalone",
    "client": "file:///var/www/vhosts/pjuskeby.org/dist/client/",
    "server": "file:///var/www/vhosts/pjuskeby.org/dist/server/",
    "host": true,
    "port": 4000,
    "assets": "_astro",
    "experimentalStaticHeaders": false
};
const _exports = createExports(_manifest, _args);
const handler = _exports['handler'];
const startServer = _exports['startServer'];
const options = _exports['options'];
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) {
	serverEntrypointModule[_start](_manifest, _args);
}

export { handler, options, pageMap, startServer };
