import { useEffect } from 'react';

const SITE_URL = 'https://painel-shopay.vercel.app';
const SITE_NAME = 'Shopay';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

interface MetaOptions {
  title: string;
  siteName?: string;
  description: string;
  path: string;
  image?: string;
  type?: 'website' | 'product';
  noindex?: boolean;
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export function useDocumentMeta({
  title,
  siteName = SITE_NAME,
  description,
  path,
  image,
  type = 'website',
  noindex = false,
}: MetaOptions) {
  useEffect(() => {
    const fullTitle = title === siteName ? title : `${title} | ${siteName}`;
    const url = `${SITE_URL}${path}`;
    const imageUrl = image || DEFAULT_IMAGE;

    document.title = fullTitle;
    document.documentElement.lang = 'pt-BR';

    upsertMeta('name', 'description', description);
    upsertMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');

    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:site_name', siteName);
    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:image', imageUrl);
    upsertMeta('property', 'og:locale', 'pt_BR');

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', fullTitle);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', imageUrl);

    upsertLink('canonical', url);
  }, [title, siteName, description, path, image, type, noindex]);
}
