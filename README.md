# Shopay - Loja Virtual

Vitrine virtual moderna e responsiva para divulgar produtos da Shopay como afiliado.

## 🚀 O que foi implementado

### Frontend
- **Interface moderna e responsiva** com design profissional e elegante
- **Página inicial** com banner, categorias e produtos em destaque
- **Catálogo de produtos** com busca, filtros por categoria e ordenação
- **Página de detalhes** do produto com informações completas
- **Cabeçalho** com logotipo, pesquisa e navegação
- **Rodapé** com informações da loja, contato e aviso de afiliado

### Funcionalidades
- **Sistema de busca** por nome de produto
- **Filtros por categoria**: Perfumes, Casa e Utilidades, Beleza, Acessórios e Cursos
- **Ordenação** por nome e preço (crescente/decrescente)
- **Cards de produtos** com imagem, nome, descrição, preço e botão de compra
- **Botão "Comprar agora"** que abre o link de afiliado em nova aba
- **Sinalização automática** quando produto não tem link de afiliado válido

### Painel Administrativo
- **Autenticação via Supabase** com e-mail e senha
- **CRUD completo** de produtos (criar, editar, excluir)
- **Campos**: nome, descrição, preço, categoria, imagem, link de afiliado
- **Destacar produtos** na página inicial
- **Ativar/desativar** produtos
- **Pesquisa** de produtos cadastrados
- **Dashboard** com estatísticas (total, ativos, inativos)
- **Importação/Exportação CSV** para gerenciar catálogo em massa
- **Validação** de campos obrigatórios e URLs
- **Confirmação** antes de excluir produtos

### Transparência
- **Aviso de afiliado** discreto no rodapé
- **Informação clara** de que pedidos são processados na plataforma de destino
- **Botões desabilitados** quando não há link de afiliado configurado

## 🎯 Como executar o sistema

### Instalação
```bash
npm install
```

### Desenvolvimento
```bash
npm run dev
```
A aplicação estará disponível em `http://localhost:5173`

### Produção
```bash
npm run build
npm run preview
```

## Configuração de várias lojas no Supabase

No banco que já tem a tabela `public.products`, execute o arquivo inteiro
[`202611070002_multi_store.sql`](supabase/migrations/202611070002_multi_store.sql)
uma vez no **SQL Editor**. Em um banco novo, execute primeiro `supabase-schema.sql`.

A migração cria a loja Shopay, vincula a ela os produtos existentes e mantém seus IDs.
Ela substitui as políticas RLS anteriores de `products`, inclusive políticas personalizadas,
para que regras antigas não permitam alterações entre lojas. Revise regras personalizadas
antes de executar. Publique a versão nova do frontend junto com a migração, pois
novos produtos exigem o identificador da loja.

### Conta da plataforma

A conta que tem `shopay_admin: true` em `app_metadata` gerencia todas as lojas.
Se essa conta já estiver configurada, basta entrar novamente. Caso contrário,
crie ou identifique sua conta em **Authentication → Users**. Execute a query abaixo,
substituindo o UUID de exemplo pelo UUID da sua conta.

```sql
UPDATE auth.users
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb)
  || '{"shopay_admin": true}'::jsonb
WHERE id = '00000000-0000-0000-0000-000000000000'::uuid;
```

Saia e entre novamente em `/admin` para renovar a sessão após atribuir a permissão.
Reserve essa permissão para quem administra a plataforma.

### Cadastro de loja e acesso do responsável

1. Entre em `/admin`, cadastre uma loja com nome e endereço e clique em **Gerenciar**.
2. Em **Configurações da loja**, registre o e-mail do responsável e compartilhe o link `/admin` com ele.
3. O responsável entra com a própria conta. Se for a primeira vez, usa **Recebi um convite e quero criar minha conta** e confirma o e-mail. Ao entrar, o convite é vinculado à conta com aquele endereço verificado.
4. Com uma loja ativa, o painel abre diretamente. Com várias, o responsável escolhe qual gerenciar. A vitrine pública usa `/loja/<endereço>` e a Shopay também continua acessível na raiz.

Para o cadastro pelo site, habilite o provedor de e-mail e **Confirm email** no
Supabase Auth. Em **URL Configuration**, configure a URL pública do site e permita
o redirecionamento para `https://seu-dominio/admin`. Configure e teste a entrega
dos e-mails de confirmação no ambiente que os clientes usarão. O painel registra
os convites e exibe o link para compartilhar. O Supabase envia a confirmação
quando um responsável cria a conta.

## 📦 Como cadastrar produtos e links de afiliado

1. Faça login no painel administrativo
2. Clique em "+ Novo Produto"
3. Preencha os campos:
   - **Nome**: Nome do produto
   - **Descrição**: Descrição detalhada
   - **Preço**: Preço em reais
   - **Categoria**: Selecione uma das categorias disponíveis
   - **URL da Imagem**: Link da imagem do produto
   - **Link de Afiliado**: Link da Shopay para o produto
   - **Destacar**: Marque para mostrar na página inicial
   - **Produto ativo**: Marque para exibir no catálogo
4. Clique em "Cadastrar"

### Importação em massa via CSV
1. No painel administrativo, clique em "Importar CSV"
2. O arquivo deve ter as colunas: ID, Nome, Descrição, Preço, Categoria, URL Imagem, Link Afiliado, Destaque, Ativo
3. Use "Exportar CSV" para ver o formato correto

## Persistência

O catálogo usa a tabela `products` do Supabase. Configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` para usar outro projeto.

## 🎨 Tecnologias Utilizadas

- **React 19** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool
- **Tailwind CSS 3** - Estilização
- **React Router** - Navegação

## 📝 Estrutura do Projeto

```
src/
├── components/      # Componentes reutilizáveis
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── ProductCard.tsx
│   ├── Modal.tsx
│   ├── LoadingSpinner.tsx
│   └── EmptyState.tsx
├── pages/           # Páginas da aplicação
│   ├── Home.tsx
│   ├── Catalog.tsx
│   ├── ProductDetail.tsx
│   ├── AdminLogin.tsx
│   └── AdminDashboard.tsx
├── hooks/           # Hooks customizados
│   └── useAuth.tsx
├── types/           # Definições TypeScript
│   └── index.ts
├── utils/           # Utilitários
│   └── storage.ts
├── App.tsx          # Componente principal
├── main.tsx         # Entry point
└── index.css        # Estilos globais
```

## ⚠️ Observações Importantes

- **Não invente dados**: Use apenas informações reais dos produtos da Shopay
- **Links de afiliado**: Configure os links corretos para que os botões de compra funcionem
- **Imagens**: Use URLs de imagens válidas e de alta qualidade
- **Responsividade**: O design é otimizado para dispositivos móveis

## 🔄 Personalização

- Cores e estilos: Edite `tailwind.config.js` e `src/index.css`
- Categorias: Modifique o tipo `Category` em `src/types/index.ts`

## 📞 Suporte

Para dúvidas ou problemas, verifique a documentação oficial de cada tecnologia utilizada.
