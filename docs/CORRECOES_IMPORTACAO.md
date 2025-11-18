# Correções Implementadas na Importação do CSV

## 1. Correção de Permissões no Banco de Dados

### Problema
O script estava falhando com erro: `permission denied for table turmas` e `permission denied for table laboratorios`.

### Solução
- ✅ Adicionada verificação de permissões antes da importação
- ✅ Mensagens de erro claras com instruções de como resolver
- ✅ Tratamento de erros de permissão específicos durante criação

### Como Resolver Permissões
Veja o documento `/docs/PERMISSOES_POSTGRES.md` para instruções detalhadas.

## 2. Ajuste: Inscritos = Matriculados

### Problema
O CSV usa "Inscritos", mas no sistema isso corresponde a "Matriculados" (vagas preenchidas).

### Correção
- ✅ `numInscritos` do CSV → `qtd_vagas_preenchidas` no sistema
- ✅ `qtd_vagas_total` = `Math.max(numInscritos, numFormados)` para garantir consistência
- ✅ Comentários explicativos adicionados no código

**Exemplo:**
- CSV: "30 inscritos" → Sistema: `qtd_vagas_preenchidas: 30`
- CSV: "25 formados" → Sistema mantém em `matriculas` com `status: 'TWO'`

## 3. Normalização de Nomes de Cursos com IA

### Problema
Nomes de cursos estavam saindo mal formatados, cortados ou com erros de digitação:
- "Prograação" → deveria ser "Programação"
- "Pyho" → deveria ser "Python"
- "Lógica De Prograação" → deveria ser "Lógica de Programação"
- "Baco De Dados" → deveria ser "Banco de Dados"

### Solução Implementada
- ✅ Novo módulo `/lib/ai/course-name-fixer.ts` usando OpenAI GPT-4o-mini
- ✅ Correção automática de nomes de cursos antes da normalização
- ✅ Cache para evitar múltiplas chamadas para o mesmo curso
- ✅ Processamento em lotes para otimizar uso da API

### Funcionalidades da IA
1. **Correção de erros de digitação**: "Prograação" → "Programação"
2. **Completar nomes cortados**: "Infor" → "Informática"
3. **Normalizar capitalização**: "javascript" → "JavaScript"
4. **Expandir abreviações**: "JS" → "JavaScript"
5. **Manter sentido original**: Preserva o significado do curso

### Uso

**Com IA (padrão):**
```bash
npm run csv:compatibilizar
npm run csv:importar
```

**Sem IA (mais rápido, mas sem correção de nomes):**
```bash
npm run csv:compatibilizar:sem-ia
npm run csv:importar:sem-ia
```

## 4. Melhorias Adicionais

### Tratamento de Erros
- ✅ Mensagens de erro mais claras e específicas
- ✅ Instruções de resolução incluídas nos erros
- ✅ Stack trace em modo desenvolvimento

### Logs Melhorados
- ✅ Progresso de correção com IA
- ✅ Informações sobre permissões
- ✅ Detalhes de turmas criadas/atualizadas

### Performance
- ✅ Cache de correções de nomes (evita chamadas duplicadas à API)
- ✅ Processamento em lotes (10 cursos por vez)
- ✅ Delay entre lotes para evitar rate limit

## Fluxo Atualizado

1. **Processar CSV**:
   - Coletar todos os cursos únicos
   - Corrigir nomes com IA (se habilitado)
   - Normalizar laboratórios e cursos

2. **Compatibilizar**:
   - Comparar com turmas do banco
   - Identificar duplicatas
   - Aplicar prevalência (maior número de formados)

3. **Verificar Permissões**:
   - Testar leitura
   - Informar sobre necessidade de permissões

4. **Importar**:
   - Criar/atualizar turmas
   - Criar laboratórios se necessário
   - Usar `numInscritos` como `qtd_vagas_preenchidas`

## Exemplo de Saída com IA

```
🔄 Iniciando compatibilização de dados legados...

📄 Processando CSV...
🤖 Corrigindo 45 nomes de cursos únicos com IA...
✅ Correções concluídas

✅ 635 turmas encontradas no CSV
```

## Notas Importantes

1. **API OpenAI**: A chave está configurada no código (para desenvolvimento). Em produção, use variável de ambiente `OPENAI_API_KEY`.

2. **Custo**: Cada curso único gera uma chamada à API. Com cache, cursos repetidos não geram custo adicional.

3. **Rate Limit**: Há delay de 1 segundo entre lotes para evitar rate limit da OpenAI.

4. **Fallback**: Se a API falhar, o nome original é usado sem correção.

## Próximos Passos

1. Resolver permissões do banco (ver `/docs/PERMISSOES_POSTGRES.md`)
2. Testar em modo dry-run: `npm run csv:importar:dry-run`
3. Executar importação real: `npm run csv:importar`

