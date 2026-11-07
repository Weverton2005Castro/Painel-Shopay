BEGIN;

CREATE TABLE public.stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' AND length(slug) <= 60),
  name text NOT NULL CHECK (length(btrim(name)) BETWEEN 1 AND 100),
  active boolean NOT NULL DEFAULT true,
  logo_url text NOT NULL DEFAULT '' CHECK (logo_url = '' OR logo_url ~ '^https://'),
  description text NOT NULL DEFAULT '' CHECK (length(description) <= 500)
);

CREATE TABLE public.store_members (
  store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  PRIMARY KEY (store_id, user_id)
);

CREATE TABLE public.store_invitations (
  store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE,
  email text NOT NULL CHECK (email = lower(btrim(email)) AND email LIKE '%_@_%' AND length(email) <= 254),
  PRIMARY KEY (store_id, email)
);

INSERT INTO public.stores (id, slug, name) VALUES
  ('00000000-0000-0000-0000-000000000001', 'shopay', 'Shopay');

ALTER TABLE public.products ADD COLUMN store_id uuid
  REFERENCES public.stores(id) ON DELETE RESTRICT;
UPDATE public.products SET store_id = '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.products ALTER COLUMN store_id SET NOT NULL;
CREATE INDEX products_store_listing_idx ON public.products (store_id, active, created_at DESC, id);
CREATE INDEX store_members_user_idx ON public.store_members (user_id, store_id);
CREATE INDEX store_invitations_email_idx ON public.store_invitations (email);

CREATE FUNCTION public.is_platform_admin()
RETURNS boolean LANGUAGE sql STABLE SET search_path = ''
AS $$
  SELECT coalesce((SELECT auth.jwt()) -> 'app_metadata' -> 'shopay_admin' = 'true'::jsonb, false)
$$;

CREATE FUNCTION public.can_manage_store(target_store uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT public.is_platform_admin() OR EXISTS (
    SELECT 1 FROM public.store_members m
    JOIN public.stores s ON s.id = m.store_id
    WHERE m.store_id = target_store AND m.user_id = (SELECT auth.uid()) AND s.active
  )
$$;

CREATE FUNCTION public.claim_store_invitations()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  account_id uuid := auth.uid();
  account_email text;
BEGIN
  SELECT lower(btrim(u.email)) INTO account_email
  FROM auth.users u WHERE u.id = account_id AND u.email_confirmed_at IS NOT NULL;

  WITH claimed AS (
    DELETE FROM public.store_invitations i
    WHERE i.email = account_email
    RETURNING i.store_id
  )
  INSERT INTO public.store_members (store_id, user_id)
  SELECT store_id, account_id FROM claimed
  ON CONFLICT DO NOTHING;
END
$$;

CREATE FUNCTION public.store_access_list(target_store uuid)
RETURNS TABLE (user_id uuid, email text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT m.user_id, u.email::text FROM public.store_members m
  JOIN auth.users u ON u.id = m.user_id
  WHERE m.store_id = target_store AND public.is_platform_admin()
  ORDER BY u.email
$$;

CREATE FUNCTION public.update_store_profile(target_store uuid, new_name text, new_description text, new_logo text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF NOT public.can_manage_store(target_store) THEN
    RAISE EXCEPTION 'Acesso negado' USING ERRCODE = '42501';
  END IF;
  UPDATE public.stores SET name = btrim(new_name), description = btrim(new_description), logo_url = btrim(new_logo)
  WHERE id = target_store AND (active OR public.is_platform_admin());
  IF NOT FOUND THEN RAISE EXCEPTION 'Loja indisponível'; END IF;
END
$$;

REVOKE ALL ON FUNCTION public.store_access_list(uuid), public.update_store_profile(uuid, text, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.store_access_list(uuid), public.update_store_profile(uuid, text, text, text) TO authenticated;

REVOKE ALL ON FUNCTION public.is_platform_admin() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.can_manage_store(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.claim_store_invitations() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_platform_admin(), public.can_manage_store(uuid), public.claim_store_invitations() TO authenticated;

ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.stores, public.store_members, public.store_invitations FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.stores TO anon, authenticated;
GRANT INSERT (slug, name), UPDATE (name, description, logo_url, active) ON public.stores TO authenticated;
GRANT SELECT, DELETE ON public.store_members TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.store_invitations TO authenticated;

CREATE POLICY stores_public ON public.stores FOR SELECT TO anon, authenticated USING (active);
CREATE POLICY stores_platform_read ON public.stores FOR SELECT TO authenticated USING ((SELECT public.is_platform_admin()));
CREATE POLICY stores_platform_create ON public.stores FOR INSERT TO authenticated WITH CHECK ((SELECT public.is_platform_admin()));
CREATE POLICY stores_platform_update ON public.stores FOR UPDATE TO authenticated
  USING ((SELECT public.is_platform_admin())) WITH CHECK ((SELECT public.is_platform_admin()));
CREATE POLICY store_members_read ON public.store_members FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()) OR (SELECT public.is_platform_admin()));
CREATE POLICY store_members_platform_revoke ON public.store_members FOR DELETE TO authenticated
  USING ((SELECT public.is_platform_admin()));
CREATE POLICY store_invitations_platform ON public.store_invitations FOR ALL TO authenticated
  USING ((SELECT public.is_platform_admin())) WITH CHECK ((SELECT public.is_platform_admin()));

-- Substitui as políticas legadas. Políticas permissivas antigas poderiam contornar o isolamento.
DO $$
DECLARE old_policy record;
BEGIN
  FOR old_policy IN SELECT policyname FROM pg_catalog.pg_policies
    WHERE schemaname = 'public' AND tablename = 'products'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.products', old_policy.policyname);
  END LOOP;
END
$$;

CREATE POLICY products_public ON public.products FOR SELECT TO anon, authenticated
  USING (active IS TRUE AND EXISTS (
    SELECT 1 FROM public.stores s WHERE s.id = store_id AND s.active
  ));
CREATE POLICY products_store_admin ON public.products FOR ALL TO authenticated
  USING (public.can_manage_store(store_id)) WITH CHECK (public.can_manage_store(store_id));

REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.products FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.products TO anon, authenticated;
GRANT INSERT, DELETE ON public.products TO authenticated;
-- O produto pode ser editado, mas não pode ser transferido de loja pelo cliente.
GRANT UPDATE (name, description, price, category, image_url, affiliate_link, featured, active, brand, commission, updated_at)
  ON public.products TO authenticated;

COMMIT;
