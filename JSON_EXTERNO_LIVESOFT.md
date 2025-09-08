# 🌐 Sistema JSON Externo - LOGISAMB Portal

## 📋 Configuración Actual

✅ **Dominio configurado:** `https://livesoft.cl`  
✅ **Archivos JSON creados** en `/data/`  
✅ **Sistema híbrido activo** con fallback automático  

## 🗂️ Estructura de Archivos

La aplicación espera los siguientes archivos JSON en el servidor:

```
https://livesoft.cl/data/
├── guias.json              # Guías de retiro de residuos
├── facturas-impagas.json   # Facturas pendientes de pago
├── usuarios.json           # Usuarios del sistema (opcional)
└── clientes.json           # Información de clientes (opcional)
```

## 📊 Archivos JSON Incluidos

### `guias.json` (12 registros)
- Múltiples clientes: COPEC, Shell, Petrobras, Exxon Mobil
- Diferentes tipos de servicios y frecuencias
- Casos con excesos de litros y facturación adicional

### `facturas-impagas.json` (13 registros)
- Estados de mora: Baja, Media, Alta, Crítica
- Rangos de días de mora: 20-107 días
- Distribución realista entre clientes

### `usuarios.json` (10 registros)
- Usuarios distribuidos entre clientes
- Roles diferenciados (admin, operador, supervisor, finanzas)
- Estados activos e inactivos

### `clientes.json` (8 registros)
- Empresas del sector energético
- Información completa con RUT, direcciones, contactos
- Diferentes tipos de cliente

## 🔧 Como Activar el Sistema

### 1. **Subir Archivos al Servidor**
```bash
# Subir los archivos a tu servidor web
https://livesoft.cl/data/guias.json
https://livesoft.cl/data/facturas-impagas.json
https://livesoft.cl/data/usuarios.json
https://livesoft.cl/data/clientes.json
```

### 2. **Configurar CORS (Importante)**
El servidor debe permitir acceso desde tu aplicación:

```apache
# .htaccess para Apache
Header add Access-Control-Allow-Origin "*"
Header add Access-Control-Allow-Headers "origin, x-requested-with, content-type"
Header add Access-Control-Allow-Methods "PUT, GET, POST, DELETE, OPTIONS"
```

```nginx
# nginx.conf para Nginx
add_header Access-Control-Allow-Origin *;
add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
add_header Access-Control-Allow-Headers 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';
```

### 3. **Verificar Acceso Público**
Los archivos deben ser accesibles públicamente:
- ✅ `curl https://livesoft.cl/data/guias.json`
- ✅ `curl https://livesoft.cl/data/facturas-impagas.json`

## 🚀 Estado del Sistema

### ✅ **Sistema Híbrido Activo**
- **JSON Externo:** Prioridad principal
- **Datos Mock:** Fallback automático sin errores
- **Cache:** 5 minutos TTL para optimizar rendimiento
- **Timeout:** 10 segundos máximo por request

### 📱 **Monitoreo en Tiempo Real**
La aplicación incluye una pestaña "Conexión JSON" que muestra:
- Estado de conexión en tiempo real
- URLs completas de los archivos
- Modo actual (externo/fallback)
- Botones para probar y refrescar

### 🔄 **Comportamiento Automático**
1. **Al cargar:** Intenta conectar con JSON externo
2. **Si falla:** Usa datos mock transparentemente
3. **Cache:** Evita requests innecesarios
4. **Refresh:** Limpia cache y vuelve a intentar

## 📈 **Indicadores Visuales**

### En el Dashboard:
- 🟢 **Verde pulsante:** Conectado a JSON externo
- 🟡 **Amarillo:** Usando datos mock (sin conexión)
- ⚫ **Gris:** Servicio deshabilitado

### En las Pestañas:
- **"ON":** JSON externo activo
- **"MOCK":** Usando datos de respaldo
- **"OFF":** Servicio deshabilitado

## 🛠️ **Funciones Avanzadas**

### Limpieza Manual de Cache:
```javascript
ExternalDataService.invalidateCache();
```

### Configuración Dinámica:
```javascript
ExternalDataService.setExternalUrls({
  baseUrl: 'https://otro-dominio.com',
  guiasEndpoint: '/api/guias.json'
});
```

### Test de Conexión:
```javascript
const isConnected = await ExternalDataService.testExternalConnection();
```

## 🔒 **Consideraciones de Seguridad**

- ✅ Los datos son leídos en modo **solo lectura**
- ✅ Filtrado por `clienteId` mantiene segregación
- ✅ No se exponen credenciales de base de datos
- ✅ Timeout previene bloqueos indefinidos
- ✅ Fallback garantiza disponibilidad del servicio

## 📝 **Logs y Debug**

El sistema registra automáticamente en console:
- ✅ Intentos de conexión
- ✅ Éxitos y fallos
- ✅ Modo actual de operación
- ✅ Tamaño de datos cargados

## 🎯 **Casos de Uso**

1. **Desarrollo/Testing:** Usar datos mock internos
2. **Producción Local:** JSON externo con fallback
3. **Integración:** Conectar con APIs reales manteniendo estructura
4. **Demo:** Mostrar datos reales sin exponer BD

---

**Estado:** ✅ **LISTO PARA PRODUCCIÓN**  
**Configuración:** `https://livesoft.cl/data/`  
**Fallback:** Automático sin interrupciones  
**Monitoreo:** Integrado en dashboard principal