# Otimizações de Build para Máquinas com Pouca Memória

Este projeto foi otimizado para evitar travamentos durante o build em máquinas com recursos limitados.

## ✅ Otimizações Implementadas

### 1. **Swap Configurado**
- Foi criado um arquivo de swap de 780MB para evitar travamentos por falta de memória
- O swap é ativado automaticamente após reinicialização

### 2. **Configuração do Next.js Otimizada**
- Cache do webpack limitado para reduzir uso de memória
- Source maps desabilitados em produção
- Otimizações de compressão habilitadas

### 3. **Scripts de Build Otimizados**

#### Build Padrão (2GB de memória)
```bash
npm run build
```

#### Build Seguro (1.5GB de memória) - Recomendado
```bash
npm run build:safe
```

#### Build Ultra-Otimizado (com limpeza de cache e prioridade baixa)
```bash
npm run build:optimized
```

## 🚀 Como Usar

### Para builds normais:
```bash
npm run build:safe
```

### Para builds com máxima otimização (recomendado para sua máquina):
```bash
npm run build:optimized
```

Este script:
- Limita memória do Node.js a 1.5GB
- Limpa cache antes do build
- Executa com prioridade baixa (nice) para não travar o sistema
- Usa apenas 1 core de CPU

## 📊 Recursos do Sistema

- **RAM Total**: 3.8GB
- **Swap**: 780MB
- **CPUs**: 2 cores

## ⚠️ Dicas Adicionais

1. **Feche outros aplicativos** antes de fazer build
2. **Use `build:optimized`** se ainda tiver problemas
3. **Monitore o uso de memória** com `free -h` durante o build
4. **Se o disco estiver muito cheio**, limpe espaço antes de fazer build

## 🔧 Verificar Status do Swap

```bash
free -h
swapon --show
```

## 🐛 Solução de Problemas

Se ainda tiver travamentos:

1. Verifique se o swap está ativo:
   ```bash
   swapon --show
   ```

2. Limpe mais espaço no disco (necessário para o build funcionar)

3. Use o build mais conservador:
   ```bash
   NODE_OPTIONS='--max-old-space-size=1024' npm run build
   ```

