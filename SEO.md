# SEO da Shopay

O build gera HTML público para início, catálogo, categorias com produtos e detalhes de cada produto de lojas ativas. O sitemap e robots.txt são gerados no mesmo processo, com paginação no Supabase e somente dados públicos. A aplicação React continua consultando o catálogo atualizado ao abrir a página.

## Publicação

Execute `npm run build` com acesso ao Supabase. Publique `dist` usando a configuração Vercel do repositório, que prioriza arquivos existentes antes do fallback React. O build falha se não conseguir consultar o catálogo. Alterações nos produtos precisam de um novo deploy para atualizar o HTML inicial e o sitemap; a interface continua consultando os dados atuais. Não foi configurado um webhook automático de deploy.

Para domínio próprio, configure `VITE_SITE_URL=https://seu-dominio.com` no ambiente de build, faça novo deploy e redirecione o domínio anterior para o principal. Não é necessário trocar de domínio para indexar.

## Ações na conta Google

1. Abra https://search.google.com/search-console e valide a propriedade do domínio publicado. A tag existente foi preservada; a validação depende da conta proprietária.
2. Envie `sitemap.xml` em Sitemaps.
3. Inspecione a página inicial, uma categoria e um produto. Confira HTML renderizado, canonical e permissão de indexação; solicite indexação das principais páginas.
4. Acompanhe semanalmente impressões, cliques, consultas e páginas indexadas. Priorize melhorias a partir de buscas reais.
5. Use https://pagespeed.web.dev/ para medir o site publicado no celular. Valide dados estruturados em https://search.google.com/test/rich-results.

## Conteúdo e divulgação

As categorias receberam orientações de compra. As descrições reais dos produtos foram preservadas: revise-as no painel para acrescentar informações verificadas, especificações e diferenças relevantes. Não foram inventadas avaliações, certificações, disponibilidade, benefícios ou experiências de uso.

Publique materiais próprios para as categorias prioritárias e busque menções de parceiros relevantes. Divulgação externa, cadastro/validação no Search Console e posição nas buscas dependem de ações externas ao código. Não há garantia de indexação, rich results ou posição. Um domínio próprio, anúncios e Analytics não são pré-requisitos para aparecer organicamente.
