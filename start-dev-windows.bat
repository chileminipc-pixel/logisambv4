@echo off
title LOGISAMB Portal - Desarrollo Local

echo.
echo ===============================================
echo  🚀 LOGISAMB Portal - Iniciar Desarrollo
echo ===============================================
echo.

:: Verificar que existe .env
if not exist "backend\.env" (
    echo ❌ No se encontró backend\.env
    echo 🔧 Ejecuta primero setup-windows.bat
    pause
    exit /b 1
)

echo ⚡ Iniciando Backend y Frontend...
echo.
echo 🔗 URLs de desarrollo:
echo    Backend API: http://localhost:3001
echo    Frontend:    http://localhost:5173
echo.
echo 📋 Presiona Ctrl+C en cualquier terminal para detener
echo ===============================================
echo.

:: Crear una nueva ventana para el backend
start "LOGISAMB Backend" cmd /k "cd backend && echo ⚡ Iniciando Backend en puerto 3001... && npm run dev"

:: Esperar un poco para que el backend se inicie
timeout /t 3 /nobreak >nul

:: Crear una nueva ventana para el frontend
start "LOGISAMB Frontend" cmd /k "echo ⚡ Iniciando Frontend en puerto 5173... && npm run dev"

:: Esperar un poco y abrir el navegador
timeout /t 5 /nobreak >nul
echo 🌐 Abriendo navegador...
start http://localhost:5173

echo.
echo ✅ Aplicación iniciada correctamente
echo.
echo 📊 Terminales abiertas:
echo    - Backend (puerto 3001)
echo    - Frontend (puerto 5173)
echo.
echo 🔍 Para ver logs o errores, revisa las ventanas de terminal
echo 🛑 Para detener: cierra las ventanas o presiona Ctrl+C
echo.
pause