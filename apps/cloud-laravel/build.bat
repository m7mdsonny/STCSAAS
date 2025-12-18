@echo off
setlocal enabledelayedexpansion

echo ========================================
echo AI-VAP Platform Build Script (Windows)
echo ========================================

set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%..\..\"
set "WEB_PORTAL_DIR=%PROJECT_ROOT%apps\web-portal"
set "LARAVEL_PUBLIC=%SCRIPT_DIR%public"

if not exist "%WEB_PORTAL_DIR%" (
    echo Error: Web portal directory not found at %WEB_PORTAL_DIR%
    exit /b 1
)

echo.
echo [1/4] Installing web portal dependencies...
cd /d "%WEB_PORTAL_DIR%"
call npm install
if errorlevel 1 (
    echo Error: npm install failed
    exit /b 1
)

echo.
echo [2/4] Building React application...
call npm run build
if errorlevel 1 (
    echo Error: npm run build failed
    exit /b 1
)

echo.
echo [3/4] Copying build assets to Laravel public directory...

if exist "%LARAVEL_PUBLIC%\index.html" del "%LARAVEL_PUBLIC%\index.html"
if exist "%LARAVEL_PUBLIC%\assets" rmdir /s /q "%LARAVEL_PUBLIC%\assets"

copy "%WEB_PORTAL_DIR%\dist\index.html" "%LARAVEL_PUBLIC%\"
xcopy "%WEB_PORTAL_DIR%\dist\assets" "%LARAVEL_PUBLIC%\assets\" /E /I /Y

echo.
echo [4/4] Build completed!

echo.
echo ========================================
echo Build completed successfully!
echo ========================================
echo.
echo Files deployed to: %LARAVEL_PUBLIC%
echo.
echo Next steps:
echo   1. Run 'composer install' in cloud-laravel directory
echo   2. Copy .env.example to .env and configure
echo   3. Run 'php artisan key:generate'
echo   4. Run 'php artisan serve' to test locally
echo.

endlocal
