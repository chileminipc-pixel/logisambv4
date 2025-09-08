@echo off
echo.
echo ===============================================
echo  🚀 LOGISAMB Portal - Setup Windows 11
echo ===============================================
echo.

:: Verificar Node.js
echo ⚡ Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no está instalado
    echo 📥 Descarga Node.js desde: https://nodejs.org/
    pause
    exit /b 1
) else (
    echo ✅ Node.js detectado
)

:: Verificar npm
echo ⚡ Verificando npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm no está disponible
    pause
    exit /b 1
) else (
    echo ✅ npm detectado
)

echo.
echo 📦 Instalando dependencias del Backend...
cd backend
if not exist "node_modules" (
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Error instalando dependencias del backend
        pause
        exit /b 1
    )
) else (
    echo ✅ Dependencias del backend ya instaladas
)

echo.
echo 📦 Instalando dependencias del Frontend...
cd ..
if not exist "node_modules" (
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Error instalando dependencias del frontend
        pause
        exit /b 1
    )
) else (
    echo ✅ Dependencias del frontend ya instaladas
)

echo.
echo 🔧 Configurando variables de entorno...
cd backend
if not exist ".env" (
    if exist ".env.example" (
        copy ".env.example" ".env"
        echo ✅ Archivo .env creado desde .env.example
        echo ⚠️  IMPORTANTE: Edita backend\.env con tu configuración de MariaDB
    ) else (
        echo ❌ No se encontró .env.example
    )
) else (
    echo ✅ Archivo .env ya existe
)

echo.
echo ===============================================
echo  ✅ SETUP COMPLETADO
echo ===============================================
echo.
echo 📝 PRÓXIMOS PASOS:
echo 1. Edita backend\.env con tu configuración de MariaDB
echo 2. Ejecuta: start-dev-windows.bat
echo 3. Abre http://localhost:5173 en tu navegador
echo.
echo 🔗 Tu configuración de MariaDB:
echo    HOST: livesoft.ddns.me
echo    PUERTO: 3306
echo    BASE DATOS: [tu base de datos]
echo    USUARIO: [tu usuario]
echo    PASSWORD: [tu password]
echo.
pause