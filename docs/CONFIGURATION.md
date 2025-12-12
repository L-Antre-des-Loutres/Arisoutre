# Configuration - Arisoutre

## Variables d'environnement

Toutes les variables d'environnement sont définies dans le fichier `.env` à la racine du projet.

### Variables obligatoires

#### Configuration Discord

| Variable | Description | Exemple              |
|----------|-------------|----------------------|
| `BOT_TOKEN` | Token du bot Discord | `Votre token`        |
| `DISCORD_CLIENT_ID` | ID de l'application Discord | `1234567890123456789` |
| `DISCORD_GUILD_ID` | ID du serveur Discord | `9876543210987654321` |
| `DISCORD_NAME` | Nom du bot | `Arisoutre`          |

#### Configuration de modération

| Variable | Description | Exemple |
|----------|-------------|---------|
| `MODERATION_CHANNEL_ID` | ID du canal de modération | `1111111111111111111` |

### Variables optionnelles

#### Environnement

| Variable | Description | Valeurs possibles | Défaut |
|----------|-------------|-------------------|--------|
| `NODE_ENV` | Environnement d'exécution | `dev`, `production` | `dev` |
| `BOT_LANGUAGE` | Langue du bot | `FR`, `EN` | `FR` |

#### API Otterly

| Variable | Description | Exemple |
|----------|-------------|---------|
| `API_ROUTES_URL` | URL de l'API des routes | `https://otterlyapi.antredesloutres.fr/api/routes` |
| `API_TOKEN` | Token d'authentification API | `votre_token_api` |

#### Personnalisation du bot

| Variable | Description | Exemple |
|----------|-------------|---------|
| `BOT_NAME` | Nom affiché du bot | `Arisoutre` |
| `BOT_COLOR` | Couleur des embeds (hex) | `#3498db` |
| `VERSION` | Version du bot | `3.0.0` |
| `GIT_REPOSITORY` | URL du repository Git | `https://github.com/L-Antre-des-Loutres/Otterbots` |
| `PROJECT_LOGO` | URL du logo du projet | `https://example.com/logo.png` |

#### Logs Discord (Webhooks)

| Variable | Description | Type |
|----------|-------------|------|
| `ENABLE_DISCORD_SUCCESS` | Activer les logs de succès | `true`/`false` |
| `ENABLE_DISCORD_LOGS` | Activer les logs généraux | `true`/`false` |
| `ENABLE_DISCORD_WARNS` | Activer les avertissements | `true`/`false` |
| `ENABLE_DISCORD_ERRORS` | Activer les logs d'erreurs | `true`/`false` |
| `GLOBAL_WEBHOOK_URL` | URL du webhook pour logs généraux | `https://discord.com/api/webhooks/...` |
| `ERROR_WEBHOOK_URL` | URL du webhook pour erreurs | `https://discord.com/api/webhooks/...` |

## Fichiers de configuration

### Client Discord (`src/app/config/client.ts`)

Configure les intents et options du client Discord.

```typescript
import { Client, GatewayIntentBits } from "discord.js";

export const clientGatewayIntent = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.DirectMessages,
    ]
});
```

**Intents disponibles :**
- `Guilds` : Événements de serveur
- `GuildMembers` : Événements de membres (nécessite intent privilégié)
- `GuildMessages` : Événements de messages
- `MessageContent` : Contenu des messages (nécessite intent privilégié)
- `GuildMessageReactions` : Réactions aux messages
- `GuildVoiceStates` : États vocaux
- `DirectMessages` : Messages privés

### OtterGuard (`src/app/config/otterguardConfig.ts`)

Configure le système de protection du bot.

#### Activation des modules

```typescript
export const otterguardConfig: { [key: string]: boolean } = {
    protectLink: true,    // Protection contre les liens
    protectScam: true,    // Protection anti-scam
    protectSpam: true,    // Protection anti-spam
};
```

#### Domaines autorisés

Liste des domaines autorisés pour la protection contre les liens :

```typescript
export const authorizedDomains: string[] = [
    "https://discord.com",
    "https://discord.gg",
    "https://youtube.com",
    "https://www.youtube.com",
    "https://twitch.tv",
    // Ajoutez vos domaines...
];
```

**Comment ajouter un domaine :**
1. Ouvrez `src/app/config/otterguardConfig.ts`
2. Ajoutez votre domaine dans le tableau `authorizedDomains`
3. Utilisez le format complet : `https://example.com`
4. Recompilez et redémarrez le bot

### Salons (`src/app/config/salon.ts`)

Configure les salons spéciaux du serveur.

```typescript
export const salonConfig = {
    // Exemple de configuration
    welcomeChannelId: "1234567890123456789",
    rulesChannelId: "9876543210987654321",
    // ...
};
```

### Tâches planifiées (`src/app/config/task.ts`)

Configure les tâches cron à exécuter périodiquement.

```typescript
import cron from "node-cron";

export function taskOnStart() {
    // Tâches à exécuter au démarrage
    console.log("Tâches de démarrage exécutées");
}

// Exemple de tâche cron
cron.schedule('0 0 * * *', () => {
    // Exécuté tous les jours à minuit
    console.log("Tâche quotidienne");
});
```

**Format cron :**
```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Jour de la semaine (0-7, 0 et 7 = dimanche)
│ │ │ └───── Mois (1-12)
│ │ └─────── Jour du mois (1-31)
│ └───────── Heure (0-23)
└─────────── Minute (0-59)
```

**Exemples :**
- `*/5 * * * *` : Toutes les 5 minutes
- `0 */2 * * *` : Toutes les 2 heures
- `0 9 * * 1` : Tous les lundis à 9h
- `0 0 1 * *` : Le 1er de chaque mois à minuit

### Réactions emoji (`src/app/config/emojiReact.ts`)

