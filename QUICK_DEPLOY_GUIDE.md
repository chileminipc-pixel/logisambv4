# 🚀 Guía de Despliegue Rápido en Vercel

## 📦 Opción 1: Deploy Automático (5 minutos)

### Paso 1: Preparar archivos
```bash
# Crear nuevo proyecto
mkdir sistema-informes-vercel
cd sistema-informes-vercel

# Copiar archivos de configuración que creé arriba:
# - package.json
# - vite.config.ts  
# - vercel.json
```

### Paso 2: Copiar tu código
```bash
# Crear estructura
mkdir -p src/components src/styles

# Copiar tus componentes (desde Figma Make):
cp App.tsx src/
cp -r components/* src/components/
cp -r styles/* src/styles/
```

### Paso 3: Instalar y build
```bash
npm install
npm run build
```

### Paso 4: Deploy en Vercel
1. Ve a [vercel.com](https://vercel.com)
2. Conecta con GitHub/GitLab
3. Sube tu proyecto
4. ¡Deploy automático!

**Resultado:** `https://sistema-informes-xxx.vercel.app`

---

## 📱 Opción 2: Deploy Drag & Drop (2 minutos)

### Si prefieres no usar Git:
1. Ejecuta `npm run build` localmente
2. Ve a [vercel.com/new](https://vercel.com/new)
3. Arrastra la carpeta `dist/` 
4. ¡Listo!

---

## 🎯 Funcionalidades que tendrás:

✅ **Interfaz ultra moderna** (igual que en Figma Make)  
✅ **Login con datos demo** (admin@empresa-abc.com / demo123)  
✅ **Dashboard completo** con estadísticas  
✅ **Tablas responsivas** con todos los campos  
✅ **Exportación Excel/PDF** funcionando  
✅ **Filtros avanzados** por cliente/servicio  
✅ **SSL automático** (HTTPS)  
✅ **Dominio personalizable**  

❌ **No incluye:** Base de datos real (usa datos mock)

---

## 🔄 Para agregar Base de Datos Real después:

### Opción A: Supabase (Recomendado)
```bash
npm install @supabase/supabase-js
```

### Opción B: PlanetScale (MySQL compatible)
```bash
npm install mysql2
```

### Opción C: Railway + MariaDB
Deploy completo backend + frontend

---

## 🌐 URLs de ejemplo:

- **Demo live:** `https://sistema-informes.vercel.app`
- **Admin:** `https://sistema-informes.vercel.app/admin`  
- **API docs:** `https://sistema-informes.vercel.app/api-docs`

---

## 📊 Datos de prueba incluidos:

**Empresas:**
- Empresa ABC S.A.S.
- Corporación XYZ Ltda.  
- Industrias DEF S.A.

**Usuarios:**
- admin@empresa-abc.com / demo123
- admin@corporacion-xyz.com / demo123
- gerente@industrias-def.com / demo123

**Servicios:**
- Transporte Terrestre
- Transporte Aéreo
- Almacenamiento
- Transporte Marítimo
- Courier Express

---

## 🎨 Personalización

### Cambiar dominio:
`sistema-informes.vercel.app` → `tu-empresa.com`

### Cambiar colores:
Edita `/src/styles/globals.css` con tu paleta de colores

### Agregar logo:
Coloca `logo.png` en `/public/` y actualiza header

---

## 📈 Analytics incluidos:

Vercel incluye analytics automáticos:
- Visitas por página
- Tiempo de carga
- Dispositivos y browsers
- Ubicación geográfica

---

¿Te ayudo a hacer el deploy ahora mismo? Solo necesito saber:

1. **¿Prefieres Git o Drag & Drop?**
2. **¿Qué nombre quieres para la URL?**
3. **¿Necesitas algún cambio de diseño antes?**