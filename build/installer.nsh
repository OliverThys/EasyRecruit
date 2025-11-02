; Script NSIS personnalisé pour l'installateur EasyRecruit

!macro customInstall
  ; Vérifier si Node.js est installé
  ReadRegStr $0 HKLM "SOFTWARE\Node.js" "InstallPath"
  StrCmp $0 "" 0 NodeJSInstalled
  
  ; Node.js n'est pas installé - afficher un message avec lien
  MessageBox MB_OK|MB_ICONEXCLAMATION "Node.js n'est pas installé.$\n$\nEasyRecruit nécessite Node.js 18+ pour fonctionner.$\n$\nCliquez sur OK pour ouvrir la page de téléchargement."
  ExecShell "open" "https://nodejs.org/"
  MessageBox MB_OK "Veuillez installer Node.js et relancer cet installateur après l'installation."
  Abort
  
  NodeJSInstalled:
  
  ; Vérifier si Docker Desktop est installé
  ReadRegStr $0 HKLM "SOFTWARE\Docker Inc.\Docker Desktop" "InstallPath"
  StrCmp $0 "" 0 DockerInstalled
  
  ; Docker n'est pas installé - afficher un message avec lien
  MessageBox MB_OK|MB_ICONEXCLAMATION "Docker Desktop n'est pas installé.$\n$\nEasyRecruit nécessite Docker Desktop pour la base de données (PostgreSQL et Redis).$\n$\nCliquez sur OK pour ouvrir la page de téléchargement."
  ExecShell "open" "https://www.docker.com/products/docker-desktop"
  MessageBox MB_OK "Veuillez installer Docker Desktop et relancer cet installateur après l'installation.$\n$\nImportant: Après l'installation, démarrez Docker Desktop et attendez qu'il soit complètement démarré."
  Abort
  
  DockerInstalled:
  
  ; Créer le fichier .env si il n'existe pas
  IfFileExists "$INSTDIR\.env" 0 CreateEnv
  Goto EnvExists
  
  CreateEnv:
    FileOpen $0 "$INSTDIR\.env" w
    FileWrite $0 "NODE_ENV=production$\r$\n"
    FileWrite $0 "PORT=4000$\r$\n"
    FileWrite $0 "DATABASE_URL=postgresql://easyrecruit:easyrecruit_dev_password@localhost:5432/easyrecruit$\r$\n"
    FileWrite $0 "REDIS_URL=redis://localhost:6379$\r$\n"
    FileWrite $0 "FRONTEND_URL=http://localhost:3000$\r$\n"
    FileWrite $0 "# Configurez les clés API suivantes :$\r$\n"
    FileWrite $0 "OPENAI_API_KEY=$\r$\n"
    FileWrite $0 "TWILIO_ACCOUNT_SID=$\r$\n"
    FileWrite $0 "TWILIO_AUTH_TOKEN=$\r$\n"
    FileWrite $0 "TWILIO_WHATSAPP_NUMBER=$\r$\n"
    FileWrite $0 "JWT_SECRET=$\r$\n"
    FileWrite $0 "ENCRYPTION_KEY=$\r$\n"
    FileClose $0
  
  EnvExists:
  
  ; Démarrer Docker Desktop si il n'est pas en cours d'exécution
  ExecWait 'tasklist /FI "IMAGENAME eq Docker Desktop.exe" 2>NUL | find /I /N "Docker Desktop.exe">NUL' $0
  IntCmp $0 1 DockerRunning
  
  ; Docker n'est pas en cours d'exécution
  ReadRegStr $0 HKLM "SOFTWARE\Docker Inc.\Docker Desktop" "InstallPath"
  StrCmp $0 "" 0 StartDocker
  Goto DockerStartError
  
  StartDocker:
    ExecWait '"$0\Docker Desktop.exe"' $1
    Sleep 5000 ; Attendre que Docker démarre
  
  DockerRunning:
  
  ; Lancer docker-compose pour démarrer PostgreSQL et Redis
  ExecWait 'docker-compose -f "$INSTDIR\docker-compose.yml" up -d' $2
  
  ; Exécuter les migrations Prisma
  ExecWait 'cd "$INSTDIR" && npx prisma migrate deploy' $3
  
!macroend

!macro customUnInstall
  ; Arrêter les conteneurs Docker
  ExecWait 'docker-compose -f "$INSTDIR\docker-compose.yml" down' $0
  
  ; Optionnel : Supprimer les volumes Docker (décommentez si vous voulez)
  ; ExecWait 'docker-compose -f "$INSTDIR\docker-compose.yml" down -v' $0
!macroend

