const { executeQuery, testConnection, closePool } = require('../config/database');

// SQL para crear las tablas necesarias
const createTablesSQL = {
  usuarios: `
    CREATE TABLE IF NOT EXISTS usuarios (
      id INT AUTO_INCREMENT PRIMARY KEY,
      usu_login VARCHAR(100) NOT NULL UNIQUE,
      usu_pwd VARCHAR(255) NOT NULL,
      usu_activo ENUM('SI', 'NO') DEFAULT 'SI',
      clienteId INT NOT NULL,
      nombre VARCHAR(255),
      email VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_cliente (clienteId),
      INDEX idx_login (usu_login),
      INDEX idx_activo (usu_activo)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `,
  
  empresas: `
    CREATE TABLE IF NOT EXISTS empresas (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL,
      rut VARCHAR(20),
      direccion TEXT,
      telefono VARCHAR(50),
      email VARCHAR(255),
      tipo_cliente VARCHAR(100),
      activo ENUM('SI', 'NO') DEFAULT 'SI',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_nombre (nombre),
      INDEX idx_rut (rut),
      INDEX idx_activo (activo)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `,
  
  guias: `
    CREATE TABLE IF NOT EXISTS guias (
      id INT AUTO_INCREMENT PRIMARY KEY,
      guia VARCHAR(50) NOT NULL,
      fecha DATE NOT NULL,
      clienteId INT NOT NULL,
      sucursal VARCHAR(255) NOT NULL,
      servicio VARCHAR(255) NOT NULL,
      frecuencia VARCHAR(100) NOT NULL,
      lts_limite INT DEFAULT 0,
      lts_retirados INT NOT NULL,
      valor_servicio DECIMAL(12,2) NOT NULL,
      valor_lt_adic DECIMAL(12,2) DEFAULT 0,
      patente VARCHAR(20),
      total DECIMAL(12,2) NOT NULL,
      observaciones TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_cliente (clienteId),
      INDEX idx_fecha (fecha),
      INDEX idx_guia (guia),
      INDEX idx_sucursal (sucursal),
      INDEX idx_servicio (servicio),
      FOREIGN KEY (clienteId) REFERENCES empresas(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `,
  
  facturas_impagas: `
    CREATE TABLE IF NOT EXISTS facturas_impagas (
      id INT AUTO_INCREMENT PRIMARY KEY,
      fecha DATE NOT NULL,
      empresa VARCHAR(255) NOT NULL,
      sucursal VARCHAR(255) NOT NULL,
      rut VARCHAR(20) NOT NULL,
      no_guia VARCHAR(50) NOT NULL,
      dias_mora INT NOT NULL,
      nro_factura VARCHAR(50) NOT NULL,
      fecha_factura DATE NOT NULL,
      clienteId INT NOT NULL,
      monto_factura DECIMAL(12,2) NOT NULL,
      estado_mora ENUM('Baja', 'Media', 'Alta', 'Crítica') NOT NULL,
      observaciones TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_cliente (clienteId),
      INDEX idx_fecha (fecha),
      INDEX idx_factura (nro_factura),
      INDEX idx_mora (dias_mora),
      INDEX idx_estado (estado_mora),
      INDEX idx_sucursal (sucursal),
      FOREIGN KEY (clienteId) REFERENCES empresas(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `
};

// Datos iniciales de empresas
const initialCompanies = [
  {
    id: 57,
    nombre: 'COPEC',
    rut: '99.500.000-1',
    direccion: 'Av. El Golf 150, Las Condes',
    telefono: '+56 2 2461 7000',
    email: 'contacto@copec.cl',
    tipo_cliente: 'Estaciones de Servicio'
  },
  {
    id: 58,
    nombre: 'SHELL',
    rut: '96.800.570-7',
    direccion: 'Av. Apoquindo 3721, Las Condes',
    telefono: '+56 2 2750 3000',
    email: 'info@shell.cl',
    tipo_cliente: 'Estaciones de Servicio'
  },
  {
    id: 59,
    nombre: 'PETROBRAS',
    rut: '96.511.310-2',
    direccion: 'Av. Vitacura 2939, Las Condes',
    telefono: '+56 2 2422 5000',
    email: 'chile@petrobras.com',
    tipo_cliente: 'Estaciones de Servicio'
  }
];

