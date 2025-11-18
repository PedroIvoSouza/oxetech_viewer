# 🚀 OxeTech Dashboard

Dashboard Analítico completo, profissional e em tempo real para o ecossistema OxeTech (Work, Edu, Trilhas, Lab).

## ✨ Características

### 🎨 Visual Premium
- Design moderno e executivo
- Visual mais bonito que PowerBI/Tableau tradicional
- UI arredondada e premium (22px border radius)
- Paleta de cores por módulo (Work, Edu, Lab, Trilhas, Din)
- Animações suaves com framer-motion
- Tipografia Inter + Manrope
- Layout com respiro e separação visual adequada

### 📊 Funcionalidades Completas

#### Home (Dashboard Principal)
- 12 KPIs principais do ecossistema
- Evolução dos últimos 12 meses
- Funil Work premium
- Distribuição por programa
- Municípios atendidos
- Cards de resumo executivo

#### Work (OxeTech Work)
- Funil completo por edital
- Ranking de empresas (top 20)
- Tempo médio entre etapas do processo seletivo
- Vagas por status (Abertas/Encerradas)
- Tabela de vagas com destaque
- Taxa de conversão

#### Edu (OxeTech Edu)
- Frequência diária (últimos 30 dias)
- Ranking de cursos mais procurados
- Mapa de calor por horário
- Comparativo mensal de matrículas
- Frequência por escola com município
- Distribuição de matrículas por status

#### Trilhas (Trilhas de Conhecimento)
- Top 10 trilhas mais acessadas
- Evolução temporal de inscrições
- Progresso médio por trilha
- Conclusão por trilha
- Filtros por período (30d, 90d, 1y, all)
- Busca por nome
- Lista completa com status e % conclusão

#### Lab (OxeTech Lab)
- Evolução semanal (últimas 8 semanas)
- Evolução temporal (últimos 12 meses)
- Distribuição por curso
- Inscrições por laboratório
- Comparativo: Slots ocupados vs livres
- Taxa de ocupação
- Tabela completa de inscrições

#### Alunos
- Filtros avançados:
  - Programa (Work, Edu, Trilhas, Lab)
  - Status (Validado, Aguardando)
  - Município (dropdown dinâmico)
  - Busca (nome ou email)
- Lista moderna com avatar, programas e progresso
- Visualização individual completa
- Paginação

### 🛠️ Tecnologias

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Estilização**: TailwindCSS, shadcn/ui
- **Animações**: Framer Motion
- **Gráficos**: Recharts
- **State Management**: React Query (TanStack Query)
- **ORM**: Prisma
- **Banco de Dados**: PostgreSQL (via túnel SSH)

### 📁 Estrutura

```
oxetech-dashboard/
├── app/
│   ├── (dashboard)/      # Páginas do dashboard
│   ├── api/              # API Routes
│   ├── layout.tsx
│   ├── providers.tsx
│   └── globals.css
├── components/
│   ├── charts/           # Gráficos premium
│   ├── dashboard/        # Componentes do dashboard
│   └── ui/               # Componentes UI (shadcn/ui)
├── lib/
│   ├── db.ts             # Prisma Client
│   ├── formatters.ts     # Formatação
│   ├── design-system.ts  # Design system
│   ├── api-helpers.ts    # Helpers de API
│   ├── hooks/            # Hooks customizados
│   └── queries/          # Hooks React Query
├── prisma/
│   └── schema.prisma     # Schema do Prisma
└── docs/                 # Documentação completa
```

## 🚀 Instalação

### Pré-requisitos

- Node.js 18+
- PostgreSQL (via túnel reverso SSH configurado)
- npm ou yarn

### Passo a Passo

1. **Instale as dependências**:
```bash
npm install
```

