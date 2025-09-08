@echo off
title LOGISAMB Portal - Preparar para Vercel

echo.
echo ===============================================
echo  🚀 LOGISAMB Portal - Preparar para Vercel
echo ===============================================
echo.

:: Verificar Git
echo ⚡ Verificando Git...
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git no está instalado
    echo 📥 Descarga Git desde: https://git-scm.com/download/win
    pause
    exit /b 1
) else (
    echo ✅ Git detectado
)

echo.
echo 📝 Preparando archivos para deploy...

:: Copiar configuración de Vercel a la raíz
echo ⚡ Copiando configuración de Vercel...
copy "vercel-deployment\vercel.json" ".\" >nul
copy "vercel-deployment\vite.config.ts" ".\" >nul

echo ✅ Archivos de configuración copiados

:: Verificar si ya existe repositorio Git
if not exist ".git" (
    echo.
    echo 🔧 Inicializando repositorio Git...
    git init
    echo ✅ Repositorio Git inicializado
) else (
    echo ✅ Repositorio Git ya existente
)

:: Agregar archivos
echo.
echo 📦 Agregando archivos al repositorio...
git add .

:: Commit
echo.
echo 💾 Creando commit...
git commit -m "feat: LOGISAMB Portal ready for Vercel deployment"

echo.
echo ===============================================
echo  ✅ PREPARACIÓN COMPLETADA
echo ===============================================
echo.
echo 📋 PRÓXIMOS PASOS:
echo.
echo 1. 🔗 Crear repositorio en GitHub:
echo    - Ve a: https://github.com/new
echo    - Nombre: logisamb-portal
echo    - Público o Privado (tu elección)
echo    - NO inicialices con README
echo.
echo 2. 📤 Subir código a GitHub:
echo    git remote add origin https://github.com/TU-USUARIO/logisamb-portal.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo 3. 🚀 Deploy en Vercel:
echo    - Ve a: https://vercel.com
echo    - Sign up con GitHub
echo    - Import Project: logisamb-portal
echo    - Deploy automático
echo.
echo 4. ⚙️ Configurar variables de entorno en Vercel:
echo    DATABASE_HOST=livesoft.ddns.me
echo    DATABASE_PORT=3306
echo    DATABASE_NAME=[tu_base_datos]
echo    DATABASE_USER=[tu_usuario]
echo    DATABASE_PASSWORD=[tu_password]
echo    JWT_SECRET=[genera_uno_seguro]
echo    NODE_ENV=production
echo.
echo 📖 Consulta DESPLIEGUE_VERCEL_PASO_A_PASO.md para detalles
echo.
pause