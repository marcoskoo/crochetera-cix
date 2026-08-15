# === CONFIGURACIÓN PARA VERCEL ===
# 
# Antes de hacer deploy en Vercel, cambia el provider a postgresql:
# En prisma/schema.prisma, cambiar:
#   provider = "sqlite"
# por:
#   provider = "postgresql"
#
# Vercel inyectará automáticamente DATABASE_URL al crear Postgres Store
#
# === VARIABLES DE ENTORNO EN VERCEL ===
# En Settings → Environment Variables, añadir:
#
# 1. DATABASE_URL (la crea Vercel automáticamente al añadir PostgreSQL)
# 2. BLOB_READ_WRITE_TOKEN (la crea Vercel automáticamente al añadir Blob Store)
# 3. NEXT_TELEMETRY_DISABLED = 1
#
# === PASOS PARA DEPLOY ===
# 1. Subir código a GitHub
# 2. Ir a https://vercel.com/new
# 3. Importar el repo
# 4. Añadir PostgreSQL: https://vercel.com/dashboard/stores/new?type=postgres
# 5. Añadir Blob Store: https://vercel.com/dashboard/stores/new?type=blob
# 6. Conectar la DB y Blob al proyecto
# 7. Deploy automático
# 8. Después del primer deploy, ejecutar migración:
#    En Vercel CLI: npx vercel env pull && bun run db:push && bun run scripts/seed.ts
