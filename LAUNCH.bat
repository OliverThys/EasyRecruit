@echo off
echo ====================================
echo    EASYRECRUIT - Démarrage du Projet
echo ====================================
echo.

echo [1/5] Verification Docker...
docker ps >nul 2>&1
if errorlevel 1 (
    echo [ERREUR] Docker Desktop n'est pas lance!
    echo Veuillez ouvrir Docker Desktop et reessayer.
    pause
    exit /b 1
)
echo [OK] Docker est lance
echo.

echo [2/5] Demarrage PostgreSQL et Redis...
docker-compose up -d
if errorlevel 1 (
    echo [ERREUR] Impossible de demarrer les conteneurs
    pause
    exit /b 1
)
echo [OK] Conteneurs demarres
echo.

echo [3/5] Generation Prisma Client...
call npx prisma generate
if errorlevel 1 (
    echo [ERREUR] Erreur Prisma
    pause
    exit /b 1
)
echo [OK] Prisma Client genere
echo.

echo [4/5] Migration base de donnees...
call npx prisma migrate dev --name init
if errorlevel 1 (
    echo [ATTENTION] Migration peut avoir echoue si la base existe deja
    echo C'est normal si c'est la premiere fois, sinon verifiez les logs
)
echo.

echo [5/5] Demarrage du backend...
echo Le backend va demarrer sur http://localhost:4000
echo.
echo Pour le frontend, ouvrez un nouveau terminal et:
echo   cd frontend
echo   npm run dev
echo.
echo Appuyez sur Ctrl+C pour arreter le backend
echo.
call npm run dev

