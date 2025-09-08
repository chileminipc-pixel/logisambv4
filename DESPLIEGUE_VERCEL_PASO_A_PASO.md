# 🚀 Despliegue LOGISAMB en Vercel - Paso a Paso

## ✅ **VENTAJAS DE TU CONFIGURACIÓN ACTUAL**

- ✅ Ya tienes `/vercel-deployment/` configurado
- ✅ Frontend (React/Vite) + Backend (Express) en un solo proyecto
- ✅ Mantiene tu MariaDB externa (livesoft.ddns.me)
- ✅ Sin cambios de código necesarios

---

## 📋 **PASO 1: PREPARAR EL REPOSITORIO GITHUB**

### 1.1 Subir código a GitHub
```bash
# Si aún no tienes Git inicializado
git init

# Agregar archivos
git add .

# Commit inicial
git commit -m "feat: LOGISAMB Portal - Ready for Vercel deployment"

# Conectar a GitHub (crea el repo primero en github.com)
git remote add origin https://github.com/tu-usuario/logisamb-portal.git
git branch -M main
git push -u origin main
```

### 1.2 Estructura que subirás
```
├── App.tsx                 # Frontend React
├── components/             # Componentes React
├── styles/                 # CSS/Tailwind
├── backend/               # API Express (se convertirá a functions)
├── vercel-deployment/     # 🎯 Configuración de Vercel
└── package.json           # Dependencias frontend
```

---

## 🔧 **PASO 2: CONFIGURAR VERCEL**

### 2.1 Crear cuenta en Vercel
1. Ve a **https://vercel.com**
2. **"Sign up"** con tu cuenta de GitHub
3. Autoriza el acceso a tus repositorios

### 2.2 Importar proyecto
1. En Vercel Dashboard: **"New Project"**
2. Busca tu repositorio: **"logisamb-portal"**
3. Clic en **"Import"**

### 2.3 Configuración de Build
**Vercel detectará automáticamente, pero verifica:**

```yaml
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

---

## ⚙️ **PASO 3: VARIABLES DE ENTORNO**

### 3.1 En Vercel Dashboard
1. Ve a tu proyecto → **"Settings"** → **"Environment Variables"**

### 3.2 Agregar variables (una por una):

```env
# MariaDB Configuration
DATABASE_HOST=livesoft.ddns.me
DATABASE_PORT=3306
DATABASE_NAME=tu_base_datos
DATABASE_USER=tu_usuario_mariadb
DATABASE_PASSWORD=tu_password_mariadb

# App Configuration
NODE_ENV=production
JWT_SECRET=tu_jwt_secret_super_seguro_123456

# CORS Configuration
CORS_ORIGIN=https://tu-app.vercel.app
```

**⚠️ IMPORTANTE:** 
- Reemplaza `tu_base_datos`, `tu_usuario_mariadb`, `tu_password_mariadb` con tus datos reales
- Cambia `JWT_SECRET` por algo único y seguro
- `CORS_ORIGIN` se configurará automáticamente después del primer deploy

---

## 🎯 **PASO 4: CONFIGURACIÓN AUTOMÁTICA**

### 4.1 Vercel leerá automáticamente:
- **`/vercel-deployment/vercel.json`** → Configuración de rutas
- **`/vercel-deployment/package.json`** → Dependencias del backend
- **`/vercel-deployment/vite.config.ts`** → Build del frontend

### 4.2 Tu backend se convertirá en:
```
/backend/routes/auth.js     → /api/auth/[...].js
/backend/routes/informes.js → /api/informes/[...].js
```

---

## 🚀 **PASO 5: DESPLEGAR**

### 5.1 Deploy inicial
1. En Vercel Dashboard: **"Deploy"**
2. Vercel construirá automáticamente
3. **Tiempo esperado:** 2-5 minutos

### 5.2 Verificar build
**✅ Build exitoso mostrará:**
```
✅ Installing dependencies...
✅ Building frontend...
✅ Converting backend to serverless functions...
✅ Deployment ready
```

### 5.3 Tu URL final
```
https://logisamb-portal-tu-usuario.vercel.app
```

---

## 🔍 **PASO 6: VERIFICAR FUNCIONAMIENTO**

### 6.1 Probar la aplicación
1. **Abrir URL de Vercel**
2. **Verificar login page** aparece correctamente
3. **Comprobar conexión** a MariaDB (esquina superior derecha)

### 6.2 Probar API endpoints
```bash
# Verificar que las APIs respondan
https://tu-app.vercel.app/api/auth/test
https://tu-app.vercel.app/api/informes/guias
```

### 6.3 Test de login
1. **Usuario de prueba** de tu MariaDB
2. **Verificar dashboard** carga con datos reales
3. **Probar exportación** de reportes

---

## 🔧 **PASO 7: CONFIGURACIÓN FINAL**

### 7.1 Actualizar CORS_ORIGIN
1. **Copia tu URL final** de Vercel
2. **Settings** → **Environment Variables**
3. **Actualizar CORS_ORIGIN:** `https://tu-app-final.vercel.app`
4. **Redeploy:** Git push o "Redeploy" en Vercel