Configure les réactions automatiques aux messages.

```typescript
export const emojiReactConfig = {
    // Configuration des réactions emoji
};
```

### Cache (`src/app/config/cache.ts`)

Configure le système de cache.

```typescript
export const cacheConfig = {
    // Configuration du cache
};
```

## Configuration avancée

### Permissions du bot

Le bot nécessite les permissions suivantes :

#### Permissions essentielles
- ✅ **View Channels** : Voir les canaux
- ✅ **Send Messages** : Envoyer des messages
- ✅ **Embed Links** : Intégrer des liens
- ✅ **Attach Files** : Joindre des fichiers
- ✅ **Read Message History** : Lire l'historique
- ✅ **Use Slash Commands** : Utiliser les commandes slash

#### Permissions de modération
- ✅ **Manage Messages** : Gérer les messages (pour OtterGuard)
- ✅ **Kick Members** : Expulser des membres
- ✅ **Ban Members** : Bannir des membres
- ✅ **Manage Roles** : Gérer les rôles
- ✅ **Moderate Members** : Modérer les membres (timeout)

#### Permissions vocales (optionnel)
- ✅ **Connect** : Se connecter aux salons vocaux
- ✅ **Speak** : Parler dans les salons vocaux
- ✅ **Move Members** : Déplacer des membres

### Configuration des webhooks Discord

Pour activer les logs Discord via webhooks :

1. **Créer un webhook :**
   - Allez dans les paramètres du canal
   - Intégrations → Webhooks → Nouveau webhook
   - Copiez l'URL du webhook

2. **Configurer dans `.env` :**
   ```env
   ENABLE_DISCORD_ERRORS=true
   ERROR_WEBHOOK_URL=https://discord.com/api/webhooks/123456789/abcdefgh
   ```

3. **Types de webhooks :**
   - `GLOBAL_WEBHOOK_URL` : Logs généraux, succès, infos
   - `ERROR_WEBHOOK_URL` : Erreurs et avertissements critiques

### Configuration TypeScript

Le fichier `tsconfig.json` configure la compilation TypeScript :

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "outDir": "./build",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "build"]
}
```

### Configuration ESLint

Le fichier `eslint.config.js` configure les règles de linting :

```javascript
export default [
    {
        files: ["**/*.ts"],
        languageOptions: {
            parser: "@typescript-eslint/parser",
            parserOptions: {
                ecmaVersion: 2022,
                sourceType: "module"
            }
        },
        plugins: {
            "@typescript-eslint": typescriptEslint
        },
        rules: {
            // Vos règles personnalisées
        }
    }
];
```

## Bonnes pratiques

### Sécurité

1. **Ne jamais commiter le fichier `.env`**
   - Ajoutez `.env` dans `.gitignore`
   - Utilisez `.env.example` comme template

2. **Protéger les tokens**
   - Ne partagez jamais votre `BOT_TOKEN`
   - Régénérez le token si compromis

3. **Limiter les permissions**
   - N'accordez que les permissions nécessaires
   - Utilisez des rôles dédiés pour le bot

### Performance

1. **Activer le cache**
   - Configurez le cache dans `cache.ts`
   - Utilisez les tâches cron pour rafraîchir

2. **Optimiser les intents**
   - N'activez que les intents nécessaires
   - Réduisez la charge réseau

3. **Logs en production**
   - Désactivez les logs de debug en production
   - Utilisez `NODE_ENV=production`

### Maintenance

1. **Versionning**
   - Mettez à jour `VERSION` dans `.env`
   - Suivez le semantic versioning

2. **Monitoring**
   - Activez les webhooks d'erreurs
   - Surveillez les logs régulièrement

3. **Sauvegardes**
   - Sauvegardez la configuration
   - Documentez les changements

## Exemples de configuration

### Configuration minimale

```env
# .env minimal
BOT_TOKEN=votre_token
DISCORD_CLIENT_ID=votre_client_id
DISCORD_GUILD_ID=votre_guild_id
MODERATION_CHANNEL_ID=votre_channel_id
```

### Configuration complète

```env
# .env complet
NODE_ENV=production
BOT_LANGUAGE=FR

API_ROUTES_URL=https://otterlyapi.antredesloutres.fr/api/routes
API_TOKEN=votre_api_token

BOT_TOKEN=votre_bot_token
DISCORD_GUILD_ID=votre_guild_id
DISCORD_CLIENT_ID=votre_client_id
DISCORD_NAME=Arisoutre

MODERATION_CHANNEL_ID=votre_moderation_channel

BOT_NAME=Arisoutre
BOT_COLOR=#3498db
VERSION=3.0.0

GIT_REPOSITORY=https://github.com/L-Antre-des-Loutres/Otterbots
PROJECT_LOGO=https://example.com/logo.png

ENABLE_DISCORD_SUCCESS=false
ENABLE_DISCORD_LOGS=false
ENABLE_DISCORD_WARNS=true
ENABLE_DISCORD_ERRORS=true

GLOBAL_WEBHOOK_URL=https://discord.com/api/webhooks/xxx/yyy
ERROR_WEBHOOK_URL=https://discord.com/api/webhooks/aaa/bbb
```

## Dépannage

### Variables non reconnues

Si une variable n'est pas reconnue :
1. Vérifiez l'orthographe dans `.env`
2. Redémarrez le bot
3. Vérifiez qu'il n'y a pas d'espaces autour du `=`

### Webhooks ne fonctionnent pas

1. Vérifiez que l'URL est correcte
2. Vérifiez que le webhook n'est pas supprimé
3. Vérifiez les permissions du webhook

### OtterGuard trop strict

1. Ajoutez des domaines dans `authorizedDomains`
2. Désactivez certains modules dans `otterguardConfig`
3. Ajustez les seuils de détection
