# OxeTech Dashboard

Dashboard Analítico completo e em tempo real para o ecossistema OxeTech (Work, Edu, Trilhas, Lab).

## 🚀 Tecnologias

- **Next.js 14** (App Router)
- **TypeScript**
- **TailwindCSS**
- **shadcn/ui** (componentes UI)
- **Prisma ORM** (somente leitura)
- **React Query** (cache e revalidação)
- **Recharts** (gráficos)

## 📋 Pré-requisitos

- Node.js 18+
- PostgreSQL (via túnel reverso SSH configurado)
- npm ou yarn

## 🔧 Configuração

1. Instale as dependências:

```bash
npm install
```

2. Configure a variável de ambiente:

Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL="postgresql://readonly:ReadOnly123@127.0.0.1:15432/db_oxe_tech?schema=public"
```

3. Gere o Prisma Client:

```bash
npm run prisma:generate
```

4. Execute o servidor de desenvolvimento:

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

## 📊 Funcionalidades

### Home
- KPIs gerais do ecossistema
- Evolução mensal de alunos
- Evolução Work
- Funil Work (inscrição → seleção → contratação)
- Conclusão de trilhas

### Work
- Estatísticas de vagas, empresas, candidaturas e contratações
- Funil por edital
- Tabela de empresas com KPIs
- Vagas por status

### Edu
- Frequência por escola
- Matrículas por curso
- Estatísticas gerais
- Matrículas por status

### Trilhas
- Lista de trilhas com módulos e atividades
- Progresso médio dos alunos por trilha
- Tabela de inscritos com % concluído
- Visualização individual de trilha

### Lab
- Inscrições e estatísticas
- Distribuição por curso
- Evolução temporal
- Inscrições por laboratório

### Alunos
- Lista completa de alunos
- Perfis detalhados (read-only)
- Trilhas inscritas e concluídas
- Lab inscrito
- Matrículas Edu
- Frequência

## 🏗️ Estrutura do Projeto

```
oxetech-dashboard/
├── app/
│   ├── (dashboard)/          # Páginas do dashboard
│   │   ├── page.tsx          # Home
│   │   ├── work/
│   │   ├── edu/
│   │   ├── trilhas/
│   │   ├── lab/
│   │   └── alunos/
│   ├── api/                  # API Routes
│   ├── layout.tsx
│   └── providers.tsx
├── components/
│   ├── charts/               # Componentes de gráficos
│   ├── dashboard/            # Componentes do dashboard
│   └── ui/                   # Componentes UI (shadcn/ui)
├── lib/
│   ├── db.ts                 # Prisma Client
│   ├── formatters.ts         # Utilitários de formatação
│   ├── queries/              # Hooks React Query
│   └── utils.ts              # Utilitários gerais
└── prisma/
    └── schema.prisma         # Schema do Prisma
```

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera o build de produção
- `npm run start` - Inicia o servidor de produção
- `npm run lint` - Executa o linter
- `npm run prisma:generate` - Gera o Prisma Client
- `npm run prisma:introspect` - Atualiza o schema via introspecção

## 🔐 Credenciais do Banco

O sistema está configurado para acessar o banco PostgreSQL via túnel reverso SSH:

- **Host**: 127.0.0.1
- **Porta**: 15432
- **Usuário**: readonly
- **Senha**: ReadOnly123
- **Database**: db_oxe_tech

**Importante**: O túnel SSH deve estar ativo antes de executar o projeto.

## 📖 Documentação

Para mais informações sobre as tecnologias utilizadas:

- [Next.js](https://nextjs.org/docs)
- [Prisma](https://www.prisma.io/docs)
- [React Query](https://tanstack.com/query/latest)
- [Recharts](https://recharts.org/)
- [shadcn/ui](https://ui.shadcn.com/)

## 🎨 UI/UX

- Sidebar moderna com navegação
- Header com breadcrumbs
- Cards coloridos com ícones
- Skeletons durante carregamento
- Gráficos interativos
- Tabelas com paginação
- Design responsivo

## 🔄 Atualizações em Tempo Real

O dashboard utiliza React Query com refetch automático a cada 60 segundos para manter os dados atualizados.

---

Desenvolvido com ❤️ para o ecossistema OxeTech