// Usuarios iniciales
const initialUsers = [
  {
    id: 1,
    usu_login: 'admin@copec.cl',
    usu_pwd: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // demo123 hashed
    usu_activo: 'SI',
    clienteId: 57,
    nombre: 'Administrador COPEC',
    email: 'admin@copec.cl'
  },
  {
    id: 2,
    usu_login: 'operador@shell.cl',
    usu_pwd: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // demo123 hashed
    usu_activo: 'SI',
    clienteId: 58,
    nombre: 'Operador SHELL',
    email: 'operador@shell.cl'
  },
  {
    id: 3,
    usu_login: 'supervisor@petrobras.cl',
    usu_pwd: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // demo123 hashed
    usu_activo: 'SI',
    clienteId: 59,
    nombre: 'Supervisor PETROBRAS',
    email: 'supervisor@petrobras.cl'
  }
];

async function setupDatabase() {
  console.log('🚀 Starting database setup...');
  
  try {
    // Test connection first
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Cannot connect to database');
    }
    
    console.log('📋 Creating tables...');
    
    // Create tables in order (empresas first because of foreign keys)
    await executeQuery(createTablesSQL.empresas);
    console.log('✅ Table "empresas" created/verified');
    
    await executeQuery(createTablesSQL.usuarios);
    console.log('✅ Table "usuarios" created/verified');
    
    await executeQuery(createTablesSQL.guias);
    console.log('✅ Table "guias" created/verified');
    
    await executeQuery(createTablesSQL.facturas_impagas);
    console.log('✅ Table "facturas_impagas" created/verified');
    
    console.log('📊 Inserting initial data...');
    
    // Insert companies (with specific IDs)
    for (const company of initialCompanies) {
      try {
        await executeQuery(`
          INSERT INTO empresas (id, nombre, rut, direccion, telefono, email, tipo_cliente)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
          nombre = VALUES(nombre),
          rut = VALUES(rut),
          direccion = VALUES(direccion),
          telefono = VALUES(telefono),
          email = VALUES(email),
          tipo_cliente = VALUES(tipo_cliente)
        `, [company.id, company.nombre, company.rut, company.direccion, 
            company.telefono, company.email, company.tipo_cliente]);
        console.log(`✅ Company "${company.nombre}" inserted/updated`);
      } catch (error) {
        console.warn(`⚠️ Error inserting company ${company.nombre}:`, error.message);
      }
    }
    
    // Insert users
    for (const user of initialUsers) {
      try {
        await executeQuery(`
          INSERT INTO usuarios (id, usu_login, usu_pwd, usu_activo, clienteId, nombre, email)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
          usu_pwd = VALUES(usu_pwd),
          usu_activo = VALUES(usu_activo),
          clienteId = VALUES(clienteId),
          nombre = VALUES(nombre),
          email = VALUES(email)
        `, [user.id, user.usu_login, user.usu_pwd, user.usu_activo, 
            user.clienteId, user.nombre, user.email]);
        console.log(`✅ User "${user.usu_login}" inserted/updated`);
      } catch (error) {
        console.warn(`⚠️ Error inserting user ${user.usu_login}:`, error.message);
      }
    }
    
    console.log('🎉 Database setup completed successfully!');
    
    // Show summary
    const companiesCount = await executeQuery('SELECT COUNT(*) as count FROM empresas');
    const usersCount = await executeQuery('SELECT COUNT(*) as count FROM usuarios');
    const guiasCount = await executeQuery('SELECT COUNT(*) as count FROM guias');
    const facturasCount = await executeQuery('SELECT COUNT(*) as count FROM facturas_impagas');
    
    console.log('\n📊 Database Summary:');
    console.log(`   Companies: ${companiesCount[0].count}`);
    console.log(`   Users: ${usersCount[0].count}`);
    console.log(`   Guías: ${guiasCount[0].count}`);
    console.log(`   Facturas Impagas: ${facturasCount[0].count}`);
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    throw error;
  }
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log('\n✅ Setup completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Setup failed:', error.message);
      process.exit(1);
    })
    .finally(() => {
      closePool();
    });
}

module.exports = { setupDatabase };