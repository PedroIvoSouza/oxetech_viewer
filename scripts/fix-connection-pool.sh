#!/bin/bash

# Script para configurar pool de conexões no DATABASE_URL
# Este script ajuda a adicionar os parâmetros de pool ao DATABASE_URL

echo "=== Configuração do Pool de Conexões do Prisma ==="
echo ""
echo "PROBLEMA: Pool de conexões esgotado (limite: 3, timeout: 10s)"
echo "SOLUÇÃO: Adicionar ?connection_limit=10&pool_timeout=20 ao DATABASE_URL"
echo ""

# Verificar se .env existe
if [ ! -f .env ]; then
    echo "❌ Arquivo .env não encontrado!"
    echo "Crie um arquivo .env com a variável DATABASE_URL"
    exit 1
fi

# Verificar se DATABASE_URL já tem parâmetros de pool
if grep -q "connection_limit" .env; then
    echo "⚠️  DATABASE_URL já contém parâmetros de pool"
    echo "Deseja atualizar? (s/n)"
    read -r resposta
    if [ "$resposta" != "s" ]; then
        echo "Cancelado."
        exit 0
    fi
fi

# Ler DATABASE_URL atual
CURRENT_URL=$(grep "^DATABASE_URL=" .env | cut -d '=' -f2-)

if [ -z "$CURRENT_URL" ]; then
    echo "❌ DATABASE_URL não encontrado no .env"
    exit 1
fi

echo "DATABASE_URL atual:"
echo "$CURRENT_URL"
echo ""

# Remover parâmetros antigos de pool se existirem
CLEAN_URL=$(echo "$CURRENT_URL" | sed -E 's/[?&](connection_limit|pool_timeout)=[^&]*//g' | sed 's/[?&]$//')

# Adicionar novos parâmetros
if [[ "$CLEAN_URL" == *"?"* ]]; then
    NEW_URL="${CLEAN_URL}&connection_limit=10&pool_timeout=20"
else
    NEW_URL="${CLEAN_URL}?connection_limit=10&pool_timeout=20"
fi

# Criar backup
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ Backup criado: .env.backup.*"

# Atualizar .env
sed -i "s|^DATABASE_URL=.*|DATABASE_URL=\"$NEW_URL\"|" .env

echo ""
echo "✅ DATABASE_URL atualizado:"
echo "$NEW_URL"
echo ""
echo "⚠️  IMPORTANTE: Reinicie o servidor para aplicar as mudanças:"
echo "   npm run build"
echo "   npm start"
echo ""

