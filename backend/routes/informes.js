const express = require('express');
const { executeQuery } = require('../config/database');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Helper function to format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Helper function to calculate estado_mora from dias_mora
function getEstadoMora(diasMora) {
  if (diasMora >= 90) return 'Crítica';
  if (diasMora >= 60) return 'Alta';
  if (diasMora >= 30) return 'Media';
  return 'Baja';
}

// GET /api/informes/guias
router.get('/guias', authenticateToken, async (req, res) => {
  try {
    const clienteId = req.user.clienteId;
    const { fechaInicio, fechaFin, servicio, frecuencia, sucursal } = req.query;

    console.log(`🗑️ Loading guías for cliente ${clienteId}...`);

    let whereConditions = ['clienteId = ?'];
    let queryParams = [clienteId];

    // Apply filters
    if (fechaInicio) {
      whereConditions.push('fecha >= ?');
      queryParams.push(fechaInicio);
    }

    if (fechaFin) {
      whereConditions.push('fecha <= ?');
      queryParams.push(fechaFin);
    }

    if (servicio) {
      whereConditions.push('servicio = ?');
      queryParams.push(servicio);
    }

    if (frecuencia) {
      whereConditions.push('frecuencia = ?');
      queryParams.push(frecuencia);
    }

    if (sucursal) {
      whereConditions.push('sucursal = ?');
      queryParams.push(sucursal);
    }

    const sql = `
      SELECT id, guia, fecha, clienteId, sucursal, servicio, frecuencia,
             lts_limite, lts_retirados, valor_servicio, valor_lt_adic,
             patente, total, observaciones, created_at, updated_at
      FROM guias
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY fecha DESC, id DESC
    `;

    const guias = await executeQuery(sql, queryParams);

    console.log(`✅ Loaded ${guias.length} guías for cliente ${clienteId}`);

    res.json({
      success: true,
      data: guias,
      total: guias.length
    });

  } catch (error) {
    console.error('Error loading guías:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error al cargar las guías'
    });
  }
});

// GET /api/informes/guias/stats
router.get('/guias/stats', authenticateToken, async (req, res) => {
  try {
    const clienteId = req.user.clienteId;

    console.log(`📊 Calculating stats for cliente ${clienteId}...`);

    // Get all guías for the client
    const guias = await executeQuery(`
      SELECT * FROM guias WHERE clienteId = ?
    `, [clienteId]);

    // Get facturas impagas for the client
    const facturas = await executeQuery(`
      SELECT * FROM facturas_impagas WHERE clienteId = ?
    `, [clienteId]);

    // Basic calculations
    const totalGuias = guias.length;
    const litrosRetirados = guias.reduce((sum, g) => sum + g.lts_retirados, 0);
    const valorTotal = guias.reduce((sum, g) => sum + g.total, 0);
    const promedioLitrosPorGuia = totalGuias > 0 ? litrosRetirados / totalGuias : 0;

    // Calculate efficiency
    const totalLimite = guias.reduce((sum, g) => sum + g.lts_limite, 0);
    const eficienciaRetiro = totalLimite > 0 ? (litrosRetirados / totalLimite) * 100 : 100;

    // Group by servicio
    const serviciosCount = {};
    guias.forEach(g => {
      if (!serviciosCount[g.servicio]) {
        serviciosCount[g.servicio] = { cantidad: 0, litros: 0 };
      }
      serviciosCount[g.servicio].cantidad += 1;
      serviciosCount[g.servicio].litros += g.lts_retirados;
    });

    const guiasPorServicio = Object.entries(serviciosCount)
      .map(([servicio, data]) => ({ servicio, cantidad: data.cantidad, litros: data.litros }))
      .sort((a, b) => b.cantidad - a.cantidad);

    // Group by sucursal
    const sucursalesCount = {};
    guias.forEach(g => {
      if (!sucursalesCount[g.sucursal]) {
        sucursalesCount[g.sucursal] = { cantidad: 0, litros: 0, valor: 0 };
      }
      sucursalesCount[g.sucursal].cantidad += 1;
      sucursalesCount[g.sucursal].litros += g.lts_retirados;
      sucursalesCount[g.sucursal].valor += g.total;
    });

    const guiasPorSucursal = Object.entries(sucursalesCount)
      .map(([sucursal, data]) => ({ sucursal, cantidad: data.cantidad, litros: data.litros, valor: data.valor }))
      .sort((a, b) => b.valor - a.valor);

    // Group by frecuencia
    const frecuenciaCount = {};
    guias.forEach(g => {
      frecuenciaCount[g.frecuencia] = (frecuenciaCount[g.frecuencia] || 0) + 1;
    });

    const guiasPorFrecuencia = Object.entries(frecuenciaCount)
      .map(([frecuencia, cantidad]) => ({ frecuencia, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);

    // Monthly trend (last 2 months)
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const lastMonth = new Date(currentYear, currentMonth - 1);
    const currentMonthStart = new Date(currentYear, currentMonth, 1);

    const lastMonthGuias = guias.filter(g => {
      const guiaDate = new Date(g.fecha);
      return guiaDate >= lastMonth && guiaDate < currentMonthStart;
    });

    const currentMonthGuias = guias.filter(g => {
      const guiaDate = new Date(g.fecha);
      return guiaDate >= currentMonthStart;
    });

    const tendenciaMensual = [
      {
        mes: lastMonth.toLocaleDateString('es-CL', { month: 'short' }),
        cantidad: lastMonthGuias.length,
        litros: lastMonthGuias.reduce((sum, g) => sum + g.lts_retirados, 0),
        valor: lastMonthGuias.reduce((sum, g) => sum + g.total, 0)
      },
      {
        mes: now.toLocaleDateString('es-CL', { month: 'short' }),
        cantidad: currentMonthGuias.length,
        litros: currentMonthGuias.reduce((sum, g) => sum + g.lts_retirados, 0),
        valor: currentMonthGuias.reduce((sum, g) => sum + g.total, 0)
      }
    ];

    // Facturas impagas stats
    const totalFacturasImpagas = facturas.length;
    const montoTotalImpago = facturas.reduce((sum, f) => sum + f.monto_factura, 0);
    const promedioMoraCliente = facturas.length > 0 
      ? facturas.reduce((sum, f) => sum + f.dias_mora, 0) / facturas.length 
      : 0;

    const facturasVencidas = {
      criticas: facturas.filter(f => f.estado_mora === 'Crítica').length,
      altas: facturas.filter(f => f.estado_mora === 'Alta').length,
      medias: facturas.filter(f => f.estado_mora === 'Media').length,
      bajas: facturas.filter(f => f.estado_mora === 'Baja').length
    };

    const stats = {
      totalGuias,
      litrosRetirados,
      valorTotal,
      promedioLitrosPorGuia,
      guiasPorServicio,
      guiasPorSucursal,
      guiasPorFrecuencia,
      tendenciaMensual,
      eficienciaRetiro,
      totalFacturasImpagas,
      montoTotalImpago,
      promedioMoraCliente,
      facturasVencidas
    };

    console.log(`✅ Stats calculated for cliente ${clienteId}:`, {
      totalGuias: stats.totalGuias,
      litrosRetirados: stats.litrosRetirados,
      valorTotal: stats.valorTotal,
      sucursales: stats.guiasPorSucursal.length,
      facturasImpagas: stats.totalFacturasImpagas
    });

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error calculating stats:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error al calcular estadísticas'
    });
  }
});

