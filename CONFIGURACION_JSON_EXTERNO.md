# 🌐 Configuración de JSON Externo para LOGISAMB Portal

## ✅ **IMPLEMENTACIÓN COMPLETADA**

Tu aplicación LOGISAMB ahora puede leer datos de guías y facturas desde archivos JSON alojados en otro dominio, manteniendo toda la funcionalidad existente.

---

## 🔧 **CÓMO FUNCIONA**

### **1. Prioridad de Fuentes de Datos**
```
1. 🌐 JSON Externo (primera opción)
2. 📡 API MariaDB (segunda opción)  
3. 🎭 Datos Mock (fallback)
```

### **2. Nuevo Servicio: ExternalDataService**
- **Archivo:** `/components/services/ExternalDataService.tsx`
- **Función:** Leer datos desde archivos JSON externos
- **Cache:** 5 minutos para optimizar performance
- **CORS:** Configurado para cross-domain requests

### **3. Servicios Actualizados**
- **ResidueService:** Modificado para usar ExternalDataService primero
- **ConnectionStatus:** Muestra estado del JSON externo
- **Fallback automático:** Si JSON falla, usa API/Mock

---

## ⚙️ **CONFIGURACIÓN DE URLs**

### **Estado Actual: DESHABILITADO**
```javascript
// En /components/services/ExternalDataService.tsx
private static readonly EXTERNAL_CONFIG = {
  baseUrl: '',  // ← VACÍO = DESHABILITADO
  guiasEndpoint: '/data/guias.json',
  facturasEndpoint: '/data/facturas-impagas.json',
  clientesEndpoint: '/data/clientes.json',
  usuariosEndpoint: '/data/usuarios.json'
};
```

### **Para Habilitar (CAMBIAR ESTAS URLs)**
```javascript
// Cambiar baseUrl por tu dominio real:
private static readonly EXTERNAL_CONFIG = {
  baseUrl: 'https://tu-dominio-real.com',  // ← PONER TU DOMINIO AQUÍ
  guiasEndpoint: '/data/guias.json',
  facturasEndpoint: '/data/facturas-impagas.json',
  clientesEndpoint: '/data/clientes.json',
  usuariosEndpoint: '/data/usuarios.json'
};
```

### **URLs Completas que Necesitas Configurar**
```
https://tu-dominio.com/data/guias.json
https://tu-dominio.com/data/facturas-impagas.json
https://tu-dominio.com/data/clientes.json (opcional)
https://tu-dominio.com/data/usuarios.json (opcional)
```

---

## 📄 **ESTRUCTURA DE ARCHIVOS JSON REQUERIDOS**

### **1. guias.json**
```json
[
  {
    "id": 1,
    "guia": "112",
    "fecha": "2025-07-01",
    "clienteId": 57,
    "sucursal": "COPEC PEDRO DE VALDIVIA",
    "servicio": "RESIDUOS SOLIDOS POR RETIRO",
    "frecuencia": "MENSUAL",
    "lts_limite": 3300,
    "lts_retirados": 3000,
    "valor_servicio": 88299,
    "valor_lt_adic": 0,
    "patente": "ABC-123",
    "total": 88299,
    "observaciones": "Retiro estación Pedro de Valdivia"
  }
]
```

### **2. facturas-impagas.json**
```json
[
  {
    "id": 1,
    "fecha": "2025-06-15",
    "empresa": "COPEC",
    "sucursal": "COPEC PEDRO DE VALDIVIA",
    "rut": "99.500.000-1",
    "no_guia": "90002",
    "dias_mora": 45,
    "nro_factura": "7658",
    "fecha_factura": "2025-06-15",
    "clienteId": 57,
    "monto_factura": 88299,
    "estado_mora": "Alta",
    "observaciones": "Cliente no responde"
  }
]
```

### **3. Propiedades Obligatorias**
**Guías:**
- `id` (number)
- `guia` (string)
- `fecha` (string, formato YYYY-MM-DD)
- `clienteId` (number)
- `sucursal` (string)
- `servicio` (string)
- `frecuencia` (string)
- `lts_limite` (number)
- `lts_retirados` (number)
- `total` (number)

**Facturas:**
- `id` (number)
- `nro_factura` (string)
- `fecha` (string, formato YYYY-MM-DD)
- `clienteId` (number)
- `monto_factura` (number)
- `estado_mora` (string: 'Baja'|'Media'|'Alta'|'Crítica')
- `dias_mora` (number)

---

## 🔄 **CONFIGURACIÓN DINÁMICA**

