const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { executeQuery } = require('../config/database');

const router = express.Router();

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'logisamb-secret-key-2025';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Token de acceso requerido' 
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        error: 'Token inválido o expirado' 
      });
    }
    req.user = user;
    next();
  });
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { usu_login, usu_pwd } = req.body;

    if (!usu_login || !usu_pwd) {
      return res.status(400).json({
        success: false,
        error: 'Usuario y contraseña son requeridos'
      });
    }

    console.log(`🔐 Login attempt for: ${usu_login}`);

    // Get user from database
    const users = await executeQuery(`
      SELECT u.*, e.nombre as empresa_nombre, e.rut as empresa_rut,
             e.direccion as empresa_direccion, e.telefono as empresa_telefono,
             e.email as empresa_email, e.tipo_cliente
      FROM usuarios u
      INNER JOIN empresas e ON u.clienteId = e.id
      WHERE u.usu_login = ? AND u.usu_activo = 'SI'
    `, [usu_login]);

    if (users.length === 0) {
      console.log(`❌ User not found or inactive: ${usu_login}`);
      return res.status(401).json({
        success: false,
        error: 'Credenciales incorrectas o usuario inactivo'
      });
    }

    const user = users[0];

    // Verify password
    const passwordMatch = await bcrypt.compare(usu_pwd, user.usu_pwd);
    if (!passwordMatch) {
      console.log(`❌ Invalid password for user: ${usu_login}`);
      return res.status(401).json({
        success: false,
        error: 'Credenciales incorrectas'
      });
    }

    // Generate JWT token
    const tokenPayload = {
      id: user.id,
      login: user.usu_login,
      clienteId: user.clienteId,
      nombre: user.nombre
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { 
      expiresIn: JWT_EXPIRES_IN 
    });

    // Prepare response data
    const userData = {
      id: user.id,
      usu_login: user.usu_login,
      usu_activo: user.usu_activo,
      clienteId: user.clienteId,
      nombre: user.nombre,
      email: user.email
    };

    const clienteData = {
      id: user.clienteId,
      nombre: user.empresa_nombre,
      rut: user.empresa_rut,
      direccion: user.empresa_direccion,
      telefono: user.empresa_telefono,
      email: user.empresa_email,
      tipo_cliente: user.tipo_cliente
    };

    console.log(`✅ Login successful for: ${usu_login} -> ${clienteData.nombre}`);

    res.json({
      success: true,
      data: {
        usuario: userData,
        cliente: clienteData,
        token: token
      }
    });

  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// POST /api/auth/logout
router.post('/logout', authenticateToken, (req, res) => {
  // With JWT, logout is handled client-side by removing the token
  // We could implement a token blacklist here if needed
  res.json({
    success: true,
    message: 'Logout exitoso'
  });
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const users = await executeQuery(`
      SELECT u.*, e.nombre as empresa_nombre, e.rut as empresa_rut,
             e.direccion as empresa_direccion, e.telefono as empresa_telefono,
             e.email as empresa_email, e.tipo_cliente
      FROM usuarios u
      INNER JOIN empresas e ON u.clienteId = e.id
      WHERE u.id = ? AND u.usu_activo = 'SI'
    `, [userId]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado o inactivo'
      });
    }

    const user = users[0];

    const userData = {
      id: user.id,
      usu_login: user.usu_login,
      usu_activo: user.usu_activo,
      clienteId: user.clienteId,
      nombre: user.nombre,
      email: user.email
    };

    const clienteData = {
      id: user.clienteId,
      nombre: user.empresa_nombre,
      rut: user.empresa_rut,
      direccion: user.empresa_direccion,
      telefono: user.empresa_telefono,
      email: user.empresa_email,
      tipo_cliente: user.tipo_cliente
    };

    res.json({
      success: true,
      data: {
        usuario: userData,
        cliente: clienteData
      }
    });

  } catch (error) {
    console.error('Get current user error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Utility function to hash password (for user creation)
async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

module.exports = { router, authenticateToken, hashPassword };