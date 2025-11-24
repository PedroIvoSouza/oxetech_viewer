#!/bin/bash

# Script de build otimizado para máquinas com pouca memória
# Limita uso de recursos durante o build para evitar travamentos

set -e

echo "🚀 Iniciando build otimizado..."

# Limita memória do Node.js (1.5GB heap, 64MB semi-space)
export NODE_OPTIONS="--max-old-space-size=1536 --max-semi-space-size=64"
export NODE_ENV=production

# Limita uso de CPU (usa apenas 1 core para evitar sobrecarga)
export JOBS=1

# Configurações do Next.js para reduzir uso de memória
export NEXT_TELEMETRY_DISABLED=1

# Limpa cache antes do build para evitar acúmulo de memória
echo "🧹 Limpando cache..."
rm -rf .next
rm -rf node_modules/.cache

# Executa o build com prioridade baixa (nice) para não travar o sistema
echo "📦 Executando build..."
nice -n 10 npx next build

echo "✅ Build concluído com sucesso!"

