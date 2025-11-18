# Configuração do Pool de Conexões Prisma

## Problema

O Prisma por padrão usa um pool de conexões limitado (3 conexões, timeout de 10s). Quando há muitas queries sendo executadas simultaneamente (especialmente nas rotas de BI), o pool pode esgotar causando erros de timeout.

## Solução

### 1. Configurar via DATABASE_URL (Recomendado)

Adicione os parâmetros de pool diretamente na URL de conexão do banco de dados:

```env
DATABASE_URL="postgresql://user:password@host:5432/database?connection_limit=10&pool_timeout=20"
```

**Parâmetros:**
- `connection_limit`: Número máximo de conexões no pool (padrão: 3)
- `pool_timeout`: Timeout em segundos para obter uma conexão (padrão: 10)

**Recomendações:**
- `connection_limit`: 10-20 para desenvolvimento, 20-50 para produção
- `pool_timeout`: 20-30 segundos

### 2. Verificar Configuração Atual

Para verificar se a configuração está funcionando, procure por mensagens de log do Prisma:
- Se aparecer `connection_limit` nos logs, a configuração está sendo aplicada
- Se aparecer erros de timeout, aumente o `connection_limit`

### 3. Otimizar Queries

Além de aumentar o pool, é recomendado:
- Usar cache para queries frequentes (já implementado em `/lib/cache`)
- Reduzir número de queries simultâneas quando possível
- Usar `Promise.all()` com moderação em rotas críticas

### 4. Monitoramento

Monitore o uso de conexões:
- Logs do Prisma em desenvolvimento mostram queries
- Em produção, monitore métricas do banco de dados
- Se houver muitos timeouts, considere aumentar o pool ou otimizar queries

## Status Atual

- ✅ Pool configurado via comentário no schema.prisma
- ✅ Logs reduzidos em produção (apenas errors)
- ⚠️ **AÇÃO NECESSÁRIA**: Atualizar `.env` com `?connection_limit=10&pool_timeout=20` no DATABASE_URL

