# Guide d'installation - Arisoutre

## Prérequis

Avant d'installer Arisoutre, assurez-vous d'avoir :

- **Node.js** version 18.x ou supérieure
- **npm** version 8.x ou supérieure
- Un compte **Discord Developer** avec un bot créé
- **Git** (pour cloner le repository)
- Un serveur Discord où vous avez les permissions d'administrateur

## Installation

### 1. Cloner le repository

```bash
git clone https://github.com/L-Antre-des-Loutres/Otterbots.git
cd Otterbots
```

### 2. Installer les dépendances

```bash
npm install
```

Cette commande installera toutes les dépendances nécessaires :

#### Dépendances principales :
- `discord.js` (^14.23.2) - Bibliothèque Discord
- `typescript` (^5.9.3) - Langage TypeScript
- `dotenv` (^17.2.3) - Gestion des variables d'environnement
- `axios` (^1.12.2) - Client HTTP
- `pino` (^10.1.0) - Système de logs
- `node-cron` (^4.2.1) - Planificateur de tâches
- `figlet` (^1.9.3) - ASCII art pour le logo

#### Dépendances de développement :
- `eslint` - Linter JavaScript/TypeScript
- `@typescript-eslint/*` - Plugins ESLint pour TypeScript
- `pino-pretty` - Formatage des logs en développement

### 3. Configuration du bot Discord

#### a. Créer une application Discord