### 7.2 Dominio personalizado (opcional)
1. **Settings** → **Domains**
2. **Add Domain:** `portal.logisamb.cl`
3. **Configurar DNS** según instrucciones de Vercel

---

## 📊 **ARQUITECTURA FINAL EN VERCEL**

```
Frontend (Estático)
├── React/Vite Build → CDN Global
├── Tailwind CSS → Optimizado
└── Assets → Edge Cache

Backend (Serverless Functions)
├── /api/auth/* → Autenticación JWT
├── /api/informes/* → Consultas a MariaDB
└── Conexión directa → livesoft.ddns.me:3306

Database (Externa)
└── MariaDB → livesoft.ddns.me (sin cambios)
```

---

## 🚨 **TROUBLESHOOTING**

### Error: "Function timeout"
- **Causa:** Consulta SQL muy lenta
- **Solución:** Optimizar índices en MariaDB

### Error: "Cannot connect to database"
- **Causa:** Variables de entorno incorrectas
- **Solución:** Verificar DATABASE_* en Vercel Settings

### Error: "CORS policy error"
- **Causa:** CORS_ORIGIN incorrecto
- **Solución:** Actualizar con URL final de Vercel

### Build falla
- **Revisar logs** en Vercel Dashboard
- **Verificar package.json** tiene todas las dependencias

---

## ⚡ **VENTAJAS POST-DEPLOY**

### Performance
- **CDN global** → Carga rápida mundial
- **Edge caching** → Assets optimizados
- **Serverless** → Escalado automático

### Mantenimiento
- **Deploy automático** → Push a main = deploy
- **Preview deploys** → Cada branch/PR
- **Rollback fácil** → Un clic para versión anterior

### Monitoreo
- **Analytics integrado** → Tráfico y performance
- **Function logs** → Debug de APIs
- **Error tracking** → Alertas automáticas

---

## 🎯 **CHECKLIST FINAL**

- [ ] Código subido a GitHub
- [ ] Proyecto importado en Vercel
- [ ] Variables de entorno configuradas
- [ ] Deploy exitoso
- [ ] URL funcionando
- [ ] Login con MariaDB OK
- [ ] Dashboard mostrando datos reales
- [ ] APIs respondiendo correctamente
- [ ] CORS configurado correctamente

---

## 🔄 **WORKFLOW DE DESARROLLO**

```
Desarrollo Local → Git Push → Vercel Deploy Automático

Local: http://localhost:5173
Production: https://tu-app.vercel.app
```

**¡Tu aplicación LOGISAMB estará en producción en menos de 10 minutos!** 🚀

---

## 📞 **SOPORTE**

**Si algo falla:**
1. **Vercel Logs:** Ver errores específicos
2. **Function Logs:** Debug de APIs
3. **GitHub Issues:** Para código
4. **Vercel Support:** Para plataforma

**¡Lista para recibir usuarios reales!** 🎉