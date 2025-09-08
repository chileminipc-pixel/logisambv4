# 🚀 Despliegue: Frontend en Vercel + Backend MariaDB

## 🏗️ Arquitectura

```
Frontend (Vercel) ←→ Backend API (Tu Servidor) ←→ MariaDB
```

- **Frontend**: React app en Vercel (HTTPS automático)
- **Backend**: Express.js API en tu servidor actual
- **Base de Datos**: Tu MariaDB existente

---

## 📦 1. Configurar Backend en tu Servidor

### Paso 1: Subir código backend
```bash
# En tu servidor
cd /var/www/
mkdir sistema-informes-api
cd sistema-informes-api

# Subir archivos de la carpeta /backend/
# server.js, package.json, routes/, config/, etc.
```

### Paso 2: Instalar dependencias
```bash
npm install
```

### Paso 3: Configurar variables de entorno
```bash
cp .env.example .env
nano .env
```

**Configuración crítica en `.env`:**
```env
NODE_ENV=production
PORT=3001

# Base de datos (tu configuración actual)
DB_HOST=localhost
DB_PORT=3306
DB_USER=tu_usuario_mariadb
DB_PASSWORD=tu_contraseña_mariadb
DB_NAME=informes_db

# Seguridad
JWT_SECRET=clave_super_segura_de_32_caracteres_minimo

# IMPORTANTE: URL de tu frontend en Vercel
FRONTEND_URL=https://sistema-informes.vercel.app
```

### Paso 4: Configurar NGINX para la API
```bash
sudo nano /etc/nginx/sites-available/api-informes
```

```nginx
server {
    listen 80;
    server_name api.tu-dominio.com;  # Subdominio para la API
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Headers CORS adicionales
        add_header Access-Control-Allow-Origin $http_origin always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type, X-Requested-With" always;
        add_header Access-Control-Allow-Credentials true always;
    }
    
    # Manejar preflight requests
    location ~ ^.+\.(OPTIONS)$ {
        add_header Access-Control-Allow-Origin $http_origin;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "Authorization, Content-Type, X-Requested-With";
        add_header Access-Control-Allow-Credentials true;
        add_header Content-Length 0;
        add_header Content-Type text/plain;
        return 200;
    }
}
```

### Paso 5: Activar sitio y SSL
```bash
sudo ln -s /etc/nginx/sites-available/api-informes /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# SSL para la API
sudo certbot --nginx -d api.tu-dominio.com
```

### Paso 6: Inicializar base de datos
```bash
# Ejecutar setup de BD
node scripts/setup-database.js
```

### Paso 7: Configurar PM2
```bash
# Instalar PM2
sudo npm install -g pm2

# Crear configuración
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'informes-api',
    script: 'server.js',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: '/var/log/pm2/informes-api-error.log',
    out_file: '/var/log/pm2/informes-api-out.log',
    log_file: '/var/log/pm2/informes-api.log',
    time: true
  }]
};
EOF

# Iniciar API
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 🌐 2. Configurar Frontend en Vercel

### Opción A: Deployment con Git (Recomendado)

#### Paso 1: Crear proyecto local
```bash
# Crear nuevo proyecto Vite
npm create vite@latest sistema-informes -- --template react-ts
cd sistema-informes

# Instalar dependencias
npm install lucide-react sonner recharts
npm install -D tailwindcss@next
```

#### Paso 2: Copiar tu código
```bash
# Copiar archivos desde Figma Make
cp -r components/ src/
cp -r styles/ src/
cp App.tsx src/
cp vercel-deployment/package.json ./
cp vercel-deployment/vite.config.ts ./
cp vercel-deployment/vercel.json ./
```

#### Paso 3: Configurar variables de entorno
```bash
# Crear .env.local
echo "VITE_API_URL=https://api.tu-dominio.com/api" > .env.local
```

#### Paso 4: Subir a GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/tu-usuario/sistema-informes.git
git push -u origin main
```

