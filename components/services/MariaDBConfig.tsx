// Configuración para MariaDB - Datos que usarías en tu conexión real
export interface MariaDBConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  charset: string;
  connectionLimit?: number;
  acquireTimeout?: number;
  timeout?: number;
}

// Configuración por defecto - En producción esto vendría del servidor/variables de entorno
export const defaultMariaDBConfig: MariaDBConfig = {
  host: 'localhost', // Cambia por tu host real
  port: 3306,
  user: 'root', // Tu usuario de MariaDB
  password: '', // Tu contraseña de MariaDB
  database: 'informes_db', // Nombre de tu base de datos
  charset: 'utf8mb4',
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000
};

// SQL Scripts para crear la estructura de tu base de datos
export const createTableSQL = `
-- Tabla principal de informes (basada en tu estructura)
CREATE TABLE IF NOT EXISTS informes_tabla (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fecha DATE NOT NULL,
  clienteId INT NOT NULL,
  servicioId INT NOT NULL,
  nombreCliente VARCHAR(255) NOT NULL,
  nombreServicio VARCHAR(255) NOT NULL,
  frecuencia ENUM('Diaria', 'Semanal', 'Quincenal', 'Mensual') NOT NULL,
  total DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  volRetrirado DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  volLimite DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  valorAdicional DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  montoAdicional DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_cliente (clienteId),
  INDEX idx_servicio (servicioId),
  INDEX idx_fecha (fecha),
  INDEX idx_cliente_fecha (clienteId, fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de empresas (para el sistema multiempresa)
CREATE TABLE IF NOT EXISTS empresas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  direccion TEXT,
  telefono VARCHAR(50),
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  empresaId INT NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  rol ENUM('Administrador', 'Gerente', 'Usuario') NOT NULL DEFAULT 'Usuario',
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (empresaId) REFERENCES empresas(id) ON DELETE CASCADE,
  UNIQUE KEY unique_email (email),
  INDEX idx_empresa (empresaId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de clientes (opcional, si quieres normalizar más)
CREATE TABLE IF NOT EXISTS clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  empresaId INT NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  contacto VARCHAR(255),
  telefono VARCHAR(50),
  email VARCHAR(255),
  direccion TEXT,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (empresaId) REFERENCES empresas(id) ON DELETE CASCADE,
  INDEX idx_empresa (empresaId),
  INDEX idx_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de servicios (opcional, si quieres normalizar más)
CREATE TABLE IF NOT EXISTS servicios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  precio_base DECIMAL(15,2),
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_nombre (nombre),
  INDEX idx_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

// Datos de ejemplo para poblar las tablas
export const sampleDataSQL = `
-- Insertar empresas de ejemplo
INSERT INTO empresas (nombre, direccion, email) VALUES
('Empresa ABC S.A.S.', 'Calle 123 #45-67, Bogotá', 'admin@empresa-abc.com'),
('Corporación XYZ Ltda.', 'Carrera 78 #90-12, Medellín', 'admin@corporacion-xyz.com'),
('Industrias DEF S.A.', 'Avenida 34 #56-78, Cali', 'gerente@industrias-def.com')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

-- Insertar usuarios de ejemplo
INSERT INTO usuarios (empresaId, nombre, email, password_hash, rol) VALUES
(1, 'Juan Pérez', 'admin@empresa-abc.com', '$2b$10$demo.hash.for.demo123', 'Administrador'),
(2, 'María García', 'admin@corporacion-xyz.com', '$2b$10$demo.hash.for.demo123', 'Administrador'),
(3, 'Carlos López', 'gerente@industrias-def.com', '$2b$10$demo.hash.for.demo123', 'Gerente')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

-- Insertar servicios de ejemplo
INSERT INTO servicios (nombre, descripcion, precio_base) VALUES
('Transporte Terrestre', 'Servicio de transporte por carretera', 100000.00),
('Transporte Aéreo', 'Servicio de transporte aéreo', 500000.00),
('Almacenamiento', 'Servicio de almacenamiento y bodegaje', 50000.00),
('Transporte Marítimo', 'Servicio de transporte marítimo', 800000.00),
('Courier Express', 'Servicio de mensajería express', 25000.00)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

-- Insertar clientes de ejemplo
INSERT INTO clientes (empresaId, nombre, contacto, email) VALUES
(1, 'Empresa ABC S.A.S.', 'Juan Pérez', 'contacto@empresa-abc.com'),
(2, 'Corporación XYZ Ltda.', 'María García', 'contacto@corporacion-xyz.com'),
(3, 'Industrias DEF S.A.', 'Carlos López', 'contacto@industrias-def.com'),
(1, 'Logística Global S.A.S.', 'Ana Martínez', 'info@logistica-global.com'),
(2, 'Transportes del Norte Ltda.', 'Pedro Rodríguez', 'ventas@transportes-norte.com'),
(3, 'Almacenes Centrales S.A.', 'Laura Fernández', 'admin@almacenes-centrales.com')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);
`;

// Función helper para generar la configuración completa
export function getMariaDBConnectionString(config: MariaDBConfig): string {
  return `mysql://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}?charset=${config.charset}`;
}

// Función para validar la configuración
export function validateMariaDBConfig(config: Partial<MariaDBConfig>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!config.host) errors.push('Host es requerido');
  if (!config.port || config.port < 1 || config.port > 65535) errors.push('Puerto debe estar entre 1 y 65535');
  if (!config.user) errors.push('Usuario es requerido');
  if (!config.database) errors.push('Nombre de base de datos es requerido');
  
  return {
    valid: errors.length === 0,
    errors
  };
}

export default defaultMariaDBConfig;