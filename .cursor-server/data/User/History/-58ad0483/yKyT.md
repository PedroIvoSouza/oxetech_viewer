# Correção: Certificados do Lab

## Problema Identificado

Os certificados do Lab estavam sendo buscados na tabela **errada**: `oxetechlab_inscricoes` com status `TWO`, quando na verdade eles estão na tabela **`matriculas`** com status `TWO` (APROVADO).

## Estrutura Correta

Segundo a estrutura do banco de dados:
- **Tabela de Inscrições**: `oxetechlab_inscricoes` - contém todas as inscrições
- **Tabela de Matrículas**: `matriculas` - contém as matrículas dos alunos
  - Status `ZERO` = Em andamento / Pendente
  - Status `ONE` = Em progresso
  - Status `TWO` = **APROVADO** (Certificado/Concluído) ✅

## Arquivos Corrigidos

### 1. `/app/api/lab/route.ts`
- ✅ Busca certificados de `matriculas` (status TWO)
- ✅ Inclui dados adicionais: `media`, `percentual_faltas`, `certificado_id`
- ✅ Contagem correta via `prisma.matriculas.count()`

### 2. `/app/api/home/route.ts`
- ✅ Corrigido para usar `matriculas.count({ where: { status: 'TWO' } })`

### 3. `/app/api/certificados/route.ts`
- ✅ Corrigido para buscar de `matriculas` com status TWO
- ✅ Inclui dados adicionais: `media`, `percentual_faltas`, `certificado_id`

### 4. `/app/api/monitor/executivo/route.ts`
- ✅ Corrigido para usar `matriculas.count({ where: { status: 'TWO' } })`

### 5. `/lib/bi/analysis.ts`
- ✅ Corrigido em múltiplas funções:
  - `analisarImpactoSocial()` - busca certificados Lab de `matriculas`
  - `analisarDesempenhoTerritorial()` - busca certificados Lab de `matriculas`
  - `analisarEficaciaProgramas()` - contagem de certificados Lab de `matriculas`

### 6. `/lib/bi/lab-analysis.ts`
- ✅ Totalmente reescrito para usar `matriculas` (status TWO) em vez de `oxetechlab_inscricoes`
- ✅ Contagem por laboratório via `matriculas`
- ✅ Contagem por curso via `matriculas`
- ✅ Lista de alunos certificados via `matriculas`

### 7. `/lib/audit/ai-auditor.ts`
- ✅ Auditoria corrigida para usar `matriculas` (status TWO)
- ✅ Verificações de inconsistências atualizadas

## Impacto

### Antes
- ❌ Certificados buscados de `oxetechlab_inscricoes` com status TWO
- ❌ Dados incompletos (sem média, faltas, etc.)
- ❌ Contagens incorretas
- ❌ Taxa de certificação incorreta

### Agora
- ✅ Certificados buscados de `matriculas` com status TWO (APROVADO)
- ✅ Dados completos: média, percentual de faltas, certificado_id
- ✅ Contagens corretas
- ✅ Taxa de certificação precisa

## Dados Adicionais Agora Disponíveis

Para cada certificado Lab, agora temos acesso a:
- `media`: Média do aluno no curso
- `percentual_faltas`: Percentual de faltas
- `certificado_id`: ID do certificado gerado (se houver)
- `updated_at`: Data de conclusão/certificação

## Verificação

Para verificar se a correção está funcionando:
1. Acesse `/lab` - verifique o número de certificados
2. Acesse `/bi/lab` - verifique as métricas de certificação
3. Acesse `/certificados` - verifique a lista de alunos certificados do Lab
4. Acesse `/audit` - verifique se há alertas sobre certificados

## Status

✅ **Todas as queries corrigidas**
✅ **Código compilando sem erros**
✅ **Dados agora refletem a realidade do banco**

