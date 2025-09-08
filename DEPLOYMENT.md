# 🚀 Guía de Despliegue en Producción

## 📋 Requisitos Previos

- **Servidor Linux** (Ubuntu 20.04+ recomendado)
- **Node.js 18+** y **npm**
- **MariaDB 10.5+**
- **Nginx** (para proxy reverso)
- **Dominio** configurado apuntando a tu servidor
- **Certificado SSL** (Let's Encrypt recomendado)

## 🗄️ 1. Configuración de Base de Datos

### Instalar MariaDB
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mariadb-server

# Configurar MariaDB
sudo mysql_secure_installation
```

### Crear base de datos y usuario
```sql
-- Conectar como root
sudo mysql -u root -p

-- Crear base de datos
CREATE DATABASE informes_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Crear usuario para la aplicación
CREATE USER 'informes_user'@'localhost' IDENTIFIED BY 'TU_CONTRASEÑA_SEGURA_AQUI';
GRANT ALL PRIVILEGES ON informes_db.* TO 'informes_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## 🛠️ 2. Configuración del Backend

### Subir código del backend
```bash
# En tu servidor
cd /var/www/
sudo mkdir sistema-informes-backend
sudo chown $USER:$USER sistema-informes-backend
cd sistema-informes-backend

# Clonar o subir tu código backend aquí
# Copiar todos los archivos de la carpeta /backend/
```

### Instalar dependencias
```bash
npm install --production
```

### Configurar variables de entorno
```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar configuración real
nano .env
```

**Configuración de producción en `.env`:**
```env
NODE_ENV=production
PORT=3001

# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_USER=informes_user
DB_PASSWORD=TU_CONTRASEÑA_SEGURA_AQUI
DB_NAME=informes_db
DB_CONNECTION_LIMIT=10

# Seguridad
JWT_SECRET=tu_clave_jwt_super_segura_de_32_caracteres_minimo
BCRYPT_ROUNDS=12

# Frontend
FRONTEND_URL=https://tu-dominio.com
```

### Inicializar base de datos
```bash
# Ejecutar script de configuración
node scripts/setup-database.js
```

### Configurar PM2 para manejo de procesos
```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Crear archivo de configuración PM2
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'informes-backend',
    script: 'server.js',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: '/var/log/pm2/informes-backend-error.log',
    out_file: '/var/log/pm2/informes-backend-out.log',
    log_file: '/var/log/pm2/informes-backend.log',
    time: true
  }]
};
EOF

# Crear directorio de logs
sudo mkdir -p /var/log/pm2
sudo chown $USER:$USER /var/log/pm2

# Iniciar aplicación con PM2
pm2 start ecosystem.config.js

# Configurar PM2 para reinicio automático
pm2 startup
pm2 save
```

## 🌐 3. Configuración del Frontend

### Actualizar configuración del frontend
```typescript
// En /components/services/DatabaseService.tsx
// Reemplazar la URL base para las llamadas API

const API_BASE_URL = 'https://tu-dominio.com/api';

// Crear función para llamadas reales a la API
async function callAPI(endpoint: string, options: any = {}) {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}
```

### Compilar aplicación React
```bash
# En tu máquina local, en la carpeta del frontend
npm run build

# Esto genera la carpeta 'dist' con los archivos compilados
# Sube estos archivos a tu servidor
```

### Configurar Nginx

```bash
# Instalar Nginx
sudo apt install nginx

# Crear configuración del sitio
sudo nano /etc/nginx/sites-available/sistema-informes
```

**Configuración de Nginx:**
```nginx
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tu-dominio.com www.tu-dominio.com;

    # SSL Configuration (configurar después de obtener certificados)
    ssl_certificate /etc/letsencrypt/live/tu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tu-dominio.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384;

    # Frontend estático
    location / {
        root /var/www/sistema-informes-frontend;
        try_files $uri $uri/ /index.html;
        
        # Headers de seguridad
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
    }

    # Proxy para API backend
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
```

### Activar sitio y obtener SSL
```bash
# Activar configuración
sudo ln -s /etc/nginx/sites-available/sistema-informes /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Instalar Certbot para SSL
sudo apt install certbot python3-certbot-nginx

# Obtener certificado SSL
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com

# Configurar renovación automática
sudo crontab -e
# Agregar línea:
0 12 * * * /usr/bin/certbot renew --quiet
```

### Subir archivos del frontend
```bash
# Crear directorio para frontend
sudo mkdir -p /var/www/sistema-informes-frontend
sudo chown $USER:$USER /var/www/sistema-informes-frontend

# Subir archivos compilados (dist/) a este directorio
# Usando scp, rsync, git, etc.
```

## 🔒 4. Configuración de Seguridad

### Firewall
```bash
# Configurar UFW
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw allow 3306  # Solo si la DB está en otro servidor
```

### Backup automático
```bash
# Crear script de backup
sudo nano /usr/local/bin/backup-informes.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/backups/informes"
DATE=$(date +%Y%m%d_%H%M%S)

# Crear directorio si no existe
mkdir -p $BACKUP_DIR

# Backup de base de datos
mysqldump -u informes_user -p'TU_CONTRASEÑA' informes_db > $BACKUP_DIR/db_backup_$DATE.sql

# Backup de archivos
tar -czf $BACKUP_DIR/files_backup_$DATE.tar.gz /var/www/sistema-informes-backend

# Eliminar backups antiguos (mayores a 7 días)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completado: $DATE"
```

```bash
# Hacer ejecutable
sudo chmod +x /usr/local/bin/backup-informes.sh

# Configurar cron para backup diario
sudo crontab -e
# Agregar línea:
0 2 * * * /usr/local/bin/backup-informes.sh
```

## 🎯 5. Configuración Final y Pruebas

### Verificar servicios
```bash
# Verificar Backend
pm2 status
curl http://localhost:3001/health

# Verificar Nginx
sudo nginx -t
sudo systemctl status nginx

# Verificar MariaDB
sudo systemctl status mariadb
```

### Pruebas finales
1. **Abrir https://tu-dominio.com**
2. **Probar login con cuentas demo**
3. **Verificar carga de datos**
4. **Probar exportaciones**

## 📊 6. Monitoreo

### PM2 Monitoring
```bash
# Instalar PM2 Web Interface (opcional)
pm2 install pm2-web

# Ver logs en tiempo real
pm2 logs informes-backend

# Reiniciar aplicación
pm2 restart informes-backend
```

### Logs de Nginx
```bash
# Ver logs de acceso
sudo tail -f /var/log/nginx/access.log

# Ver logs de errores
sudo tail -f /var/log/nginx/error.log
```

## 🔧 7. Comandos Útiles

```bash
# Reiniciar todos los servicios
sudo systemctl restart nginx mariadb
pm2 restart all

# Actualizar aplicación
cd /var/www/sistema-informes-backend
git pull  # o actualizar archivos
npm install --production
pm2 restart informes-backend

# Verificar estado general
sudo systemctl status nginx mariadb
pm2 status
```

## 🆘 Resolución de Problemas

### Error de conexión a base de datos
```bash
# Verificar conexión
mysql -u informes_user -p informes_db

# Verificar logs
pm2 logs informes-backend
```

### Error 502 Bad Gateway
```bash
# Verificar backend
pm2 status
curl http://localhost:3001/health

# Verificar configuración Nginx
sudo nginx -t
```

### SSL no funciona
```bash
# Renovar certificados
sudo certbot renew
sudo systemctl reload nginx
```

---

¡Tu sistema de informes ya está listo para producción! 🎉

**URLs importantes:**
- Frontend: https://tu-dominio.com
- API: https://tu-dominio.com/api
- Health Check: https://tu-dominio.com/api/health

**Cuentas de prueba:**
- admin@empresa-abc.com / demo123
- admin@corporacion-xyz.com / demo123  
- gerente@industrias-def.com / demo123