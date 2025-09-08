# 🚀 Guía Completa: Despliegue en Vercel del Sistema de Reportes de Residuos

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener:

- ✅ Cuenta en [Vercel](https://vercel.com)
- ✅ Cuenta en [Supabase](https://supabase.com)
- ✅ Proyecto de Supabase configurado con las tablas necesarias
- ✅ Git instalado en tu sistema
- ✅ Repositorio en GitHub/GitLab/Bitbucket

---

## 🏗️ PASO 1: Preparar la Estructura del Proyecto

### 1.1 Verificar estructura de archivos

Tu proyecto debe tener esta estructura para Vercel:

```
proyecto-residuos/
├── src/
│   ├── main.tsx
│   ├── App.tsx (mover desde raíz)
│   ├── index.css
│   ├── components/
│   ├── contexts/
│   ├── lib/
│   ├── services/
│   └── types/
├── public/
│   └── data/
│       ├── usuarios.json
│       ├── clientes.json
│       ├── guias.json
│       └── facturas-impagas.json
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
└── postcss.config.js
```

### 1.2 Mover App.tsx a src/

Si `App.tsx` está en la raíz, muévelo a `src/App.tsx` y actualiza las importaciones.

---

## 🔧 PASO 2: Configurar Variables de Entorno

### 2.1 Crear archivo .env.local

En la raíz del proyecto, crea `.env.local`:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_publica_anonima

# Opcional: Para desarrollo local
VITE_APP_ENV=production
```

### 2.2 Obtener credenciales de Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a `Settings` → `API`
3. Copia:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

### 2.3 Actualizar .gitignore

Asegúrate de que `.env.local` esté en tu `.gitignore`:

```gitignore
# Environment variables
.env.local
.env.*.local
.env

# Build outputs
dist/
build/

# Dependencies
node_modules/

# Logs
*.log
```

---

## 📦 PASO 3: Verificar package.json

Asegúrate de que tu `package.json` tenga los scripts correctos:

```json
{
  "name": "sistema-reportes-residuos",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@supabase/supabase-js": "^2.39.0",
    "lucide-react": "^0.263.1",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^1.14.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "@vitejs/plugin-react": "^4.1.0",
    "typescript": "^5.2.2",
    "vite": "^5.0.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31"
  }
}
```

---

## 🌐 PASO 4: Configurar Supabase

### 4.1 Crear las tablas en Supabase

En el SQL Editor de Supabase, ejecuta:

```sql
-- Tabla clientes
CREATE TABLE clientes (
  id bigint primary key generated always as identity,
  nombre text not null,
  rut text not null unique,
  direccion text,
  telefono text,
  email text,
  tipo_cliente text default 'empresa',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabla usuarios
CREATE TABLE usuarios (
  id bigint primary key generated always as identity,
  usu_login text not null unique,
  usu_pwd text not null,
  usu_activo text default 'SI',
  clienteId bigint references clientes(id),
  nombre text not null,
  email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabla guias
CREATE TABLE guias (
  id bigint primary key generated always as identity,
  guia text not null,
  fecha text not null,
  clienteId bigint references clientes(id),
  sucursal text,
  servicio text,
  frecuencia text,
  lts_limite integer default 0,
  lts_retirados integer default 0,
  valor_servicio decimal(10,2) default 0,
  valor_lt_adic decimal(10,2) default 0,
  patente text,
  total decimal(10,2) default 0,
  observaciones text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabla facturas_impagas
CREATE TABLE facturas_impagas (
  id bigint primary key generated always as identity,
  fecha text not null,
  empresa text,
  sucursal text,
  rut text,
  no_guia text,
  dias_mora integer default 0,
  nro_factura text,
  fecha_factura text,
  clienteId bigint references clientes(id),
  monto_factura decimal(10,2) default 0,
  estado_mora text default 'pendiente',
  observaciones text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE guias ENABLE ROW LEVEL SECURITY;
ALTER TABLE facturas_impagas ENABLE ROW LEVEL SECURITY;

-- Políticas básicas para desarrollo (ajustar según necesidades)
CREATE POLICY "Enable read access for all users" ON clientes FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON usuarios FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON guias FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON facturas_impagas FOR SELECT USING (true);
```

### 4.2 Insertar datos de prueba

```sql
-- Insertar clientes de prueba
INSERT INTO clientes (id, nombre, rut, direccion, telefono, email, tipo_cliente) VALUES
(1, 'Copec Chile', '99.123.456-7', 'Av. Providencia 1234, Santiago', '+56 2 1234 5678', 'contacto@copec.cl', 'empresa'),
(2, 'Shell Chile', '99.234.567-8', 'Av. Las Condes 5678, Santiago', '+56 2 2345 6789', 'contacto@shell.cl', 'empresa'),
(3, 'Petrobras Chile', '99.345.678-9', 'Av. Kennedy 9012, Santiago', '+56 2 3456 7890', 'contacto@petrobras.cl', 'empresa');

-- Insertar usuarios de prueba
INSERT INTO usuarios (id, usu_login, usu_pwd, usu_activo, clienteId, nombre, email) VALUES
(1, 'copec_admin', 'demo123', 'SI', 1, 'Admin Copec', 'admin@copec.cl'),
(2, 'shell_admin', 'demo123', 'SI', 2, 'Admin Shell', 'admin@shell.cl'),
(3, 'petrobras_admin', 'demo123', 'SI', 3, 'Admin Petrobras', 'admin@petrobras.cl');
```

---

## 🚀 PASO 5: Desplegar en Vercel

### 5.1 Preparar el repositorio

```bash
# Inicializar git (si no está inicializado)
git init

# Agregar todos los archivos
git add .

# Commit inicial
git commit -m "Preparar proyecto para deployment en Vercel"

# Agregar remote (reemplaza con tu repositorio)
git remote add origin https://github.com/tu-usuario/tu-repositorio.git

# Push al repositorio
git push -u origin main
```

### 5.2 Conectar Vercel

1. Ve a [vercel.com](https://vercel.com) y haz login
2. Click en **"New Project"**
3. Importa tu repositorio de GitHub/GitLab/Bitbucket
4. Selecciona el repositorio del proyecto

### 5.3 Configurar el proyecto en Vercel

En la pantalla de configuración:

```
Framework Preset: Vite
Root Directory: ./
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### 5.4 Configurar Variables de Entorno

En Vercel, ve a la sección **"Environment Variables"** y agrega:

```
VITE_SUPABASE_URL = https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY = tu_clave_publica_anonima
```

### 5.5 Deploy

1. Click en **"Deploy"**
2. Espera a que termine el build (2-5 minutos)
3. ¡Tu aplicación estará disponible en una URL como `https://tu-proyecto.vercel.app`!

---

## ✅ PASO 6: Verificar el Deployment

### 6.1 Pruebas básicas

1. **Acceso a la aplicación**: La URL de Vercel debe cargar correctamente
2. **Datos JSON**: Verifica que `/data/usuarios.json` esté accesible
3. **Login**: Prueba con las credenciales de prueba:
   - Usuario: `copec_admin` / Contraseña: `demo123`
   - Usuario: `shell_admin` / Contraseña: `demo123`
   - Usuario: `petrobras_admin` / Contraseña: `demo123`

### 6.2 Debug en caso de errores

Si hay errores, ve a **Vercel Dashboard** → **Functions** → **View Function Logs**

---

## 🔄 PASO 7: Actualizaciones Automáticas

### 7.1 Configurar auto-deploy

Vercel ya está configurado para auto-deploy. Cada vez que hagas push a la rama `main`:

```bash
# Hacer cambios
git add .
git commit -m "Descripción de los cambios"
git push origin main
```

Vercel automáticamente detectará los cambios y desplegará la nueva versión.

---

## 🛠️ Troubleshooting Común

### Error: "Module not found"
```bash
# Verificar que todas las dependencias estén instaladas
npm install

# Verificar rutas de importación
# Las rutas deben ser relativas y con extensiones .tsx/.ts
```

### Error de Variables de Entorno
```bash
# Verificar que las variables estén configuradas en Vercel
# Deben empezar con VITE_ para ser accesibles en el frontend
```

### Error de Build
```bash
# Verificar TypeScript
npm run build

# Si hay errores de tipos, corregir en el código
```

### Error 404 en archivos JSON
```bash
# Verificar que los archivos estén en public/data/
# Accesibles en: https://tu-app.vercel.app/data/usuarios.json
```

### Error de Supabase
```bash
# Verificar credenciales en Vercel
# Verificar que las tablas existan en Supabase
# Verificar políticas RLS
```

---

## 📱 PASO 8: Configuración Adicional (Opcional)

### 8.1 Dominio Personalizado

1. En Vercel Dashboard → Settings → Domains
2. Add domain → Introduce tu dominio
3. Configurar DNS según las instrucciones

### 8.2 Analytics

1. En Vercel Dashboard → Analytics
2. Habilitar analytics para ver métricas de uso

### 8.3 Monitoring

1. Configurar alertas en Vercel
2. Monitorear logs de errores

---

## 🎉 ¡Listo!

Tu sistema de reportes de residuos ahora está desplegado en Vercel con:

- ✅ Frontend React con Vite
- ✅ Backend Supabase
- ✅ Autenticación de usuarios
- ✅ Gestión de datos por cliente
- ✅ Reportes y dashboards
- ✅ Auto-deployment desde Git

### URLs importantes:
- **Aplicación**: `https://tu-proyecto.vercel.app`
- **Vercel Dashboard**: `https://vercel.com/dashboard`
- **Supabase Dashboard**: `https://app.supabase.com`

### Credenciales de prueba:
- **Copec**: `copec_admin` / `demo123`
- **Shell**: `shell_admin` / `demo123`
- **Petrobras**: `petrobras_admin` / `demo123`

---

## 📞 Soporte

Si necesitas ayuda:
1. Verifica los logs en Vercel Dashboard
2. Revisa la documentación de Supabase
3. Consulta la documentación de Vite
4. Contacta al equipo de desarrollo

**¡Deployment completado exitosamente! 🚀**