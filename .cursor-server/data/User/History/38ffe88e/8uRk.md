# Queries do Banco de Dados - Documentação

## 📋 Visão Geral

Este documento descreve todas as queries utilizadas no Dashboard OxeTech, organizadas por módulo e com recomendações de otimização.

## 🔍 Estrutura de Queries

Todas as API Routes seguem o padrão:
- Formato de resposta: `{ data, error }`
- Try/catch padronizado
- Validação de parâmetros
- Queries otimizadas (evitar N+1)

---

## 🏠 HOME (`/api/home`)

### Queries Principais

#### KPIs Gerais
```typescript
// Contagens paralelas para performance
const [totalAlunos, totalEmpresas, ...] = await Promise.all([
  prisma.alunos.count(),
  prisma.empresas.count(),
  // ...
])
```

#### Evolução dos Últimos 12 Meses
```typescript
const dozeMesesAtras = new Date()
dozeMesesAtras.setMonth(dozeMesesAtras.getMonth() - 12)

const alunos12Meses = await prisma.alunos.findMany({
  where: {
    created_at: { gte: dozeMesesAtras }
  },
  select: { created_at: true }
})
```

#### Municípios Atendidos
```typescript
const alunosMunicipios = await prisma.alunos.findMany({
  select: { municipio: true },
  distinct: ['municipio']
})
```

**Recomendações de Índice**:
- `alunos.created_at` - Para consultas temporais
- `alunos.municipio` - Para agregações por município

---

## 💼 WORK (`/api/work`)

### Queries Principais

#### Funil por Edital
```typescript
const editais = await prisma.oxetechwork_editals.findMany({
  select: {
    id: true,
    title: true,
    oxetechwork_inscricao_alunos: { select: { id: true } }
  }
})

// Evitar N+1 com Promise.all
const funilPorEditalPromises = editais.map(async (edital) => {
  const [candidaturasCount, contratacoesCount] = await Promise.all([
    prisma.candidaturas.count({ where: { ... } }),
    prisma.contratacoes.count({ where: { ... } })
  ])
  // ...
})
```

#### Tempo Médio entre Etapas
```typescript
const contratacoesComTempo = await prisma.contratacoes.findMany({
  select: {
    created_at: true,
    candidaturas: {
      select: {
        created_at: true,
        aluno_id: true,
        // ...
      }
    }
  },
  take: 100
})

// Buscar inscrições em batch
const alunosIds = contratacoesComTempo
  .map(c => c.candidaturas?.aluno_id)
  .filter((id): id is number => id !== undefined)

const inscricoesAlunos = await prisma.oxetechwork_inscricao_alunos.findMany({
  where: { aluno_id: { in: alunosIds } }
})
```

**Recomendações de Índice**:
- `oxetechwork_editals.dt_inicio_edital`
- `candidaturas.vaga_id`
- `contratacoes.candidatura_id`
- `contratacoes.ciclo_id`

---

## 🎓 EDU (`/api/edu`)

### Queries Principais

#### Frequência por Escola
```typescript
const escolas = await prisma.escolas_oxetech_edu.findMany({
  select: {
    id: true,
    nome: true,
    matriculas_oxetech_edu: {
      select: {
        inscricoes_turmas_oxetech_edu: {
          select: { presente: true }
        }
      }
    }
  }
})

// Calcular frequência em memória (mais eficiente)
const frequenciaPorEscola = escolas.map((escola) => {
  const totalPresencas = escola.matriculas_oxetech_edu.reduce(...)
  const totalAulas = escola.matriculas_oxetech_edu.reduce(...)
  return { frequencia: (totalPresencas / totalAulas) * 100 }
})
```

#### Frequência Diária (Últimos 30 dias)
```typescript
const trintaDiasAtras = new Date()
trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30)

const inscricoesRecentes = await prisma.inscricoes_turmas_oxetech_edu.findMany({
  where: { created_at: { gte: trintaDiasAtras } },
  select: { presente: true, created_at: true }
})
```

