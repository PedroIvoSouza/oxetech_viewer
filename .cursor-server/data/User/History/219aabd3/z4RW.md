# OxeTech Dashboard - Documentação Completa

## 🎯 Visão Geral

Dashboard Analítico completo e em tempo real para o ecossistema OxeTech (Work, Edu, Trilhas, Lab). Desenvolvido com Next.js 14, TypeScript, Prisma, React Query e Recharts.

## 🏗️ Arquitetura

### Stack Tecnológica

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Estilização**: TailwindCSS, shadcn/ui
- **Animações**: Framer Motion
- **Gráficos**: Recharts
- **State Management**: React Query (TanStack Query)
- **ORM**: Prisma
- **Banco de Dados**: PostgreSQL (via túnel SSH)

### Estrutura de Diretórios

```
oxetech-dashboard/
├── app/
│   ├── (dashboard)/          # Páginas do dashboard
│   │   ├── page.tsx          # Home
│   │   ├── work/             # OxeTech Work
│   │   ├── edu/              # OxeTech Edu
│   │   ├── trilhas/          # Trilhas de Conhecimento
│   │   ├── lab/              # OxeTech Lab
│   │   └── alunos/           # Alunos
│   ├── api/                  # API Routes
│   │   ├── home/route.ts
│   │   ├── work/route.ts
│   │   ├── edu/route.ts
│   │   ├── trilhas/route.ts
│   │   ├── lab/route.ts
│   │   └── alunos/route.ts
│   ├── layout.tsx
│   ├── providers.tsx
│   └── globals.css
├── components/
│   ├── charts/               # Componentes de gráficos
│   │   ├── line-chart.tsx
│   │   ├── bar-chart.tsx
│   │   ├── pie-chart.tsx
│   │   ├── area-chart.tsx
│   │   └── funnel-chart.tsx
│   ├── dashboard/            # Componentes do dashboard
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   └── kpi-card.tsx
│   └── ui/                   # Componentes UI (shadcn/ui)
├── lib/
│   ├── db.ts                 # Prisma Client
│   ├── formatters.ts         # Utilitários de formatação
│   ├── design-system.ts      # Design system e paletas
│   ├── queries/              # Hooks React Query
│   │   ├── home.ts
│   │   ├── work.ts
│   │   ├── edu.ts
│   │   ├── trilhas.ts
│   │   ├── lab.ts
│   │   └── alunos.ts
│   └── utils.ts              # Utilitários gerais
└── prisma/
    └── schema.prisma         # Schema do Prisma
```

## 🎨 Design System

### Paletas de Cores por Módulo

```typescript
work: {
  primary: '#0A64C2',      // Azul
  secondary: '#2E2A87',    // Roxo escuro
  light: '#3B82F6',
  dark: '#1E40AF',
}

edu: {
  primary: '#F7A600',      // Amarelo
  secondary: '#FFA83E',    // Laranja claro
  light: '#FCD34D',
  dark: '#D97706',
}

lab: {
  primary: '#FF6A00',      // Laranja
  secondary: '#B30000',    // Vermelho
  light: '#FB923C',
  dark: '#C2410C',
}

trilhas: {
  primary: '#C80000',      // Vermelho
  secondary: '#7A0F0F',    // Vinho
  light: '#EF4444',
  dark: '#991B1B',
}
```

### Tipografia

- **Corpo**: Inter (300, 400, 500, 600, 700, 800)
- **Títulos**: Manrope (400, 500, 600, 700, 800)

### Espaçamento e Bordas

- **Border Radius**: 22px (premium)
- **Sombras**: soft, medium, large
- **Espaçamento**: Grid com gap-6 (24px)

### Animações

- **Fade In**: 0.5s ease-out
- **Slide In**: 0.4s ease-out
- **Pulse Slow**: 3s ease-in-out infinite

## 📊 Páginas e Funcionalidades

### 1. Home (Dashboard Principal)

**KPIs Principais**:
- Total de Alunos
- Total de Empresas
- Municípios Atendidos
- Matrículas Edu
- Inscrições Work
- Vagas, Candidaturas, Contratações Work
- Total de Trilhas
- Atividades Concluídas
- Frequências Registradas
- Instrutores e Agentes

**Gráficos**:
- Evolução dos Últimos 12 Meses
- Distribuição por Programa
- Funil Work Premium
- Evolução Work
- Top 10 Trilhas Mais Concluídas

**Cards de Resumo**:
- Taxa de Conversão Work
- Alcance Regional
- Engajamento em Trilhas

### 2. OxeTech Work

