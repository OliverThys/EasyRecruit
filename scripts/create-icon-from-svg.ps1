# Script pour convertir SVG en ICO
# Nécessite ImageMagick ou inkscape

Write-Host "Creation de l'icone EasyRecruit..." -ForegroundColor Cyan

$svgPath = "build\icon.svg"
$icoPath = "build\icon.ico"

if (-not (Test-Path $svgPath)) {
    Write-Host "Erreur: build\icon.svg n'existe pas" -ForegroundColor Red
    exit 1
}

# Vérifier ImageMagick
$hasImageMagick = Get-Command magick -ErrorAction SilentlyContinue

if ($hasImageMagick) {
    Write-Host "Utilisation d'ImageMagick pour convertir SVG -> ICO" -ForegroundColor Green
    
    # Créer plusieurs tailles pour l'ICO
    magick $svgPath -define icon:auto-resize=256,128,64,32,16 $icoPath
    
    if (Test-Path $icoPath) {
        Write-Host "✅ Icône créée avec succès: $icoPath" -ForegroundColor Green
        exit 0
    }
}

# Vérifier Inkscape
$hasInkscape = Get-Command inkscape -ErrorAction SilentlyContinue

if ($hasInkscape) {
    Write-Host "Utilisation d'Inkscape pour convertir SVG -> PNG" -ForegroundColor Green
    
    $pngPath = "build\icon-256.png"
    inkscape $svgPath --export-type=png --export-width=256 --export-filename=$pngPath
    
    if (Test-Path $pngPath -and $hasImageMagick) {
        magick $pngPath -define icon:auto-resize=256,128,64,32,16 $icoPath
        Write-Host "✅ Icône créée avec succès: $icoPath" -ForegroundColor Green
        exit 0
    }
}

# Si aucun outil n'est disponible, télécharger une solution en ligne
Write-Host "`n⚠️  ImageMagick ou Inkscape n'est pas installé" -ForegroundColor Yellow
Write-Host "`nOptions:" -ForegroundColor Cyan
Write-Host "1. Installer ImageMagick: https://imagemagick.org/script/download.php" -ForegroundColor White
Write-Host "2. Utiliser un convertisseur en ligne: https://convertio.co/svg-ico/" -ForegroundColor White
Write-Host "3. Utiliser IcoFX (gratuit): https://icofx.ro/" -ForegroundColor White
Write-Host "`nLe fichier SVG est disponible: $svgPath" -ForegroundColor Green
Write-Host "Convertissez-le en ICO (256x256px) et placez-le dans: $icoPath" -ForegroundColor Yellow

