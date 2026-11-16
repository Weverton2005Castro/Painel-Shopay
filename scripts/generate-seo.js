// Public data only. Fail the deployment rather than publish incomplete SEO pages.
import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { loadEnv } from 'vite';

const env = { ...loadEnv('production', process.cwd(), ''), ...process.env };
const origin = new URL(env.VITE_SITE_URL || 'https://painel-shopay.vercel.app').origin;
const db = createClient(env.VITE_SUPABASE_URL || 'https://vevmsnfmdwtqtouzclfk.supabase.co', env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_2PZGTkGcfGiKs-wBKC5qPQ_tC_YnUDc');
const categories = JSON.parse(readFileSync('src/data/seo-categories.json', 'utf8'));
const template = readFileSync('dist/index.html', 'utf8');
const escape = (s = '') => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
const safeImage = (value) => { try { const url = new URL(value); return /^https?:$/.test(url.protocol) ? url.href : ''; } catch { return ''; } };
async function all(table, fields) {
  const rows = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await db.from(table).select(fields).eq('active', true).order('id').range(offset, offset + 499).abortSignal(AbortSignal.timeout(30000));
    if (error) throw new Error(`SEO: ${table}: ${error.message}`);
    rows.push(...data);
    if (data.length < 500) return rows;
  }
}
const stores = await all('stores', 'id,slug,name,description');
const products = await all('products', 'id,store_id,name,description,price,category,image_url,brand,updated_at');
const urls = [];
function page(path, title, description, body, schema, updated) {
  const url = origin + path;
  let html = template.replace(/<title>[\s\S]*?<\/title>/, `<title>${escape(title)}</title>`)
    .replace(/<meta (?:name="(?:description|twitter:[^"]+)"|property="og:[^"]+")[^>]*>/g, '')
    .replace(/<link rel="canonical"[^>]*>/g, '');
  const meta = `<meta name="description" content="${escape(description.slice(0, 180))}"><link rel="canonical" href="${escape(url)}"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description.slice(0, 180))}"><meta property="og:url" content="${escape(url)}"><meta property="og:type" content="website"><meta property="og:locale" content="pt_BR"><meta property="og:image" content="${escape(origin)}/shopay-curadoria.svg"><meta name="twitter:card" content="summary"><meta name="twitter:title" content="${escape(title)}"><meta name="twitter:description" content="${escape(description.slice(0, 180))}">`;
  html = html.replace('</head>', `${meta}</head>`).replace('<div id="root"></div>', `<div id="root"><main class="container mx-auto px-4 py-10">${body}</main></div>`);
  if (schema) html = html.replace('</main>', `<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script></main>`);
  const output = resolve('dist', '.' + (path === '/' ? '' : path), 'index.html');
  if (!output.startsWith(resolve('dist') + '/')) throw new Error('Invalid output path');
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, html.replace(/^[ \t]+$/gm, ''));
  urls.push({url, updated});
}
for (const store of stores) {
  const base = store.slug === 'shopay' ? '' : `/loja/${encodeURIComponent(store.slug)}`;
  const items = products.filter(p => p.store_id === store.id);
  const home = base || '/';
  const link = (path, label) => `<a href="${escape(path)}">${escape(label)}</a>`;
  const navigation = `<nav>${link(home, store.name)} · ${link(base + '/catalog', 'Catálogo')}</nav>`;
  const grid = (list) => `<div class="grid grid-cols-2 gap-5 lg:grid-cols-4">${list.map(p => `<article class="card p-4">${safeImage(p.image_url) ? `<img src="${escape(safeImage(p.image_url))}" alt="${escape(p.name)}" width="320" height="320" loading="lazy">` : ''}<h2>${link(base + '/product/' + encodeURIComponent(p.id), p.name)}</h2><p>${escape(p.description)}</p><p>${escape(Number(p.price).toLocaleString('pt-BR', {style:'currency',currency:'BRL'}))}</p></article>`).join('')}</div>`;
  const categoryLinks = categories.filter(c => items.some(p => p.category === c.name)).map(c => link(`${base}/categoria/${c.slug}`, c.name)).join(' · ');
  const description = store.description || `Explore produtos de ${store.name} e confira as condições nas lojas parceiras.`;
  page(home, store.name, description, `${navigation}<h1>${escape(store.name)}</h1><p>${escape(description)}</p><nav>${categoryLinks}</nav>${grid(items.slice(0, 12))}`, {'@context':'https://schema.org', '@type':'WebSite', name:store.name, url:origin + home});
  page(base + '/catalog', `Catálogo de produtos | ${store.name}`, description, `${navigation}<h1>Catálogo de produtos</h1><nav>${categoryLinks}</nav>${grid(items)}`);
  for (const category of categories) {
    const list = items.filter(p => p.category === category.name);
    if (!list.length) continue;
    page(`${base}/categoria/${category.slug}`, `${category.name}: produtos e dicas para escolher | ${store.name}`, category.guide, `${navigation}<h1>${escape(category.name)}</h1><p>${escape(category.guide)}</p>${grid(list)}`);
  }
  for (const p of items) {
    const path = `${base}/product/${encodeURIComponent(p.id)}`;
    page(path, `${p.name} | ${store.name}`, p.description, `${navigation}<h1>${escape(p.name)}</h1>${safeImage(p.image_url) ? `<img src="${escape(safeImage(p.image_url))}" alt="${escape(p.name)}" width="560" height="560">` : ''}<p>${escape(p.description)}</p><p>${escape(Number(p.price).toLocaleString('pt-BR', {style:'currency',currency:'BRL'}))}</p><h2>O que conferir antes de comprar</h2><p>${escape(categories.find(c => c.name === p.category)?.guide || "")}</p><p>Confira o preço final, a disponibilidade e o frete na loja parceira.</p>${categoryLinks}`, {'@context':'https://schema.org', '@type':'Product', name:p.name, description:p.description, image:safeImage(p.image_url) || undefined, category:p.category, brand:p.brand ? {'@type':'Brand',name:p.brand} : undefined}, p.updated_at);
  }
}
writeFileSync('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(({url,updated}) => `<url><loc>${escape(url)}</loc>${updated && Number.isFinite(Date.parse(updated)) ? `<lastmod>${new Date(updated).toISOString()}</lastmod>` : ''}</url>`).join('')}</urlset>`);
writeFileSync('dist/robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`);
console.log(`SEO: ${urls.length} páginas HTML e sitemap gerados para ${stores.length} lojas ativas.`);
