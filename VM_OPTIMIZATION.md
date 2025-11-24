# 🚀 Guia de Otimização Completa para VM

Este guia contém todas as configurações ideais para sua VM f1-micro rodar rápida e tranquila.

## 📊 Especificações da VM

- **RAM**: 3.8GB
- **CPU**: 2 cores
- **Disco**: 9.7GB
- **Tipo**: Google Cloud f1-micro

## ✅ Otimizações Implementadas

### 1. **Sistema Operacional**

#### Swappiness Otimizado
- **Padrão**: 60 (muito alto para VMs pequenas)
- **Otimizado**: 10 (reduz uso de swap, melhora performance)
- **Benefício**: Sistema usa mais RAM antes de usar swap

#### Configurações de Kernel
```bash
vm.swappiness=10              # Usa swap apenas quando necessário
vm.vfs_cache_pressure=50      # Mantém cache de arquivos equilibrado
vm.dirty_ratio=15             # Limita dados sujos em memória
vm.dirty_background_ratio=5    # Limite para escrita em background
```

### 2. **PostgreSQL** (se estiver usando)

**Configurações Otimizadas:**
- `shared_buffers = 64MB` (reduzido de 128MB)
- `max_connections = 20` (reduzido de 100)
- `work_mem = 4MB` (limita memória por operação)
- `maintenance_work_mem = 32MB` (para operações de manutenção)

**Economia**: ~100MB de RAM

### 3. **Redis** (se estiver usando)

**Configurações Otimizadas:**
- `maxmemory = 256mb` (limita uso de memória)
- `maxmemory-policy = allkeys-lru` (remove chaves antigas quando necessário)

**Economia**: Previne que Redis consuma toda a RAM

### 4. **Next.js**

#### Build (Produção)
- Limite de memória: 1.5GB (build:safe) ou 2GB (build)
- Cache reduzido
- Source maps desabilitados
- Paralelismo limitado

#### Desenvolvimento
- Limite de memória: 1GB
- Cache de páginas reduzido (5 páginas)
- Timeout de inatividade: 1 minuto
- Paralelismo: 1 worker

### 5. **Node.js**

**Limites Configurados:**
- Desenvolvimento: `--max-old-space-size=1024` (1GB)
- Build seguro: `--max-old-space-size=1536` (1.5GB)
- Build padrão: `--max-old-space-size=2048` (2GB)

### 6. **Limites do Sistema**

**Arquivos abertos:**
- Soft: 65536
- Hard: 65536

**Processos:**
- Soft: 4096
- Hard: 4096

## 🛠️ Como Aplicar as Otimizações

### Passo 1: Executar Script de Otimização

```bash
cd /home/oxetech_mcz/oxetech_viewer
./scripts/optimize-vm.sh
```

### Passo 2: Reiniciar Serviços

```bash
# PostgreSQL
sudo systemctl restart postgresql@13-main

# Redis
sudo systemctl restart redis-server

# Aplicar configurações de kernel
sudo sysctl -p
```

### Passo 3: Fazer Logout e Login

Para aplicar os novos limites do sistema:
```bash
# Faça logout e login novamente, ou:
exec su - $USER
```

### Passo 4: Configurar Variáveis de Ambiente

```bash
# Copie o arquivo de exemplo
cp .env.local.example .env.local

# Edite conforme necessário
nano .env.local
```

## 📈 Monitoramento

### Verificar Uso de Memória
```bash
free -h
```

### Verificar Uso de Swap
```bash
swapon --show
free -h
```

### Verificar Processos que Mais Usam Memória
```bash
ps aux --sort=-%mem | head -10
```

### Verificar Espaço em Disco
```bash
df -h
```

## 🎯 Configurações Recomendadas por Cenário

### Desenvolvimento Diário
```bash
# Use o script otimizado
npm run dev

# Ou com variáveis explícitas
NODE_OPTIONS='--max-old-space-size=1024' npm run dev
```

### Build de Produção
```bash
# Build seguro (recomendado)
npm run build:safe

# Build ultra-otimizado (se ainda tiver problemas)
npm run build:optimized
```

### Quando o Disco Estiver Cheio
```bash
./scripts/cleanup-disk.sh
```

## ⚠️ Serviços que Podem Ser Desabilitados

Se não estiver usando, considere desabilitar:

```bash
# Email (se não usar)
sudo systemctl disable exim4
sudo systemctl stop exim4

# Docker (se não usar containers)
sudo systemctl disable docker
sudo systemctl stop docker
```

## 🔍 Verificação Pós-Otimização

Após aplicar as otimizações, verifique:

1. **Memória disponível aumentou?**
   ```bash
   free -h
   ```

2. **Swap está sendo usado menos?**
   ```bash
   swapon --show
   ```

3. **Serviços estão rodando?**
   ```bash
   sudo systemctl status postgresql@13-main
   sudo systemctl status redis-server
   ```

## 📝 Checklist de Otimização

- [ ] Executar `./scripts/optimize-vm.sh`
- [ ] Reiniciar PostgreSQL
- [ ] Reiniciar Redis
- [ ] Aplicar configurações de kernel (`sudo sysctl -p`)
- [ ] Fazer logout/login para aplicar limites
- [ ] Configurar `.env.local`
- [ ] Testar build: `npm run build:safe`
- [ ] Testar desenvolvimento: `npm run dev`
- [ ] Verificar uso de memória: `free -h`

## 💡 Dicas Adicionais

1. **Monitore regularmente**: Use `free -h` e `df -h` regularmente
2. **Limpe cache**: Execute `./scripts/cleanup-disk.sh` semanalmente
3. **Evite múltiplos builds simultâneos**: Faça um build por vez
4. **Feche aplicações desnecessárias**: Antes de fazer build
5. **Use build:safe**: Para builds mais estáveis

## 🆘 Solução de Problemas

### VM ainda trava durante build?
1. Verifique se o swap está ativo: `swapon --show`
2. Use `npm run build:optimized` (mais conservador)
3. Limpe espaço: `./scripts/cleanup-disk.sh`
4. Feche outros aplicativos

### Memória ainda insuficiente?
1. Reduza `max_connections` do PostgreSQL para 10
2. Reduza `maxmemory` do Redis para 128mb
3. Use `NODE_OPTIONS='--max-old-space-size=768' npm run build`

### Disco cheio?
1. Execute `./scripts/cleanup-disk.sh`
2. Limpe logs antigos: `sudo journalctl --vacuum-time=1d`
3. Remova pacotes não usados: `sudo apt autoremove`