1. Allez sur [Discord Developer Portal](https://discord.com/developers/applications)
2. Cliquez sur **"New Application"**
3. Donnez un nom à votre application (ex: "Arisoutre")
4. Acceptez les conditions d'utilisation

#### b. Créer le bot

1. Dans le menu de gauche, cliquez sur **"Bot"**
2. Cliquez sur **"Add Bot"**
3. Confirmez en cliquant sur **"Yes, do it!"**
4. Copiez le **token** du bot (vous en aurez besoin pour le fichier `.env`)

#### c. Configurer les intents

Dans la section **Privileged Gateway Intents**, activez :
- ✅ **Presence Intent**
- ✅ **Server Members Intent**
- ✅ **Message Content Intent**

#### d. Générer l'URL d'invitation

1. Dans le menu de gauche, cliquez sur **"OAuth2"** → **"URL Generator"**
2. Dans **Scopes**, sélectionnez :
   - ✅ `bot`
   - ✅ `applications.commands`
3. Dans **Bot Permissions**, sélectionnez :
   - ✅ Administrator (ou les permissions spécifiques nécessaires)
4. Copiez l'URL générée en bas de la page
5. Ouvrez cette URL dans votre navigateur pour inviter le bot sur votre serveur

### 4. Configuration des variables d'environnement

#### a. Créer le fichier `.env`

Copiez le fichier d'exemple :

```bash
cp .env.example .env
```

#### b. Remplir les variables obligatoires

Ouvrez le fichier `.env` et remplissez les informations suivantes :

```env
# Environnement
NODE_ENV="dev"                    # "dev" ou "production"
BOT_LANGUAGE="FR"                 # Langue du bot

# API Otterly (optionnel)
API_ROUTES_URL="https://otterlyapi.antredesloutres.fr/api/routes"
API_TOKEN=""                      # Token d'API si nécessaire

# Configuration Discord (OBLIGATOIRE)
BOT_TOKEN="votre_token_bot_ici"
DISCORD_GUILD_ID="id_de_votre_serveur"
DISCORD_CLIENT_ID="id_de_votre_application"
DISCORD_NAME="Arisoutre"

# Canal de modération (OBLIGATOIRE pour OtterGuard)
MODERATION_CHANNEL_ID="id_du_canal_moderation"

# Informations du bot
BOT_NAME="Arisoutre"
BOT_COLOR="#3498db"               # Couleur des embeds (hex)
VERSION="3.0.0"

# Repository Git
GIT_REPOSITORY="https://github.com/L-Antre-des-Loutres/Otterbots"
PROJECT_LOGO="https://votre-url-logo.png"

# Logs Discord via Webhooks (optionnel)
ENABLE_DISCORD_SUCCESS=false
ENABLE_DISCORD_LOGS=false
ENABLE_DISCORD_WARNS=false
ENABLE_DISCORD_ERRORS=false

GLOBAL_WEBHOOK_URL=
ERROR_WEBHOOK_URL=
```

#### c. Obtenir les IDs Discord

Pour obtenir les IDs Discord, activez le **Mode Développeur** :
1. Discord → Paramètres utilisateur → Avancés
2. Activez **Mode développeur**
3. Faites un clic droit sur votre serveur/canal → **Copier l'identifiant**

**IDs nécessaires :**
- `DISCORD_GUILD_ID` : ID de votre serveur Discord
- `DISCORD_CLIENT_ID` : ID de l'application (onglet "General Information" du Developer Portal)
- `MODERATION_CHANNEL_ID` : ID du canal où seront envoyés les logs de modération

### 5. Configuration de l'application

#### a. Configuration du client Discord

Modifiez `src/app/config/client.ts` si nécessaire pour ajuster les intents :

```typescript
export const clientGatewayIntent = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        // Ajoutez d'autres intents si nécessaire
    ]
});
```

#### b. Configuration d'OtterGuard

Modifiez `src/app/config/otterguardConfig.ts` pour activer/désactiver les protections :

```typescript
export const otterguardConfig = {
    protectLink: true,    // Protection contre les liens non autorisés
    protectScam: true,    // Protection anti-scam
    protectSpam: true,    // Protection anti-spam
};
```

Ajoutez vos domaines autorisés dans `authorizedDomains` :

```typescript
export const authorizedDomains: string[] = [
    "https://discord.com",
    "https://youtube.com",
    // Ajoutez vos domaines...
];
```

#### c. Configuration des salons (optionnel)

Modifiez `src/app/config/salon.ts` pour configurer les salons spéciaux.

#### d. Configuration des tâches (optionnel)

Modifiez `src/app/config/task.ts` pour configurer les tâches planifiées.

### 6. Compilation

Compilez le projet TypeScript :

```bash
npm run build
```

Cette commande :
1. Exécute ESLint pour vérifier le code
2. Compile TypeScript vers JavaScript dans le dossier `build/`

### 7. Lancement du bot

#### Mode développement

```bash
npm run dev
```

Cette commande :
1. Lint le code
2. Compile TypeScript
3. Lance le bot

#### Mode production

```bash
npm start
```

Lance directement le bot compilé (nécessite d'avoir exécuté `npm run build` au préalable).

## Vérification de l'installation

Si tout est correctement configuré, vous devriez voir :

```
   _    ____  ___ ____   ___  _   _ _____ ____  _____ 
  / \  |  _ \|_ _/ ___| / _ \| | | |_   _|  _ \| ____|
 / _ \ | |_) || |\___ \| | | | | | | | | | |_) |  _|  
/ ___ \|  _ < | | ___) | |_| | |_| | | | |  _ <| |___ 
/_/   \_\_| \_\___|____/ \___/ \___/  |_| |_| \_\_____|

[SUCCESS] Otterguard is working!
[SUCCESS] X command(s) registered on Discord.
[SUCCESS] X events successfully loaded!
[INFO] Bot is ready!
```

## Dépannage

### Le bot ne se connecte pas

- ✅ Vérifiez que `BOT_TOKEN` est correct dans `.env`
- ✅ Vérifiez que le token n'a pas d'espaces avant/après
- ✅ Vérifiez que le bot n'est pas désactivé dans le Developer Portal

### Les commandes ne s'affichent pas

- ✅ Vérifiez que `DISCORD_CLIENT_ID` et `DISCORD_GUILD_ID` sont corrects
- ✅ Attendez quelques minutes (la synchronisation peut prendre du temps)
- ✅ Vérifiez que le bot a la permission `applications.commands`

### OtterGuard ne fonctionne pas

- ✅ Vérifiez que `MODERATION_CHANNEL_ID` est défini
- ✅ Vérifiez que le bot a les permissions de supprimer des messages
- ✅ Vérifiez la configuration dans `otterguardConfig.ts`

### Erreurs de compilation TypeScript

```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Le bot crash au démarrage

- ✅ Vérifiez les logs pour identifier l'erreur
- ✅ Vérifiez que toutes les variables obligatoires sont définies dans `.env`
- ✅ Vérifiez que Node.js est en version 18+

## Mise à jour

Pour mettre à jour le bot :

```bash
git pull origin main
npm install
npm run build
npm start
```

## Désinstallation

Pour supprimer complètement le bot :

```bash
# Supprimer le dossier du projet
cd ..
rm -rf Otterbots

# Retirer le bot de votre serveur Discord
# (via l'interface Discord)
```

## Support

En cas de problème :

1. Consultez les [Issues GitHub](https://github.com/L-Antre-des-Loutres/Otterbots/issues)
2. Vérifiez la documentation complète dans le dossier `docs/`
3. Créez une nouvelle issue si le problème persiste

## Prochaines étapes

Maintenant que le bot est installé :

1. 📖 Lisez [CONFIGURATION.md](./CONFIGURATION.md) pour une configuration avancée
2. 🛠️ Consultez [DEVELOPMENT.md](./DEVELOPMENT.md) pour développer vos propres fonctionnalités
3. 📚 Explorez [COMMANDS.md](./COMMANDS.md) pour connaître toutes les commandes disponibles
