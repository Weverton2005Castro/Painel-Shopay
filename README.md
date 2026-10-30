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
- **Autenticação simples** com usuário e senha
- **CRUD completo** de produtos (criar, editar, excluir)
- **Campos**: nome, descrição, preço, categoria, imagem, link de afiliado
- **Destacar produtos** na página inicial
- **Ativar/desativar** produtos
- **Pesquisa** de produtos cadastrados
- **Dashboard** com estatísticas (total, ativos, inativos)
- **Importação/Exportação CSV** para gerenciar catálogo em massa
- **Validação** de campos obrigatórios e URLs
- **Confirmação** antes de excluir produtos

### Dados e Persistência
- **Sistema de persistência local** usando localStorage para desenvolvimento
- **8 produtos demonstrativos** claramente identificados como exemplos
- **Fácil substituição** dos exemplos por produtos reais
- **Estrutura pronta** para integração com banco de dados em produção

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

## 🔐 Acesso ao Painel Administrativo

1. Acesse `/admin` ou clique em "Admin" no menu de navegação
2. Use as credenciais de demonstração:
   - **Usuário**: `admin`
   - **Senha**: `admin123`

⚠️ **Importante**: Em produção, altere essas credenciais no arquivo `src/hooks/useAuth.tsx` e implemente um sistema de autenticação mais seguro.

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

## 💾 Configuração de persistência em produção

### Atualmente (Desenvolvimento)
O sistema usa **localStorage** do navegador para persistência. Isso é ideal para desenvolvimento e testes, mas os dados ficam apenas no navegador do usuário.

### Para Produção - Opções:

#### Opção 1: Supabase (Recomendado)
1. Crie uma conta gratuita em [supabase.com](https://supabase.com)
2. Crie um projeto e configure uma tabela `products` com os campos necessários
3. Instale o cliente Supabase:
   ```bash
   npm install @supabase/supabase-js
   ```
4. Substitua o `storageService` em `src/utils/storage.ts` por chamadas à API do Supabase
5. Configure variáveis de ambiente no `.env`:
   ```
   VITE_SUPABASE_URL=sua_url
   VITE_SUPABASE_ANON_KEY=sua_chave
   ```

#### Opção 2: Firebase
1. Crie um projeto no [Firebase Console](https://console.firebase.google.com)
2. Configure Firestore Database
3. Instale o Firebase SDK:
   ```bash
   npm install firebase
   ```
4. Substitua o `storageService` por chamadas ao Firestore
5. Configure as credenciais no `.env`

#### Opção 3: Backend Próprio
1. Crie uma API REST com Node.js, Python ou outra tecnologia
2. Implemente endpoints para CRUD de produtos
3. Use fetch/axios no frontend para consumir a API
4. Implemente autenticação JWT ou similar no backend

### Migração de Dados
Para migrar do localStorage para produção:
1. Use "Exportar CSV" no painel administrativo
2. Importe os dados no sistema de persistência escolhido
3. Atualize o código para usar a nova solução

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
│   ├── storage.ts
│   └── demoData.ts
├── App.tsx          # Componente principal
├── main.tsx         # Entry point
└── index.css        # Estilos globais
```

## ⚠️ Observações Importantes

- **Não invente dados**: Use apenas informações reais dos produtos da Shopay
- **Links de afiliado**: Configure os links corretos para que os botões de compra funcionem
- **Segurança**: Em produção, implemente autenticação robusta e proteja as rotas administrativas
- **Imagens**: Use URLs de imagens válidas e de alta qualidade
- **Responsividade**: O design é otimizado para dispositivos móveis

## 🔄 Personalização

- Cores e estilos: Edite `tailwind.config.js` e `src/index.css`
- Categorias: Modifique o tipo `Category` em `src/types/index.ts`
- Produtos demonstrativos: Edite `src/utils/demoData.ts`
- Credenciais admin: Edite `src/hooks/useAuth.tsx`

## 📞 Suporte

Para dúvidas ou problemas, verifique a documentação oficial de cada tecnologia utilizada.
