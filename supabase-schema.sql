-- Criar tabela de produtos
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  affiliate_link TEXT DEFAULT '',
  featured BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  brand TEXT,
  commission DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);

-- Habilitar Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir leitura pública
CREATE POLICY "Permitir leitura pública de produtos"
  ON products FOR SELECT
  USING (true);

-- Criar política para permitir inserção pública
CREATE POLICY "Permitir inserção pública de produtos"
  ON products FOR INSERT
  WITH CHECK (true);

-- Criar política para permitir atualização pública
CREATE POLICY "Permitir atualização pública de produtos"
  ON products FOR UPDATE
  USING (true);

-- Criar política para permitir exclusão pública
CREATE POLICY "Permitir exclusão pública de produtos"
  ON products FOR DELETE
  USING (true);

-- Criar função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
