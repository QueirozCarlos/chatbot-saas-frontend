# ShopSync Sistema (Frontend)

Sistema de gestão de estoque, vendas, clientes e relatórios, com interface moderna e responsiva, desenvolvido em React + TypeScript, utilizando Vite para performance e Tailwind CSS para o design.

O sistema ainda está em fase de desenvolvimento e aprimoramento contínuo — ajustes de layout, melhorias de usabilidade e novas funcionalidades estão sendo implementadas para torná-lo cada vez mais fluido, intuitivo e completo.
## Funcionalidades Principais

- **Home**: Visão geral de produtos, vendas, clientes e pedidos pendentes.
- **Gestão de Produtos**: Cadastro, edição, exclusão e listagem de produtos, com controle de estoque e categorias.
- **Gestão de Vendas**: Registro de vendas, visualização, cancelamento e relatórios detalhados.
- **Gestão de Clientes**: Cadastro, edição, exclusão e busca de clientes.
- **Gestão de Fornecedores**: Cadastro, edição, exclusão e busca de fornecedores.
- **Gestão de Categorias**: Cadastro, edição e exclusão de categorias de produtos.
- **Relatórios**: Geração e download de relatórios de vendas e produtos em CSV.
- **Ações Rápidas**: Botões para adicionar produtos, vendas, clientes e acessar relatórios.
- **Chatbot**: Assistente virtual integrado para dúvidas rápidas. Atualizações futuras previstas.
- **Autenticação**: Login, registro, recuperação de senha e proteção de rotas. 
- **Tema Claro/Escuro**: Alternância entre temas com persistência.

## Tecnologias Utilizadas

- [React 18](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Router DOM](https://reactrouter.com/)
- [Axios](https://axios-http.com/)
- [Lucide React](https://lucide.dev/)
- [Headless UI](https://headlessui.dev/)
- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/)

## Estrutura de Pastas

```
├── src/
│   ├── components/         # Componentes reutilizáveis (Sidebar, Modais, Listas, etc)
│   ├── contexts/           # Contextos de autenticação e tema
│   ├── pages/              # Páginas principais (Home, Dashboard, Sales, Reports, etc)
│   ├── services/           # Serviços de integração com API
│   ├── database/           # (mock ou integrações locais)
│   ├── index.css           # Estilos globais (Tailwind)
│   └── main.tsx            # Ponto de entrada da aplicação
├── public/                 # Arquivos estáticos
├── Dockerfile              # Build e deploy com Nginx
├── docker-compose.yml      # Orquestração frontend, backend e banco
├── nginx.conf              # Configuração do Nginx
├── package.json            # Dependências e scripts
└── ...
```

## Instalação e Execução Local

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Passos

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/QueirozCarlos/Shopsync-Frontend.git
   cd chatbot-saas-frontend
   ```
2. **Instale as dependências:**
   ```bash
   npm install
   # ou
   yarn install
   ```
3. **Configure as variáveis de ambiente:**
   - Crie um arquivo `.env` na raiz e defina a URL da API backend:
     ```env
     VITE_API_BASE_URL=http://localhost:8080
     ```
4. **Inicie o projeto em modo desenvolvimento:**
   ```bash
   npm run dev
   # ou
   yarn dev
   ```
5. **Acesse em:** [http://localhost:5173](http://localhost:5173)

## Uso com Docker

1. **Build e execução com Docker Compose:**
   ```bash
   docker-compose up --build
   ```
   - O backend e banco MySQL são orquestrados juntos (ajuste o caminho do backend no `docker-compose.yml` se necessário)

## Scripts Disponíveis

- `npm run dev` — Inicia o servidor de desenvolvimento Vite
- `npm run build` — Gera build de produção
- `npm run preview` — Visualiza build de produção localmente
- `npm run lint` — Lint do código com ESLint

## Autenticação e Segurança
- JWT armazenado no localStorage
- Refresh automático de token
- Rotas protegidas por contexto e componente `ProtectedRoute`

## Temas
- Suporte a tema claro/escuro com persistência no localStorage

## Customização
- Edite os componentes em `src/components/` para personalizar a interface
- Adicione novas páginas em `src/pages/`
- Ajuste variáveis de ambiente conforme necessário

## Licença
Este projeto é open-source sob a licença MIT.

---

> Shopsync Sistema v1.0 — Feito com ❤️ para gestão eficiente de estoques e vendas. 
