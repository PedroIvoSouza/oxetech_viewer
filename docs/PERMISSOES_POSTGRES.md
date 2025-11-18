# Solução: Erro de Permissões no PostgreSQL

## Problema

Ao executar o script de importação, você pode encontrar o erro:

```
permission denied for table turmas
permission denied for table laboratorios
```

Isso ocorre porque o usuário do banco de dados não tem permissão para criar/inserir registros nessas tabelas.

## Solução

### 1. Conectar como Superusuário

Conecte-se ao PostgreSQL como superusuário (geralmente `postgres`):

```bash
psql -U postgres -d seu_banco_de_dados
```

Ou se estiver usando Docker:

```bash
docker exec -it nome_do_container psql -U postgres -d seu_banco_de_dados
```

### 2. Verificar Usuário Atual

Primeiro, verifique qual usuário está sendo usado pelo Prisma:

```bash
# Ver a DATABASE_URL no seu .env
cat .env | grep DATABASE_URL
```

O usuário está na URL: `postgresql://usuario:senha@host:porta/database`

### 3. Conceder Permissões

Execute os seguintes comandos SQL (substitua `seu_usuario` pelo usuário do seu DATABASE_URL):

```sql
-- Conceder permissões nas tabelas
GRANT ALL PRIVILEGES ON TABLE turmas TO seu_usuario;
GRANT ALL PRIVILEGES ON TABLE laboratorios TO seu_usuario;

-- Conceder permissões nas sequences (para auto-increment)
GRANT USAGE, SELECT ON SEQUENCE turmas_id_seq TO seu_usuario;
GRANT USAGE, SELECT ON SEQUENCE laboratorios_id_seq TO seu_usuario;

-- Se houver outras tabelas relacionadas que precisam ser criadas
GRANT ALL PRIVILEGES ON TABLE matriculas TO seu_usuario;
GRANT USAGE, SELECT ON SEQUENCE matriculas_id_seq TO seu_usuario;

-- Verificar se as permissões foram concedidas
\dp turmas
\dp laboratorios
```

### 4. Alternativa: Usar Superusuário Temporariamente

Se não puder conceder permissões, você pode temporariamente usar o usuário `postgres` na `DATABASE_URL`:

```env
DATABASE_URL="postgresql://postgres:senha@host:porta/database?connection_limit=10&pool_timeout=20"
```

⚠️ **ATENÇÃO**: Isso deve ser apenas temporário. Em produção, use um usuário específico com permissões mínimas necessárias.

## Verificar Permissões

Para verificar se as permissões foram concedidas corretamente:

```sql
-- Ver permissões da tabela turmas
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'turmas' AND grantee = 'seu_usuario';

-- Ver permissões da tabela laboratorios
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'laboratorios' AND grantee = 'seu_usuario';
```

## Próximos Passos

Após conceder as permissões:

1. Teste novamente em modo dry-run:
   ```bash
   npm run csv:importar:dry-run
   ```

2. Se funcionar, execute a importação real:
   ```bash
   npm run csv:importar
   ```