#### Mapa de Calor por Horário
```typescript
// Agrupar por horário em memória
const horariosMap = new Map<string, number>()

escolas.forEach((escola) => {
  escola.matriculas_oxetech_edu.forEach((matricula) => {
    matricula.inscricoes_turmas_oxetech_edu.forEach((inscricao) => {
      if (inscricao.presente && inscricao.turmas_oxetech_edu) {
        const hora = inscricao.turmas_oxetech_edu.hora_inicio
        const key = `${diaSemana} - ${hora}`
        horariosMap.set(key, (horariosMap.get(key) || 0) + 1)
      }
    })
  })
})
```

**Recomendações de Índice**:
- `escolas_oxetech_edu.municipio`
- `inscricoes_turmas_oxetech_edu.created_at`
- `inscricoes_turmas_oxetech_edu.presente`
- `turmas_oxetech_edu.dia_da_aula`

---

## 📚 TRILHAS (`/api/trilhas`)

### Queries Principais

#### Progresso por Trilha
```typescript
const trilhas = await prisma.trilhas_de_conhecimento.findMany({
  select: {
    id: true,
    titulo: true,
    modulos_trilhas: {
      select: { id: true }
    }
  }
})

const inscricoes = await prisma.inscricoes_trilhas_alunos.findMany({
  select: {
    trilha_id: true,
    concluido: true,
    modulos_trilhas_alunos: {
      select: {
        curso_concluido: true,
        atividade_concluida: true
      }
    }
  }
})

// Calcular progresso em memória
const progressoPorTrilha = trilhas.map((trilha) => {
  const inscricoesTrilha = inscricoes.filter(i => i.trilha_id === trilha.id)
  // ... cálculos
})
```

#### Evolução Temporal
```typescript
// Agrupar por mês em memória
const evolucaoTemporal = []
for (let i = 11; i >= 0; i--) {
  const mes = new Date()
  mes.setMonth(mes.getMonth() - i)
  const inicioMes = new Date(mes.getFullYear(), mes.getMonth(), 1)
  const fimMes = new Date(mes.getFullYear(), mes.getMonth() + 1, 0)

  const total = inscricoesTemporal.filter((insc) => {
    const data = new Date(insc.created_at)
    return data >= inicioMes && data <= fimMes
  }).length
  // ...
}
```

**Recomendações de Índice**:
- `inscricoes_trilhas_alunos.trilha_id`
- `inscricoes_trilhas_alunos.concluido`
- `inscricoes_trilhas_alunos.created_at`
- `modulos_trilhas_alunos.curso_concluido`
- `modulos_trilhas_alunos.atividade_concluida`

---

## 🧪 LAB (`/api/lab`)

### Queries Principais

#### Inscrições por Laboratório
```typescript
const inscricoes = await prisma.oxetechlab_inscricoes.findMany({
  select: {
    id: true,
    turmas: {
      select: {
        laboratorios: {
          select: { nome: true, municipio: true }
        },
        qtd_vagas_total: true,
        qtd_vagas_preenchidas: true
      }
    }
  }
})

// Agrupar por laboratório em memória
const laboratoriosMap = new Map()

inscricoes.forEach((inscricao) => {
  const labNome = inscricao.turmas?.laboratorios?.nome || 'Sem laboratório'
  if (!laboratoriosMap.has(labNome)) {
    laboratoriosMap.set(labNome, { totalInscricoes: 0, ... })
  }
  const lab = laboratoriosMap.get(labNome)!
  lab.totalInscricoes++
  // ...
})
```

#### Evolução Semanal
```typescript
const oitoSemanasAtras = new Date()
oitoSemanasAtras.setDate(oitoSemanasAtras.getDate() - 56)

const inscricoesRecentes = inscricoes.filter(
  i => new Date(i.created_at) >= oitoSemanasAtras
)

const evolucaoSemanal = []
for (let i = 7; i >= 0; i--) {
  // Calcular por semana
}
```