#### Paso 5: Deploy en Vercel
1. Ve a [vercel.com](https://vercel.com)
2. "New Project" → Conectar GitHub
3. Seleccionar tu repositorio
4. Configurar variables de entorno:
   - `VITE_API_URL` = `https://api.tu-dominio.com/api`
5. Deploy automático ✅

### Opción B: Deployment Drag & Drop

```bash
# Build local
npm run build

# Subir carpeta dist/ a vercel.com/new
```

---

## 🔧 3. Configuración de Variables de Entorno en Vercel

En Vercel Dashboard → Settings → Environment Variables:

```
VITE_API_URL = https://api.tu-dominio.com/api
VITE_APP_NAME = Sistema de Informes
VITE_APP_VERSION = 1.0.0
```

---

## 🧪 4. Probar la Conexión

### Verificar Backend
```bash
# Desde tu servidor
curl https://api.tu-dominio.com/health

# Debería responder:
{
  "status": "OK",
  "database": "Connected",
  "cors": {...}
}
```

### Verificar Frontend
1. Abrir `https://sistema-informes.vercel.app`
2. Login con: `admin@empresa-abc.com` / `demo123`
3. Verificar que carguen datos reales de MariaDB

---

## 🔒 5. Configuración de Seguridad

### Backend (.env)
```env
# Cambiar estos valores por otros seguros
JWT_SECRET=mi_clave_jwt_super_secreta_de_32_caracteres_2024
DB_PASSWORD=mi_contraseña_mariadb_super_secura_123

# URLs exactas de producción
FRONTEND_URL=https://sistema-informes.vercel.app
```

### Firewall
```bash
# Permitir puerto de la API
sudo ufw allow 3001
sudo ufw allow 'Nginx Full'
```

---

## 📊 6. URLs Finales

- **Frontend**: `https://sistema-informes.vercel.app`
- **API**: `https://api.tu-dominio.com/api`
- **Health Check**: `https://api.tu-dominio.com/health`
- **MariaDB**: Tu servidor actual (localhost:3306)

---

## 🎯 7. Ventajas de esta Arquitectura

✅ **Frontend ultrarrápido** (CDN global de Vercel)  
✅ **SSL automático** para frontend  
✅ **Control total** del backend y BD  
✅ **Escalabilidad** independiente  
✅ **Costos optimizados** (Vercel gratis + tu servidor actual)  
✅ **Datos reales** desde tu MariaDB  

---

## 🚨 8. Troubleshooting

### Error CORS
```bash
# Verificar configuración CORS en backend
curl -H "Origin: https://sistema-informes.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     https://api.tu-dominio.com/api/informes
```

### Error de conexión BD
```bash
# Verificar conexión MariaDB
mysql -u tu_usuario -p informes_db -e "SELECT COUNT(*) FROM informes_tabla;"
```

### Logs del backend
```bash
pm2 logs informes-api
```

---

## 🔄 9. Actualizaciones

### Actualizar Frontend
```bash
# En local
git add .
git commit -m "Update frontend"
git push origin main
# Auto-deploy en Vercel ✅
```

### Actualizar Backend
```bash
# En servidor
cd /var/www/sistema-informes-api
git pull  # o subir archivos manualmente
npm install
pm2 restart informes-api
```

---

## 📈 10. Monitoreo

### Vercel Analytics
- Automático en el dashboard de Vercel
- Métricas de rendimiento y visitantes

### Backend Monitoring
```bash
# Status de servicios
pm2 status
systemctl status nginx mariadb

# Logs en tiempo real
pm2 logs informes-api --lines 50
```

---

¡Tu sistema ya está listo con la mejor arquitectura para producción! 🎉

**Testing rápido:**
1. `https://sistema-informes.vercel.app` → Login → Ver datos reales
2. `https://api.tu-dominio.com/health` → Verificar API
3. Exportar Excel/PDF → Confirmar funcionalidad completa