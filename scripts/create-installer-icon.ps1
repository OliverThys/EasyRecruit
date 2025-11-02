# Script PowerShell pour créer une icône simple si aucune n'existe pas
# Ceci est un script temporaire - vous devriez créer une vraie icône avec un outil comme IcoFX

Write-Host "Creation de l'icone de l'application..." -ForegroundColor Yellow
Write-Host "Note: Ce script cree une icone basique. Pour une icone professionnelle," -ForegroundColor Yellow
Write-Host "utilisez un outil comme IcoFX ou convertissez un PNG/ICO existant." -ForegroundColor Yellow

$iconPath = "build\icon.ico"

if (Test-Path $iconPath) {
    Write-Host "L'icone existe deja : $iconPath" -ForegroundColor Green
    exit
}

Write-Host "Creation d'une icone temporaire..." -ForegroundColor Yellow
Write-Host "Pour creer une vraie icone :" -ForegroundColor Cyan
Write-Host "1. Telechargez IcoFX (gratuit) : https://icofx.ro/" -ForegroundColor Cyan
Write-Host "2. Creez une icone 256x256px avec votre logo" -ForegroundColor Cyan
Write-Host "3. Enregistrez-la comme build\icon.ico" -ForegroundColor Cyan

# Pour l'instant, on crée juste un fichier placeholder
New-Item -ItemType File -Path $iconPath -Force | Out-Null
Write-Host "Fichier placeholder cree : $iconPath" -ForegroundColor Yellow
Write-Host "Remplacez-le par une vraie icone avant de construire l'installateur !" -ForegroundColor Red