// GET /api/informes/facturas-impagas
router.get('/facturas-impagas', authenticateToken, async (req, res) => {
  try {
    const clienteId = req.user.clienteId;
    const { fechaInicio, fechaFin, sucursal, estadoMora, diasMoraMin, diasMoraMax } = req.query;

    console.log(`💳 Loading facturas impagas for cliente ${clienteId}...`);

    let whereConditions = ['clienteId = ?'];
    let queryParams = [clienteId];

    // Apply filters
    if (fechaInicio) {
      whereConditions.push('fecha >= ?');
      queryParams.push(fechaInicio);
    }

    if (fechaFin) {
      whereConditions.push('fecha <= ?');
      queryParams.push(fechaFin);
    }

    if (sucursal) {
      whereConditions.push('sucursal = ?');
      queryParams.push(sucursal);
    }

    if (estadoMora) {
      whereConditions.push('estado_mora = ?');
      queryParams.push(estadoMora);
    }

    if (diasMoraMin) {
      whereConditions.push('dias_mora >= ?');
      queryParams.push(parseInt(diasMoraMin));
    }

    if (diasMoraMax) {
      whereConditions.push('dias_mora <= ?');
      queryParams.push(parseInt(diasMoraMax));
    }

    const sql = `
      SELECT id, fecha, empresa, sucursal, rut, no_guia, dias_mora,
             nro_factura, fecha_factura, clienteId, monto_factura,
             estado_mora, observaciones, created_at, updated_at
      FROM facturas_impagas
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY dias_mora DESC, fecha_factura ASC
    `;

    const facturas = await executeQuery(sql, queryParams);

    console.log(`✅ Loaded ${facturas.length} facturas impagas for cliente ${clienteId}`);

    res.json({
      success: true,
      data: facturas,
      total: facturas.length
    });

  } catch (error) {
    console.error('Error loading facturas impagas:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error al cargar las facturas impagas'
    });
  }
});

// GET /api/informes/clientes (for admin use)
router.get('/clientes', authenticateToken, async (req, res) => {
  try {
    const clientes = await executeQuery(`
      SELECT id, nombre, rut, direccion, telefono, email, tipo_cliente, activo
      FROM empresas
      WHERE activo = 'SI'
      ORDER BY nombre
    `);

    res.json({
      success: true,
      data: clientes
    });

  } catch (error) {
    console.error('Error loading clientes:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error al cargar clientes'
    });
  }
});

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    // Test database connection
    const result = await executeQuery('SELECT 1 as test, NOW() as timestamp');
    
    res.json({
      success: true,
      status: 'healthy',
      database: 'connected',
      timestamp: result[0].timestamp,
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message
    });
  }
});

module.exports = router;