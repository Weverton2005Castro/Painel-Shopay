BEGIN;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir leitura pública de produtos" ON public.products;
DROP POLICY IF EXISTS "Permitir inserção pública de produtos" ON public.products;
DROP POLICY IF EXISTS "Permitir atualização pública de produtos" ON public.products;
DROP POLICY IF EXISTS "Permitir exclusão pública de produtos" ON public.products;

DROP POLICY IF EXISTS "Ler produtos ativos" ON public.products;
CREATE POLICY "Ler produtos ativos"
  ON public.products FOR SELECT TO anon, authenticated
  USING (active IS TRUE);

DROP POLICY IF EXISTS "Administrar produtos" ON public.products;
CREATE POLICY "Administrar produtos"
  ON public.products FOR ALL TO authenticated
  USING ((SELECT auth.jwt()) -> 'app_metadata' -> 'shopay_admin' = 'true'::jsonb)
  WITH CHECK ((SELECT auth.jwt()) -> 'app_metadata' -> 'shopay_admin' = 'true'::jsonb);

COMMIT;
