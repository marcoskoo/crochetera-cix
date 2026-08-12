# Despliegue de CROCHETERA.CIX

## Opción 1: VPS con Docker (Recomendada)

### Requisitos
- Un VPS (DigitalOcean, Linode, Contabo, etc.) con Ubuntu 20+
- Docker y Docker Compose instalados

### Pasos

```bash
# 1. Clonar el repositorio en tu VPS
git clone <tu-repo> crochetera
cd crochetera

# 2. Construir y arrancar
docker-compose up -d --build

# 3. Hacer seed de datos iniciales
docker-compose exec web bun run scripts/seed.ts

# 4. Tu app estará en http://tu-servidor:3000
```

### Actualizar
```bash
git pull
docker-compose up -d --build
```

### Ver logs
```bash
docker-compose logs -f web
```

---

## Opción 2: VPS sin Docker (Node.js directo)

### Requisitos
- Node.js 20+
- Bun
- PM2 (process manager)

```bash
# 1. Clonar
git clone <tu-repo> crochetera
cd crochetera

# 2. Instalar dependencias
bun install

# 3. Generar Prisma
bun run db:generate
bun run db:push

# 4. Hacer seed
bun run scripts/seed.ts

# 5. Build de producción
bun run build

# 6. Arrancar con PM2
pm2 start "node .next/standalone/server.js" --name crochetera
pm2 startup
pm2 save
```

### Configurar Nginx (proxy reverso)
```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL gratis con Certbot
```bash
sudo certbot --nginx -d tu-dominio.com
```

---

## Opción 3: Render.com (gratis)

1. Sube el código a GitHub
2. Ve a render.com → New → Web Service
3. Conecta tu repo
4. Configuración:
   - Build Command: `bun install && bun run db:generate && bun run build`
   - Start Command: `node .next/standalone/server.js`
5. Añade variable de entorno `DATABASE_URL` con PostgreSQL de Render

---

## Variables de entorno necesarias

```env
DATABASE_URL=file:/app/db/custom.db
NEXT_TELEMETRY_DISABLED=1
```

## Credenciales admin
- Usuario: `ashleykoo`
- Contraseña: `carolinechimoy`

## Puertos
- App: 3000
- HTTPS: 443 (con Nginx + Certbot)