2. **Configure as variáveis de ambiente**:

Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL="postgresql://readonly:ReadOnly123@127.0.0.1:15432/db_oxe_tech?schema=public"
```

**⚠️ Importante**: Certifique-se de que o túnel SSH está ativo antes de executar o projeto.

3. **Gere o Prisma Client**:
```bash
npm run prisma:generate
```

4. **Execute o servidor de desenvolvimento**:
```bash
npm run dev
```

5. **Acesse o dashboard**:
```
http://localhost:3000
```

## 📊 Páginas Disponíveis

- `/` - Home (Dashboard Principal)
- `/work` - OxeTech Work
- `/edu` - OxeTech Edu
- `/trilhas` - Trilhas de Conhecimento
- `/lab` - OxeTech Lab
- `/alunos` - Alunos (com filtros avançados)
- `/alunos/[id]` - Detalhes do Aluno

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera o build de produção
- `npm run start` - Inicia o servidor de produção
- `npm run lint` - Executa o linter
- `npm run prisma:generate` - Gera o Prisma Client
- `npm run prisma:introspect` - Atualiza o schema via introspecção

## 📚 Documentação

Documentação completa disponível em `/docs`:

- **README_DASHBOARD.md** - Visão geral completa e guia de uso
- **QUERIES.md** - Todas as queries do banco e otimizações
- **DESIGN_SYSTEM.md** - Sistema de design completo
- **ROADMAP.md** - Roadmap e melhorias futuras
- **FINALIZACAO_FASE2.md** - Resumo executivo da FASE 2

## 🔐 Credenciais do Banco

O sistema está configurado para acessar o banco PostgreSQL via túnel reverso SSH:

- **Host**: 127.0.0.1
- **Porta**: 15432
- **Usuário**: readonly
- **Senha**: ReadOnly123
- **Database**: db_oxe_tech

**Importante**: O túnel SSH deve estar ativo antes de executar o projeto.

## ✨ Funcionalidades Premium

### Design System
- ✅ Paletas de cores por módulo
- ✅ Tipografia Inter + Manrope
- ✅ Border radius premium (22px)
- ✅ Sombras suaves (soft, medium, large)
- ✅ Animações com framer-motion

### Componentes
- ✅ KPICard com animações fade-in
- ✅ Sidebar premium com logos
- ✅ Header com hierarquia visual
- ✅ Gráficos premium (Line, Bar, Pie, Area, Funnel)
- ✅ Tabelas modernas com paginação

### Performance
- ✅ Queries otimizadas (evitar N+1)
- ✅ Cache com React Query
- ✅ Refetch automático (60 segundos)
- ✅ Lazy loading onde necessário

### Helpers e Utilitários
- ✅ Formatters completos (date, number, percent, currency, duration)
- ✅ Hooks customizados (useAutoRefetch, useKpiAnimation, useModuleColor)
- ✅ API helpers padronizados

## 🎯 Status do Projeto

**FASE 1**: ✅ 100% Completo
**FASE 2**: ✅ 100% Completo

O Dashboard está **100% funcional** e pronto para:
- ✅ Apresentação executiva
- ✅ Deploy em produção
- ✅ Uso em ambiente real

## 🚀 Próximos Passos (Opcional)

Consulte `docs/ROADMAP.md` para melhorias futuras sugeridas:
- Exportação de dados (CSV, PDF, Excel)
- Dark mode completo
- Autenticação e autorização
- Análise preditiva
- E muito mais...

## 📝 Notas Importantes

1. **Túnel SSH**: Deve estar ativo antes de executar
2. **Banco Read-Only**: Usuário readonly configurado
3. **Cache**: React Query gerencia cache automaticamente
4. **Revalidação**: Refetch automático a cada 60 segundos

## 🎨 Visual

O dashboard foi desenvolvido com foco em:
- **Visual premium** e moderno
- **UX intuitiva** e agradável
- **Dados hierarquizados** e organizados
- **Microanimações** suaves
- **Design apresentável** para secretária

---

## 📖 Documentação Adicional

Para mais detalhes sobre:
- **Queries e Otimizações**: Veja `docs/QUERIES.md`
- **Sistema de Design**: Veja `docs/DESIGN_SYSTEM.md`
- **Roadmap**: Veja `docs/ROADMAP.md`
- **Finalização FASE 2**: Veja `docs/FINALIZACAO_FASE2.md`

---

**Desenvolvido com ❤️ para o Ecossistema OxeTech**

**Versão**: 2.0.0 (FASE 2 Completa)
**Status**: ✅ Pronto para Produção
