# Análise Completa de Business Intelligence (BI) - OxeTech Dashboard

## 📊 Visão Geral

Este documento descreve a camada completa de Business Intelligence implementada no OxeTech Dashboard, que realiza análises estratégicas profundas do banco de dados para apoiar decisões executivas e gestão pública.

## 🎯 Objetivo

Fornecer insights estratégicos baseados em dados reais do banco de dados, permitindo:
- **Análise de Impacto Social**: Medição do impacto real dos programas
- **Análise de Eficácia**: Avaliação da eficiência de cada eixo
- **Tendências e Projeções**: Previsões e análises temporais
- **Desempenho Territorial**: Distribuição geográfica dos resultados
- **Oportunidades e Gaps**: Identificação de oportunidades de melhoria
- **ROI e Eficiência**: Análise de retorno sobre investimento

## 📁 Estrutura

### Arquivos Principais

```
lib/bi/analysis.ts          # Módulo principal de análise BI
lib/queries/bi.ts           # React Query hooks para BI
app/api/bi/                 # API Routes para BI
├── completa/route.ts       # Análise completa
├── impacto-social/route.ts # Impacto social
├── eficacia/route.ts       # Eficácia dos programas
├── tendencias/route.ts     # Tendências e projeções
├── territorial/route.ts    # Desempenho territorial
├── oportunidades/route.ts  # Oportunidades e gaps
└── roi/route.ts           # ROI e eficiência
```

## 🔍 Análises Implementadas

### 1. Impacto Social

**Métricas:**
- Total de alunos impactados
- Total de certificados
- Total de empresas atendidas
- Total de municípios atendidos
- Taxa de empregabilidade
- Distribuição por gênero
- Distribuição por faixa etária
- Distribuição por município (top 20)
- Distribuição por eixo (Work, Edu, Trilhas, Lab)

**Fonte de Dados:**
- `alunos` - Total de alunos únicos
- `contratacoes` - Certificados Work
- `matriculas_oxetech_edu` - Certificados Edu
- `inscricoes_trilhas_alunos` - Certificados Trilhas
- `oxetechlab_inscricoes` - Certificados Lab
- `empresas` - Empresas atendidas
- `escolas_oxetech_edu` - Escolas
- `laboratorios` - Laboratórios

### 2. Eficácia dos Programas

**Métricas por Eixo:**

#### Work
- Taxa de conversão (inscrições → contratações)
- Taxa de retenção (3, 6, 12 meses)
- Tempo médio de contratação
- Empresas por ciclo

#### Edu
- Taxa de frequência
- Taxa de evasão
- Taxa de certificação
- Escolas ativas
- Cursos mais procurados

#### Trilhas
- Taxa de conclusão
- Tempo médio de conclusão
- Trilhas mais concluídas
- Módulos abandonados

#### Lab
- Taxa de ocupação
- Taxa de certificação
- Turmas ativas
- Cursos mais demandados

**Fonte de Dados:**
- `oxetechwork_inscricao_alunos` - Inscrições Work
- `contratacoes` - Contratações Work
- `matriculas_oxetech_edu` - Matrículas Edu
- `frequencias` - Frequências Edu
- `inscricoes_trilhas_alunos` - Inscrições Trilhas
- `modulos_trilhas_alunos` - Módulos Trilhas
- `oxetechlab_inscricoes` - Inscrições Lab
- `turmas` - Turmas Lab

### 3. Tendências e Projeções

**Métricas:**
- Crescimento mensal (últimos 12 meses)
- Projeção para próximos 6 meses
- Tendências por eixo (crescimento/estável/declínio)
- Sazonalidade (mês mais/menos ativo)

**Cálculos:**
- Média móvel dos últimos 3 meses
- Taxa de crescimento mensal
- Projeção linear baseada em tendência
- Comparação período atual vs anterior

**Fonte de Dados:**
- Timestamps de criação em todas as tabelas
- Agregação mensal por período
- Comparação temporal

### 4. Desempenho Territorial

**Métricas:**
- Ranking de municípios (top 20)
- Regiões de Alagoas (norte, sul, leste, oeste, centro)
- Municípios com maior impacto (score)
- Cobertura por município (escolas, empresas, laboratórios)

**Cálculos:**
- Score de impacto = (total alunos × 0.3) + (taxa certificação × 0.4) + (cobertura × 0.2) + (diversidade eixos × 0.1)
- Distribuição por região geográfica
- Ranking por múltiplos critérios

**Fonte de Dados:**
- `alunos.municipio` - Município dos alunos
- `escolas_oxetech_edu.municipio` - Município das escolas
- `laboratorios.municipio` - Município dos laboratórios
- Agregação por município

### 5. Oportunidades e Gaps

**Oportunidades:**
- Expansão para municípios sem cobertura
- Campanhas de divulgação
- Melhorias em programas específicos
- Parcerias estratégicas