**Funcionalidades**:
- Funil completo por edital
- Vagas por status (Abertas/Encerradas)
- Ranking de empresas (top 20)
- Tempo médio entre etapas
- Tabela de vagas com status destacado

**Métricas**:
- Total de vagas, empresas, candidaturas, contratações
- Taxa de conversão
- Tempo médio: Inscrição → Candidatura
- Tempo médio: Candidatura → Contratação

### 3. OxeTech Edu

**Funcionalidades**:
- Frequência diária (últimos 30 dias)
- Ranking de cursos mais procurados
- Mapa de calor por horário
- Comparativo mensal de matrículas
- Tabela de frequência por escola

**Métricas**:
- Total de escolas, matrículas, turmas
- Média de frequência geral
- Frequência por escola (com município)
- Distribuição de matrículas por status

### 4. Trilhas de Conhecimento

**Funcionalidades**:
- Lista completa de trilhas
- Progresso médio por trilha
- Top 10 trilhas mais acessadas
- Tabela de inscritos com % concluído

**Métricas**:
- Total de trilhas
- Total de inscritos e concluídos
- Progresso médio geral
- Conclusão por módulo

### 5. OxeTech Lab

**Funcionalidades**:
- Inscrições por laboratório
- Distribuição por curso
- Evolução temporal
- Comparativo semanal

**Métricas**:
- Total de inscrições
- Inscrições por status
- Distribuição por curso
- Evolução ao longo do tempo

### 6. Alunos

**Funcionalidades**:
- Lista completa com paginação
- Filtros avançados (curso, trilha, programa, status)
- Visualização individual
- KPIs individuais

**Informações**:
- Perfil completo (read-only)
- Trilhas inscritas e concluídas
- Lab inscrito
- Matrículas Edu
- Frequência

## 🔧 API Routes

### Estrutura Padrão

```typescript
export async function GET() {
  try {
    // Queries otimizadas
    const data = await fetchData()
    
    return NextResponse.json({
      data,
      error: null,
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { data: null, error: 'Failed to fetch data' },
      { status: 500 }
    )
  }
}
```

### Rotas Disponíveis

- `/api/home` - Dashboard principal
- `/api/work` - Dados OxeTech Work
- `/api/edu` - Dados OxeTech Edu
- `/api/trilhas` - Dados Trilhas
- `/api/lab` - Dados OxeTech Lab
- `/api/alunos` - Lista de alunos
- `/api/alunos/[id]` - Detalhes do aluno

## 🔄 React Query

### Configuração

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minuto
      refetchOnWindowFocus: false,
    },
  },
})
```

### Hooks Disponíveis

- `useHomeData()` - Dashboard principal
- `useWorkData()` - OxeTech Work
- `useEduData()` - OxeTech Edu
- `useTrilhasData()` - Trilhas
- `useLabData()` - OxeTech Lab
- `useAlunosData(page, limit)` - Lista de alunos
- `useAlunoData(id)` - Detalhes do aluno

## 🎯 Práticas e Padrões

### Componentes

- Todos os componentes são client-side (`'use client'`)
- Uso de framer-motion para animações
- Cores do módulo aplicadas automaticamente
- Skeletons durante carregamento

### Formatação

```typescript
formatNumber(value)      // Números formatados
formatPercent(value)     // Percentuais
formatDate(date)         // Datas
formatCurrency(value)    // Moeda
```

### Performance

- Queries otimizadas (evitar N+1)
- Cache com React Query
- Lazy loading de componentes
- Animações otimizadas

## 🚀 Desenvolvimento

### Instalação

```bash
npm install
npm run prisma:generate
npm run dev
```

### Variáveis de Ambiente

```env
DATABASE_URL="postgresql://readonly:ReadOnly123@127.0.0.1:15432/db_oxe_tech?schema=public"
```

### Scripts

- `npm run dev` - Desenvolvimento
- `npm run build` - Build de produção
- `npm run start` - Produção
- `npm run lint` - Linter
- `npm run prisma:generate` - Gerar Prisma Client
- `npm run prisma:introspect` - Atualizar schema

## 📝 Notas Importantes

1. **Túnel SSH**: O túnel SSH deve estar ativo antes de executar o projeto
2. **Banco Read-Only**: Usuário readonly configurado
3. **Cache**: React Query gerencia cache automaticamente
4. **Revalidação**: Refetch automático a cada 60 segundos

## 🔐 Segurança

- Credenciais do banco em variáveis de ambiente
- Validação de entrada nas API Routes
- Tratamento de erros padronizado
- Queries com Prisma (proteção contra SQL injection)

---

**Desenvolvido para o Ecossistema OxeTech** 🚀

