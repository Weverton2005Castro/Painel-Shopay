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

## Acesso ao painel administrativo

O painel usa Supabase Auth e exige a permissão `shopay_admin` em `app_metadata`.

1. Crie a conta administrativa por e-mail em **Authentication → Users** no Supabase.
2. No SQL Editor, atribua a permissão ao UUID dessa conta. Substitua o valor de exemplo pelo UUID conferido no painel.

   ```sql
   UPDATE auth.users
   SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb)
     || '{"shopay_admin": true}'::jsonb
   WHERE id = '00000000-0000-0000-0000-000000000000';
   ```

3. Aplique `supabase/migrations/202611070001_protect_products.sql` no banco existente e teste o acesso em `/admin` com um novo login. Em um banco novo, execute `supabase-schema.sql`.
4. Publique o frontend junto com a migração. Confira que o catálogo abre sem sessão e que apenas a conta administrativa pode ler produtos inativos ou alterar o catálogo.

Revise políticas personalizadas existentes antes da migração, pois políticas permissivas adicionais podem conceder acesso por outras regras.

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
