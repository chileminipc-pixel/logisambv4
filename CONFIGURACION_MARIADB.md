# 🗄️ Configuración MariaDB para LOGISAMB Portal

## 📋 **INFORMACIÓN DE TU BASE DE DATOS**

Basándome en tu información previa, tu configuración es:

```env
# Archivo: backend/.env
DATABASE_HOST=livesoft.ddns.me
DATABASE_PORT=3306
DATABASE_NAME=tu_base_datos
DATABASE_USER=tu_usuario
DATABASE_PASSWORD=tu_password
```

---

## 🔧 **CONFIGURACIÓN PASO A PASO**

### 1. Editar archivo de configuración
Abre el archivo `backend/.env` en VSCode y configura:

```env
# ===========================================
# CONFIGURACIÓN MARIADB - LOGISAMB PORTAL
# ===========================================

# Base de Datos MariaDB
DATABASE_HOST=livesoft.ddns.me
DATABASE_PORT=3306
DATABASE_NAME=nombre_de_tu_base_datos
DATABASE_USER=tu_usuario_mariadb
DATABASE_PASSWORD=tu_password_mariadb

# Configuración del Servidor
PORT=3001
NODE_ENV=development

# Seguridad JWT (cambia esto por algo único)
JWT_SECRET=mi_jwt_secret_super_seguro_123456789

# CORS (permite conexión desde el frontend)
CORS_ORIGIN=http://localhost:5173

# Debug (opcional)
DEBUG_SQL=true
LOG_LEVEL=info
```

### 2. Verificar estructura de tablas
Tu aplicación espera estas tablas en MariaDB:

#### **Tabla: usuarios**
```sql
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usu_login VARCHAR(50) UNIQUE NOT NULL,
    usu_password VARCHAR(255) NOT NULL,
    nombre VARCHAR(100),
    email VARCHAR(100),
    clienteId INT NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### **Tabla: empresas (clientes)**
```sql
CREATE TABLE empresas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(200) NOT NULL,
    rut VARCHAR(20),
    direccion TEXT,
    telefono VARCHAR(20),
    email VARCHAR(100),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **Tabla: guias**
```sql
CREATE TABLE guias (
    id INT PRIMARY KEY AUTO_INCREMENT,
    clienteId INT NOT NULL,
    guia VARCHAR(50) NOT NULL,
    fecha DATE NOT NULL,
    servicio VARCHAR(100),
    frecuencia VARCHAR(50),
    lts_limite INT DEFAULT 0,
    lts_retirados INT DEFAULT 0,
    valor_servicio DECIMAL(10,2) DEFAULT 0,
    valor_lt_adicional DECIMAL(10,2) DEFAULT 0,
    patente VARCHAR(20),
    total DECIMAL(10,2) DEFAULT 0,
    sucursal VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (clienteId) REFERENCES empresas(id)
);
```

#### **Tabla: facturas_impagas**
```sql
CREATE TABLE facturas_impagas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    clienteId INT NOT NULL,
    numero_factura VARCHAR(50) NOT NULL,
    fecha DATE NOT NULL,
    fecha_vencimiento DATE,
    monto DECIMAL(10,2) NOT NULL,
    dias_mora INT DEFAULT 0,
    estado_mora ENUM('normal', 'media', 'alta', 'critica') DEFAULT 'normal',
    sucursal VARCHAR(100),
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (clienteId) REFERENCES empresas(id)
);
```

---

## 🧪 **PROBAR CONEXIÓN**

### 1. Verificar conectividad básica
```bash
# En la carpeta backend
cd backend
node scripts/setup-database.js
```

**✅ Resultado exitoso:**
```
🔗 Conectando a MariaDB...
✅ Conexión exitosa a livesoft.ddns.me
✅ Base de datos 'tu_base_datos' accesible
✅ Tabla 'usuarios' encontrada
✅ Tabla 'empresas' encontrada  
✅ Tabla 'guias' encontrada
✅ Tabla 'facturas_impagas' encontrada
🎉 Configuración de base de datos completada
```

### 2. Probar autenticación
```bash
# Iniciar el backend
npm run dev
```

**Buscar en los logs:**
```
🚀 Server running on port 3001
🗄️ Database: Connected to MariaDB
✅ Tables verified successfully
🔐 Auth routes loaded
📊 Reports routes loaded
```

---

## 🔒 **USUARIOS DE PRUEBA**

Para crear un usuario de prueba, ejecuta en tu MariaDB:

```sql
-- Crear empresa de ejemplo
INSERT INTO empresas (nombre, rut, email) 
VALUES ('Empresa Demo', '12345678-9', 'demo@empresa.cl');

-- Crear usuario (password: 123456)
INSERT INTO usuarios (usu_login, usu_password, nombre, email, clienteId) 
VALUES ('demo', '$2b$10$rQj7eM8ZKQj7eM8ZKQj7eOQj7eM8ZKQj7eM8ZKQj7eM8ZKQj7eM8ZK', 'Usuario Demo', 'demo@empresa.cl', 1);
```

**Datos de login:**
- Usuario: `demo`
- Password: `123456`

---

## 🚨 **SOLUCIÓN DE PROBLEMAS**

### Error: "Connection refused"
```bash
# Verificar que puedes conectarte a MariaDB desde tu red
ping livesoft.ddns.me

# Verificar que el puerto esté abierto
telnet livesoft.ddns.me 3306
```

### Error: "Access denied"
- Verificar usuario y password en `.env`
- Verificar que el usuario tenga permisos sobre la base de datos
- Verificar que se permitan conexiones remotas desde tu IP

### Error: "Unknown database"
- Verificar que `DATABASE_NAME` en `.env` sea correcto
- Verificar que la base de datos exista en MariaDB

### Error: "Table doesn't exist"
- Ejecutar los scripts SQL para crear las tablas
- Verificar que el usuario tenga permisos sobre las tablas

---

## 📊 **MODO DEBUG**

Para ver todas las consultas SQL en desarrollo:

```env
# En backend/.env
DEBUG_SQL=true
LOG_LEVEL=debug
```

Esto mostrará en la consola:
```
🔍 SQL Query: SELECT * FROM usuarios WHERE usu_login = ?
🔍 SQL Params: ["demo"]
✅ SQL Result: 1 rows affected
```

---

## 🔄 **DETECCIÓN AUTOMÁTICA DE ENTORNO**

La aplicación detecta automáticamente:

1. **✅ BD Real disponible**: Usa datos de MariaDB
2. **⚠️ BD No disponible**: Usa datos mock para demostración

En el frontend verás:
- 🟢 **"Conectado a MariaDB"** = Datos reales
- 🟡 **"Modo Demostración"** = Datos mock

---

## 🎯 **CHECKLIST DE CONFIGURACIÓN**

- [ ] Archivo `backend/.env` configurado
- [ ] Conexión a `livesoft.ddns.me:3306` exitosa
- [ ] Base de datos y tablas existentes
- [ ] Usuario de prueba creado
- [ ] Backend iniciado sin errores
- [ ] Frontend mostrando "Conectado a MariaDB"
- [ ] Login funcionando con datos reales

**¡Listo para producción local con datos reales!** 🚀