**Recomendações de Índice**:
- `oxetechlab_inscricoes.status`
- `oxetechlab_inscricoes.created_at`
- `oxetechlab_inscricoes.turma_id`
- `turmas.laboratorio_id`

---

## 👥 ALUNOS (`/api/alunos`)

### Queries Principais

#### Lista com Filtros Avançados
```typescript
const where: any = {}

// Filtro por programa
if (programa !== 'all') {
  if (programa === 'work') {
    where.oxetechwork_inscricao_alunos = { some: {} }
  }
  // ...
}

const [alunos, total] = await Promise.all([
  prisma.alunos.findMany({
    where,
    select: {
      // Seleções específicas (não trazer tudo)
      id: true,
      name: true,
      email: true,
      // ... relações necessárias
    },
    skip,
    take: limit,
    orderBy: { created_at: 'desc' }
  }),
  prisma.alunos.count({ where })
])
```

#### Municípios Únicos
```typescript
const municipios = await prisma.alunos.findMany({
  select: { municipio: true },
  distinct: ['municipio'],
  orderBy: { municipio: 'asc' }
})
```

**Recomendações de Índice**:
- `alunos.status`
- `alunos.municipio`
- `alunos.created_at`
- `alunos.email` (já existe unique)

---

## ⚡ Otimizações Aplicadas

### 1. Evitar N+1 Queries
- Uso de `Promise.all()` para queries paralelas
- Seleção de relações necessárias com `include`/`select`
- Agregações em memória quando possível

### 2. Seleções Específicas
- Sempre usar `select` para trazer apenas campos necessários
- Evitar `select: true` ou selecionar tudo

### 3. Limites e Paginação
- `take: 100` para listagens grandes
- Paginação em todas as listas
- Validação de limites (máximo 100 itens)

### 4. Cache-Friendly
- Queries com parâmetros claros
- Formato `{ data, error }` consistente
- React Query gerencia cache automaticamente

### 5. Índices Recomendados
```sql
-- Alunos
CREATE INDEX idx_alunos_created_at ON alunos(created_at);
CREATE INDEX idx_alunos_status ON alunos(status);
CREATE INDEX idx_alunos_municipio ON alunos(municipio);

-- Work
CREATE INDEX idx_oxetechwork_editals_dt_inicio ON oxetechwork_editals(dt_inicio_edital);
CREATE INDEX idx_candidaturas_vaga_id ON candidaturas(vaga_id);
CREATE INDEX idx_contratacoes_candidatura_id ON contratacoes(candidatura_id);

-- Edu
CREATE INDEX idx_inscricoes_turmas_edu_created_at ON inscricoes_turmas_oxetech_edu(created_at);
CREATE INDEX idx_inscricoes_turmas_edu_presente ON inscricoes_turmas_oxetech_edu(presente);

-- Trilhas
CREATE INDEX idx_inscricoes_trilhas_trilha_id ON inscricoes_trilhas_alunos(trilha_id);
CREATE INDEX idx_inscricoes_trilhas_concluido ON inscricoes_trilhas_alunos(concluido);
CREATE INDEX idx_inscricoes_trilhas_created_at ON inscricoes_trilhas_alunos(created_at);

-- Lab
CREATE INDEX idx_oxetechlab_status ON oxetechlab_inscricoes(status);
CREATE INDEX idx_oxetechlab_created_at ON oxetechlab_inscricoes(created_at);
```

---

## 📊 Performance

### Métricas Esperadas
- **Queries simples**: < 100ms
- **Queries com agregações**: < 500ms
- **Queries complexas**: < 1000ms

### Monitoramento
- Logs de erro em todas as rotas
- Console.error para debug
- Try/catch padronizado

---

## 🔒 Segurança

- Validação de parâmetros de entrada
- Sanitização de queries (Prisma faz isso automaticamente)
- Limites de paginação (máximo 100)
- Usuário readonly no banco

---

**Nota**: Todas as queries são otimizadas para performance e usam apenas leitura (readonly user).

