#!/bin/bash

# Script de limpeza de disco para liberar espaço
# Use este script quando o disco estiver ficando cheio

set -e

echo "🧹 Iniciando limpeza de disco..."

# Limpa cache do npm
echo "📦 Limpando cache do npm..."
rm -rf ~/.npm/_cacache 2>/dev/null || true
rm -rf ~/.npm/_logs 2>/dev/null || true

# Limpa cache do usuário
echo "🗑️  Limpando cache do usuário..."
rm -rf ~/.cache/* 2>/dev/null || true

# Limpa logs antigos do sistema (requer sudo)
echo "📋 Limpando logs do sistema..."
sudo journalctl --vacuum-time=3d 2>/dev/null || echo "  (requer permissões sudo)"

# Limpa pacotes antigos do apt
echo "📦 Limpando cache do apt..."
sudo apt-get clean 2>/dev/null || echo "  (requer permissões sudo)"

# Limpa build antigo do Next.js (opcional - descomente se necessário)
# echo "🗑️  Limpando build antigo..."
# rm -rf .next 2>/dev/null || true

# Mostra espaço disponível
echo ""
echo "✅ Limpeza concluída!"
echo ""
df -h / | tail -1

