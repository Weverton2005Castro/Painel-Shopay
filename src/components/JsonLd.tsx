import { useEffect } from 'react';

interface JsonLdProps {
  data: Record<string, unknown>;
  id?: string;
}

export default function JsonLd({ data, id }: JsonLdProps) {
  useEffect(() => {
    const scriptId = id || 'json-ld';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = scriptId;
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(data);

    return () => {
      script?.remove();
    };
  }, [data, id]);

  return null;
}
