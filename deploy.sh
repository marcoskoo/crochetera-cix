#!/bin/bash
# Script de despliegue para VPS
# Uso: ./deploy.sh en tu servidor

set -e

echo "🚀 Desplegando CROCHETERA.CIX..."

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Instalando..."
    curl -fsSL https://get.docker.com | sh
fi

# Verificar Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado. Instalando..."
    apt-get update && apt-get install -y docker-compose-plugin
fi

# Construir y arrancar
echo "📦 Construyendo contenedor..."
docker-compose up -d --build

# Esperar a que la DB esté lista
echo "⏳ Esperando a que la base de datos esté lista..."
sleep 5

# Migrar DB
echo "🗄️ Migrando base de datos..."
docker-compose exec -T web bun run db:push

# Hacer seed si es primera vez
echo "🌱 Verificando datos iniciales..."
docker-compose exec -T web bun run scripts/seed.ts || true

echo ""
echo "✅ ¡Despliegue completo!"
echo "🌐 Tu app está en: http://$(hostname -I | awk '{print $1}'):3000"
echo "🔐 Panel admin: http://$(hostname -I | awk '{print $1}'):3000 (Ctrl+Shift+A)"
echo ""
echo "Credenciales admin:"
echo "  Usuario: ashleykoo"
echo "  Contraseña: carolinechimoy"