### **Cambiar URLs en Runtime**
```javascript
// En la consola del navegador o en el código
import { ExternalDataService } from './components/services/ExternalDataService';

ExternalDataService.setExternalUrls({
  baseUrl: 'https://tu-nuevo-dominio.com',
  guiasEndpoint: '/api/guias.json',
  facturasEndpoint: '/api/facturas.json'
});
```

### **Limpiar Cache**
```javascript
ExternalDataService.invalidateCache();
```

### **Verificar Estado**
```javascript
const info = ExternalDataService.getConnectionInfo();
console.log(info);
```

---

## 🌐 **CONFIGURACIÓN CORS DEL SERVIDOR**

### **Servidor que aloja los JSON debe permitir CORS:**
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Content-Type, Accept
```

### **Headers HTTP recomendados:**
```
Content-Type: application/json
Cache-Control: public, max-age=300  (5 minutos)
```

---

## 🔍 **VERIFICACIÓN DE FUNCIONAMIENTO**

### **1. Indicador Visual**
En la esquina inferior derecha:
- **🌐 JSON Externo** = Usando archivos JSON
- **🟢 MariaDB** = Usando base de datos
- **🔄 Fallback Local** = Usando datos mock

### **2. Console del Navegador**
```
🌐 Fetching external data from: https://tu-dominio.com/data/guias.json
✅ Successfully loaded external data from: https://tu-dominio.com/data/guias.json
🌐 Using external JSON data source for guías
```

### **3. Logs de Errores**
```
⚠️ Failed to load external data from https://tu-dominio.com/data/guias.json: 404
🔄 Falling back to mock data for guías
```

---

## ✅ **VENTAJAS DE ESTA IMPLEMENTACIÓN**

### **🔧 Flexibilidad**
- Cambio de fuente de datos sin código
- URLs configurables dinámicamente
- Fallback automático si falla

### **⚡ Performance** 
- Cache de 5 minutos
- Una sola request por archivo
- Filtros en memoria (rápido)

### **🔒 Seguridad**
- Validación de estructura JSON
- Filtros por clienteId mantenidos
- No exposición de datos sensibles

### **🚀 Compatibilidad**
- Funciona con tu app actual
- Sin cambios en UI
- Mantiene toda la funcionalidad

---

## 📋 **CHECKLIST DE IMPLEMENTACIÓN**

### **Paso 1: Preparar Archivos JSON**
- [ ] Crear `guias.json` con tus datos
- [ ] Crear `facturas-impagas.json` con tus datos
- [ ] Validar estructura JSON
- [ ] Subir archivos a tu dominio

### **Paso 2: Configurar CORS**
- [ ] Permitir CORS desde tu app
- [ ] Headers apropiados configurados
- [ ] Probar acceso desde navegador

### **Paso 3: Habilitar Servicio**
- [ ] **CAMBIAR** `baseUrl: ''` por `baseUrl: 'https://tu-dominio.com'`
- [ ] Guardar ExternalDataService.tsx
- [ ] Recargar aplicación

### **Paso 4: Verificar Funcionamiento**
- [ ] Ver "JSON Externo" en ConnectionStatus
- [ ] Login exitoso
- [ ] Guías se cargan desde JSON
- [ ] Facturas se cargan desde JSON
- [ ] Fallback funciona si JSON falla

### **Estado Actual**
- [x] ✅ **Servicio deshabilitado** - No hay errores
- [x] ✅ **Fallback funcionando** - Usa datos mock
- [ ] ⚙️ **Pendiente**: Configurar tu dominio real

---

## 🚨 **TROUBLESHOOTING**

### **JSON no se carga**
1. Verificar CORS en servidor
2. Comprobar URLs son correctas
3. Validar estructura JSON
4. Revisar console del navegador

### **Datos no aparecen**
1. Verificar `clienteId` en JSON coincide
2. Comprobar estructura de propiedades
3. Revisar filtros aplicados

### **Performance lenta**
1. Verificar tamaño de archivos JSON
2. Configurar cache HTTP apropiado
3. Considerar CDN para archivos

---

## 🎯 **EJEMPLOS DE USO**

### **Caso 1: Servidor Static**
```
https://mi-cdn.com/logisamb-data/guias.json
https://mi-cdn.com/logisamb-data/facturas.json
```

### **Caso 2: API Gateway**
```
https://api.mi-empresa.com/v1/logisamb/guias
https://api.mi-empresa.com/v1/logisamb/facturas
```

### **Caso 3: GitHub Pages**
```
https://usuario.github.io/logisamb-data/guias.json
https://usuario.github.io/logisamb-data/facturas.json
```

**¡Tu aplicación LOGISAMB ahora puede leer datos desde cualquier dominio externo!** 🚀