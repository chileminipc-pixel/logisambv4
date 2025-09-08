# 🚀 Guía de Despliegue Local - Windows 11 + VSCode

## 📋 **REQUISITOS PREVIOS**

### 1. Instalar Node.js
1. Ve a https://nodejs.org/
2. Descarga la versión **LTS** (Long Term Support)
3. Ejecuta el instalador y sigue las instrucciones
4. **Verificar instalación:**
   ```bash
   node --version
   npm --version
   ```

### 2. Instalar Git (si no lo tienes)
1. Ve a https://git-scm.com/download/win
2. Descarga e instala Git para Windows
3. **Verificar:**
   ```bash
   git --version
   ```

---

## 🔧 **PASO 1: PREPARAR EL PROYECTO**

### 1.1 Abrir en VSCode
1. Abre **VSCode**
2. Presiona `Ctrl + Shift + P`
3. Busca "Terminal: Create New Terminal"
4. O usa `Ctrl + ñ` para abrir terminal

### 1.2 Navegación al proyecto
```bash
# Si ya tienes el proyecto descargado, navega a la carpeta
cd ruta/a/tu/proyecto

# Si necesitas clonarlo desde un repositorio
# git clone tu-repositorio-url
# cd nombre-del-proyecto
```

---

## ⚙️ **PASO 2: CONFIGURAR BACKEND**

### 2.1 Instalar dependencias del backend
```bash
# Navegar a la carpeta backend
cd backend

# Instalar dependencias
npm install
```

### 2.2 Configurar variables de entorno
1. En la carpeta `backend`, copia el archivo `.env.example`:
   ```bash
   copy .env.example .env
   ```

2. Abre el archivo `.env` y configura tu MariaDB:
   ```env
   # Configuración de Base de Datos MariaDB
   DATABASE_HOST=livesoft.ddns.me
   DATABASE_USER=tu_usuario_mariadb
   DATABASE_PASSWORD=tu_password_mariadb
   DATABASE_NAME=tu_base_datos
   DATABASE_PORT=3306
   
   # Configuración del servidor
   PORT=3001
   NODE_ENV=development
   
   # JWT Secret (genera uno aleatorio)
   JWT_SECRET=tu_jwt_secret_muy_seguro_aqui
   
   # CORS Origin (tu frontend)
   CORS_ORIGIN=http://localhost:5173
   ```

### 2.3 Probar conexión a la base de datos
```bash
# Ejecutar el script de configuración de BD
node scripts/setup-database.js
```

**✅ Si todo va bien, verás:**
```
✅ Conexión a MariaDB exitosa
✅ Tablas verificadas correctamente
✅ Base de datos configurada
```

---

## 🎨 **PASO 3: CONFIGURAR FRONTEND**

### 3.1 Instalar dependencias del frontend
```bash
# Volver a la raíz del proyecto
cd ..

# Instalar dependencias
npm install
```

### 3.2 Configurar variables de entorno (opcional)
Si tienes un archivo `.env` en la raíz, asegúrate de que tenga:
```env
VITE_API_URL=http://localhost:3001
```

---

## 🚀 **PASO 4: ARRANCAR LA APLICACIÓN**

### 4.1 Arrancar el Backend (Terminal 1)
```bash
# En la carpeta backend
cd backend
npm start
```

**✅ Deberías ver:**
```
🚀 Server running on port 3001
✅ Connected to MariaDB: tu_base_datos
🔗 CORS enabled for: http://localhost:5173
```

### 4.2 Arrancar el Frontend (Terminal 2)
**Abrir nueva terminal en VSCode:**
- Presiona `Ctrl + Shift + ñ` 
- O haz clic en el `+` junto a la terminal actual

```bash
# En la raíz del proyecto
npm run dev
```

**✅ Deberías ver:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## 🔍 **PASO 5: VERIFICAR FUNCIONAMIENTO**

### 5.1 Abrir la aplicación
1. Abre tu navegador
2. Ve a: **http://localhost:5173**
3. Deberías ver la pantalla de login de LOGISAMB

### 5.2 Verificar conexión a BD
1. En la aplicación, busca el indicador de "Conexión" (esquina superior derecha)
2. Debería mostrar: **🟢 Conectado a MariaDB**

### 5.3 Probar login
1. Usa las credenciales de un usuario de tu tabla `usuarios`
2. Si funciona, verás el dashboard con datos reales de tu BD

---

## 🛠️ **COMANDOS ÚTILES PARA DESARROLLO**

### Backend (Terminal 1)
```bash
cd backend

# Iniciar en modo desarrollo (reinicia automáticamente)
npm run dev

# Iniciar en modo producción
npm start

# Ver logs de la base de datos
npm run db:test
```

### Frontend (Terminal 2)
```bash
# Modo desarrollo (con hot-reload)
npm run dev

# Compilar para producción
npm run build

# Preview de la build de producción
npm run preview
```

---

## 🚨 **SOLUCIÓN DE PROBLEMAS COMUNES**

### Error: "Cannot connect to database"
```bash
# Verificar que MariaDB esté ejecutándose
# Verificar credenciales en .env
# Verificar que el puerto 3306 esté abierto
```

### Error: "Port 3001 already in use"
```bash
# Matar proceso en puerto 3001
netstat -ano | findstr :3001
taskkill /PID numero_del_proceso /F

# O cambiar puerto en backend/.env
PORT=3002
```

### Error: "CORS policy"
- Verificar que `CORS_ORIGIN` en backend/.env apunte a tu frontend
- Por defecto: `http://localhost:5173`

### El frontend no encuentra el backend
- Verificar que el backend esté corriendo en puerto 3001
- Verificar que `VITE_API_URL` apunte al backend correcto

---

## 📊 **ESTRUCTURA DE DESARROLLO**

```
Terminal 1: Backend (puerto 3001)
Terminal 2: Frontend (puerto 5173)
Navegador: http://localhost:5173
Base de Datos: livesoft.ddns.me:3306
```

---

## ✅ **CHECKLIST FINAL**

- [ ] Node.js instalado
- [ ] Dependencias del backend instaladas
- [ ] Variables de entorno configuradas
- [ ] Conexión a MariaDB exitosa
- [ ] Backend corriendo en puerto 3001
- [ ] Frontend corriendo en puerto 5173
- [ ] Login funcionando con datos reales
- [ ] Dashboard mostrando datos de la BD

---

## 🔄 **WORKFLOW DIARIO**

1. **Abrir VSCode**
2. **Terminal 1:** `cd backend && npm start`
3. **Terminal 2:** `npm run dev`
4. **Navegador:** http://localhost:5173
5. **¡A desarrollar!** 🚀

---

## 📞 **¿NECESITAS AYUDA?**

Si encuentras algún problema:
1. Revisa los logs en ambas terminales
2. Verifica que todas las dependencias estén instaladas
3. Confirma que las variables de entorno sean correctas
4. Asegúrate de que MariaDB esté accesible

**¡Tu aplicación LOGISAMB estará corriendo en local con datos reales de tu MariaDB!** 🎉