**Gaps Identificados:**
- Cobertura: Municípios sem escolas/laboratórios
- Eficiência: Taxas baixas de conclusão
- Retenção: Evasão alta
- Qualidade: Problemas de qualidade

**Recomendações Automáticas:**
- Priorização por severidade
- Ações sugeridas
- Municípios alvos
- Impacto esperado

**Fonte de Dados:**
- Comparação de cobertura geográfica
- Análise de taxas de conclusão/evasão
- Identificação de padrões negativos

### 6. ROI e Eficiência

**Métricas:**
- Investimento por aluno (por eixo)
- Custo por certificado (por eixo)
- Eficiência orçamentária
- Comparação entre eixos

**Cálculos:**
- Distribuição simulada de orçamento (ajustar conforme dados reais)
- Eficiência = Certificados por R$ 1000 investido
- Projeção de gasto anual
- Análise comparativa

**Fonte de Dados:**
- Orçamento total (simulado - ajustar conforme real)
- Participantes por eixo
- Certificados por eixo
- Proporção de investimento por eixo

## 🚀 Uso

### API Routes

Todas as análises estão disponíveis via API Routes:

```typescript
// Análise completa
GET /api/bi/completa

// Análise específica
GET /api/bi/impacto-social
GET /api/bi/eficacia
GET /api/bi/tendencias
GET /api/bi/territorial
GET /api/bi/oportunidades
GET /api/bi/roi
```

### React Query Hooks

```typescript
import { 
  useImpactoSocial,
  useEficacia,
  useTendencias,
  useTerritorial,
  useOportunidades,
  useROI,
  useAnaliseCompleta
} from '@/lib/queries/bi'

// Uso básico
const { data, isLoading, error } = useAnaliseCompleta()
```

## ⚡ Performance

### Cache
- Cache LRU para queries pesadas
- TTL de 10-15 minutos por análise
- Invalidação automática por padrão

### Otimizações
- Agregações no banco de dados
- Queries paralelas quando possível
- Índices recomendados no schema

### Recomendações de Índices

```sql
-- Índices recomendados para melhor performance
CREATE INDEX idx_alunos_municipio ON alunos(municipio);
CREATE INDEX idx_alunos_genero ON alunos(genero);
CREATE INDEX idx_alunos_data_nascimento ON alunos(data_nascimento);
CREATE INDEX idx_contratacoes_created_at ON contratacoes(created_at);
CREATE INDEX idx_matriculas_status ON matriculas_oxetech_edu(status);
CREATE INDEX idx_inscricoes_concluido ON inscricoes_trilhas_alunos(concluido);
CREATE INDEX idx_lab_status ON oxetechlab_inscricoes(status);
```

## 📈 Métricas de Negócio

### KPIs Principais

1. **Impacto Social Total**
   - Alunos impactados
   - Certificados gerados
   - Municípios atendidos

2. **Eficiência Operacional**
   - Taxa de conversão por eixo
   - Tempo médio de conclusão
   - Taxa de ocupação

3. **Crescimento**
   - Taxa de crescimento mensal
   - Projeções futuras
   - Tendências por eixo

4. **Territorial**
   - Cobertura geográfica
   - Equidade regional
   - Impacto por município

5. **Financeiro**
   - ROI por eixo
   - Custo por certificado
   - Eficiência orçamentária

## 🎯 Próximos Passos

1. **Integração com Orçamento Real**
   - Conectar com dados de orçamento
   - Análise de execução orçamentária

2. **Análise Preditiva**
   - Machine Learning para previsões
   - Detecção de padrões

3. **Dashboard Executivo**
   - Página dedicada para BI
   - Visualizações interativas
   - Exportação de relatórios

4. **Alertas Inteligentes**
   - Alertas automáticos baseados em BI
   - Notificações de oportunidades
   - Alertas de gaps críticos

5. **Benchmarking**
   - Comparação com períodos anteriores
   - Comparação entre eixos
   - Benchmarking externo (quando disponível)

## 🔧 Manutenção

### Atualização de Dados
- Cache atualizado automaticamente
- Refetch configurado por análise
- Invalidação manual disponível

### Ajustes de Lógica
- Fácil extensão de análises
- Cálculos centralizados
- Documentação inline

### Monitoramento
- Logs de erros
- Métricas de performance
- Alertas de falha

## 📝 Notas Importantes

1. **Dados Simulados**: Alguns cálculos usam dados simulados (ex: orçamento). Ajustar conforme dados reais disponíveis.

2. **Mapeamento Regional**: Mapeamento de municípios por região é simplificado. Ajustar conforme mapeamento real de Alagoas.

3. **Taxa de Empregabilidade**: Cálculo baseado em contratações Work. Ajustar conforme definição real de empregabilidade.

4. **Performance**: Análises completas podem ser pesadas. Cache e refetch são essenciais.

5. **Escalabilidade**: Considerar materialized views para análises muito pesadas em produção.

---

**Versão**: 1.0.0  
**Última Atualização**: 2025-01-27  
**Autor**: OxeTech Dashboard Team

