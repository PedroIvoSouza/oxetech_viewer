# Compatibilização de Dados Legados do Lab (CSV)

## Objetivo

Integrar os dados históricos do CSV (`Dashboard - OxeTech lab - Respostas ao formulário 1.csv`) com o banco de dados atual, evitando duplicações e garantindo a prevalência dos dados mais completos.

## Estratégia

### 1. Normalização
- **Laboratórios**: Normalização de nomes (ex: "maceió - centro de inovação" → "Maceió - Centro de Inovação")
- **Cursos**: Uso da função `normalizarCurso()` para padronizar nomes
- **Datas**: Conversão de formato brasileiro (DD/MM/YYYY) para Date

### 2. Comparação de Turmas
Duas turmas são consideradas similares se:
- Mesmo laboratório (normalizado)
- Mesmo curso (normalizado)
- Datas de início e encerramento com diferença ≤ 30 dias

### 3. Prevalência
Em caso de turmas duplicadas:
- **Prevalece a turma com maior número de formados (certificados)**
- Se CSV tem mais formados → Atualiza banco
- Se Banco tem mais formados → Mantém banco

### 4. Importação
- **Turmas novas**: Criadas no banco
- **Laboratórios inexistentes**: Criados automaticamente
- **Matrículas**: Não podem ser criadas automaticamente sem dados dos alunos individuais

## Scripts Disponíveis

### 1. Compatibilização (Análise)
```bash
npm run csv:compatibilizar
```

Este script:
- Processa o CSV
- Busca turmas no banco
- Compara e identifica duplicatas
- Gera relatório com:
  - Total de turmas no CSV
  - Total de turmas no banco
  - Duplicatas encontradas
  - Turmas para importar
  - Turmas para atualizar
  - Detalhes de prevalência

**Não faz alterações no banco de dados.**

### 2. Importação (Dry-Run)
```bash
npm run csv:importar:dry-run
```

Este script:
- Executa a compatibilização
- Simula a importação/atualização
- Mostra o que seria feito
- **Não faz alterações no banco de dados**

### 3. Importação (Real)
```bash
npm run csv:importar
```

Este script:
- Executa a compatibilização
- Importa novas turmas
- Atualiza turmas existentes (se CSV prevalece)
- Cria laboratórios se necessário
- **Faz alterações no banco de dados**

## Estrutura dos Scripts

### `/scripts/compatibilizar-csv-lab.ts`
- Função `processarCSV()`: Lê e normaliza dados do CSV
- Função `buscarTurmasBanco()`: Busca turmas existentes no banco
- Função `compatibilizarDados()`: Compara e identifica diferenças

### `/scripts/importar-csv-lab.ts`
- Função `encontrarOuCriarLaboratorio()`: Encontra ou cria laboratório
- Função `encontrarOuCriarTurma()`: Encontra ou cria turma
- Função `importarDados()`: Executa a importação completa

## Limitações

### ⚠️ Matrículas Individuais
O CSV contém apenas **números agregados** (total de inscritos, total de formados). Não contém dados dos alunos individuais.

**Consequência**: Não é possível criar matrículas automaticamente sem:
- Um CSV adicional com dados dos alunos
- Ou integração manual com dados existentes

### ⚠️ Dados de Turmas
O CSV não contém todos os campos necessários para criar uma turma completa:
- `carga_horaria`: Usa valor padrão (40h)
- `qtd_aulas`: Usa valor padrão (10 aulas)
- `perguntas`: Array vazio

**Recomendação**: Revisar e ajustar manualmente após importação.

### ⚠️ Datas Inválidas
Algumas datas no CSV podem estar incorretas (ex: `03/04/1901`). O script:
- Detecta e avisa sobre datas inválidas
- Usa data atual como fallback

## Fluxo de Uso Recomendado

1. **Análise Inicial**
   ```bash
   npm run csv:compatibilizar
   ```
   - Revisar o relatório
   - Verificar duplicatas e prevalências

2. **Simulação**
   ```bash
   npm run csv:importar:dry-run
   ```
   - Verificar o que seria feito
   - Validar decisões de prevalência

3. **Backup do Banco** (Obrigatório!)
   ```bash
   # Fazer backup antes de importar
   pg_dump -U user -d database > backup_$(date +%Y%m%d).sql
   ```

4. **Importação Real**
   ```bash
   npm run csv:importar
   ```
   - Executar importação
   - Revisar logs de criação/atualização

5. **Validação**
   - Verificar turmas criadas no banco
   - Revisar números de formados
   - Ajustar manualmente se necessário

## Exemplo de Saída

```
🔄 Iniciando compatibilização de dados legados...

📄 Processando CSV...
✅ 635 turmas encontradas no CSV

🔍 Buscando turmas no banco de dados...
✅ 142 turmas encontradas no banco

🔍 Comparando turmas...

⚠️  Duplicata encontrada: Maceió - Centro de Inovação - Lógica de Programação
   CSV: 18 formados | Banco: 12 formados
   → CSV prevalece (mais formados)

📊 Resumo:
   - Turmas no CSV: 635
   - Turmas no banco: 142
   - Duplicatas encontradas: 45
   - Turmas para importar: 590
   - Turmas para atualizar: 12
```

## Notas Importantes

1. **Sem Dados de Alunos**: O CSV não contém dados individuais dos alunos, então as matrículas não podem ser criadas automaticamente.

2. **Turmas Duplicadas**: A lógica de prevalência é automática, mas pode ser ajustada manualmente se necessário.

3. **Normalização de Cursos**: Usa a mesma lógica do sistema (`normalizarCurso()`), garantindo consistência.

4. **Tolerância de Datas**: 30 dias de diferença é considerado "mesma turma". Ajuste se necessário.

5. **Criação de Laboratórios**: Laboratórios inexistentes são criados automaticamente com coordenador padrão (primeiro aluno).

## Suporte

Em caso de problemas:
1. Verificar logs do script
2. Revisar formato do CSV
3. Validar dados no banco
4. Executar em modo dry-run antes de importar

