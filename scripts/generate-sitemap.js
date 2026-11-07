import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuração do Supabase
const supabaseUrl = 'https://vevmsnfmdwtqtouzclfk.supabase.co';
const supabaseAnonKey = 'sb_publishable_2PZGTkGcfGiKs-wBKC5qPQ_tC_YnUDc';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const SITE_URL = 'https://painel-shopay.vercel.app';

// Função para formatar data no formato ISO
function formatDate(dateString) {
  if (!dateString) return new Date().toISOString().split('T')[0];
  return new Date(dateString).toISOString().split('T')[0];
}

// Função para gerar o sitemap
async function generateSitemap() {
  console.log('🔍 Buscando produtos do Supabase...');

  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('id, updated_at, stores!inner(slug)')
      .eq('active', true)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar produtos:', error);
      console.warn('⚠️ Mantendo o sitemap existente; o build continuará sem atualizar os produtos.');
      return;
    }

    console.log(`✅ Encontrados ${products.length} produtos ativos`);

    // URLs estáticas
    const staticUrls = [
      {
        loc: `${SITE_URL}/`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'daily',
        priority: '1.0'
      },
      {
        loc: `${SITE_URL}/catalog`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'daily',
        priority: '0.9'
      }
    ];

    // URLs de produtos
    const productUrls = products.map(product => ({
      loc: `${SITE_URL}${product.stores.slug === 'shopay' ? '' : `/loja/${product.stores.slug}`}/product/${encodeURIComponent(product.id)}`,
      lastmod: formatDate(product.updated_at),
      changefreq: 'weekly',
      priority: '0.8'
    }));

    const storeUrls = [...new Set(products.map((product) => product.stores.slug))]
      .filter((slug) => slug !== 'shopay')
      .flatMap((slug) => [
        { loc: `${SITE_URL}/loja/${slug}`, changefreq: 'weekly', priority: '0.9' },
        { loc: `${SITE_URL}/loja/${slug}/catalog`, changefreq: 'weekly', priority: '0.8' },
      ]);

    // Combinar todas as URLs
    const allUrls = [...staticUrls, ...storeUrls, ...productUrls];

    // Gerar XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(url => `  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    // Salvar no arquivo
    const outputPath = join(__dirname, '../public/sitemap.xml');
    writeFileSync(outputPath, xml, 'utf-8');

    console.log(`✅ Sitemap gerado com sucesso em: ${outputPath}`);
    console.log(`📊 Total de URLs: ${allUrls.length}`);
    console.log(`   - Páginas estáticas: ${staticUrls.length}`);
    console.log(`   - Produtos: ${productUrls.length}`);

  } catch (error) {
    console.error('❌ Erro ao gerar sitemap:', error);
    console.warn('⚠️ Mantendo o sitemap existente; o build continuará sem atualizar os produtos.');
  }
}

// Executar
generateSitemap();
