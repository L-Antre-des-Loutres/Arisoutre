# Guide de développement - Arisoutre

## Environnement de développement

### Prérequis

- **Node.js** 18.x ou supérieur
- **npm** 8.x ou supérieur
- **Git**
- Un éditeur de code (VS Code recommandé)
- Un serveur Discord de test

### Configuration de l'éditeur

#### VS Code (recommandé)

Extensions recommandées :

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

Configuration `.vscode/settings.json` :

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

### Installation pour le développement

```bash
# Cloner le repository
git clone https://github.com/L-Antre-des-Loutres/Otterbots.git
cd Otterbots

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Configurer les variables d'environnement
# Éditer .env avec vos valeurs
```

## Structure du projet

### Organisation des fichiers

```
src/
├── app/                    # Logique métier
│   ├── commands/          # Commandes personnalisées
│   ├── config/            # Configuration
│   ├── embeds/            # Templates d'embeds
│   ├── events/            # Événements personnalisés
│   ├── tasks/             # Tâches planifiées
│   ├── types/             # Types TypeScript
│   └── utils/             # Utilitaires métier
│
└── otterbots/             # Framework
    ├── commands/          # Commandes du framework
    ├── events/            # Événements du framework
    ├── handlers/          # Gestionnaires
    ├── types/             # Types du framework
    └── utils/             # Utilitaires du framework
```

### Conventions de nommage

#### Fichiers

- **Commandes** : `nomCommande.ts` (camelCase)
- **Événements** : `EventName.ts` (PascalCase)
- **Utilitaires** : `nomUtilitaire.ts` (camelCase)
- **Types** : `NomType.ts` (PascalCase)
- **Configuration** : `nomConfig.ts` (camelCase)

#### Code

```typescript
// Classes : PascalCase
class Otterbots { }

// Interfaces : PascalCase avec préfixe I (optionnel)
interface IUser { }
interface User { }

// Types : PascalCase
type CommandType = { }

// Fonctions : camelCase
function loadCommands() { }

// Constantes : UPPER_SNAKE_CASE
const MAX_RETRIES = 3;

// Variables : camelCase
const userName = "Jean";
```

## Développer une nouvelle fonctionnalité

### 1. Créer une branche

```bash
git checkout -b feature/nom-fonctionnalite
```

### 2. Créer une commande

```typescript
// src/app/commands/maCommande.ts
import { 
    SlashCommandBuilder, 
    ChatInputCommandInteraction 
} from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName("macommande")
        .setDescription("Description de ma commande")
        .addStringOption(option =>
            option
                .setName("parametre")
                .setDescription("Description du paramètre")
                .setRequired(true)
        ),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const param = interaction.options.getString("parametre")!;
        
        try {
            // Logique de la commande
            await interaction.reply(`Paramètre reçu : ${param}`);
        } catch (error) {
            console.error("Erreur dans maCommande:", error);
            await interaction.reply({
                content: "Une erreur est survenue.",
                ephemeral: true
            });
        }
    }
};
```

### 3. Créer un événement

```typescript
// src/app/events/MonEvenement.ts
import { Events, Message } from "discord.js";
import { otterlogs } from "../../otterbots/utils/otterlogs";

export default {
    name: Events.MessageCreate,
    once: false,
    async execute(message: Message) {
        if (message.author.bot) return;
        
        try {
            // Logique de l'événement
            otterlogs.debug(`Message de ${message.author.tag}: ${message.content}`);
        } catch (error) {
            otterlogs.error("Erreur dans MonEvenement:", error);
        }
    }
};
```

### 4. Créer un embed réutilisable

```typescript
// src/app/embeds/monEmbed.ts
import { EmbedBuilder } from "discord.js";

export function createMonEmbed(title: string, description: string): EmbedBuilder {
    return new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(process.env.BOT_COLOR || "#3498db")
        .setFooter({ text: process.env.BOT_NAME || "Arisoutre" })
        .setTimestamp();
}
```

### 5. Créer un utilitaire

```typescript
// src/app/utils/monUtilitaire.ts

/**
 * Formate un nombre avec des espaces comme séparateurs de milliers
 * @param num - Le nombre à formater
 * @returns Le nombre formaté
 */
export function formatNumber(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/**
 * Vérifie si un utilisateur est administrateur
 * @param member - Le membre à vérifier
 * @returns true si administrateur, false sinon
 */
export function isAdmin(member: GuildMember): boolean {
    return member.permissions.has(PermissionFlagsBits.Administrator);
}
```

## Tests

### Tester localement

```bash
# Mode développement (avec hot reload)
npm run dev

# Mode production
npm run build
npm start
```

### Tester une commande

1. Démarrez le bot en mode dev
2. Utilisez la commande dans votre serveur de test
3. Vérifiez les logs dans la console
4. Vérifiez le comportement attendu

### Serveur de test

Créez un serveur Discord dédié aux tests avec :
- Canaux de test pour chaque fonctionnalité
- Rôles de test
- Membres de test (comptes secondaires ou bots)

## Débogage

### Logs

Utilisez le système de logs Otterlogs :

```typescript
import { otterlogs } from "../../otterbots/utils/otterlogs";

otterlogs.debug("Message de debug");
otterlogs.info("Information");
otterlogs.success("Succès");
otterlogs.warn("Avertissement");
otterlogs.error("Erreur", error);
```

### Mode debug

Dans `.env` :

```env
NODE_ENV=dev
```

### Breakpoints (VS Code)

Configuration `.vscode/launch.json` :

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Bot",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/build/app/index.js",
      "preLaunchTask": "npm: build",
      "outFiles": ["${workspaceFolder}/build/**/*.js"]
    }
  ]
}
```

## Linting et formatage

### ESLint

Vérifier le code :

```bash
npm run lint
```

Corriger automatiquement :

```bash
npx eslint "src/**/*.ts" --fix
```

### Configuration ESLint

```javascript
// eslint.config.js
export default [
    {
        files: ["**/*.ts"],
        rules: {
            "no-console": "warn",
            "no-unused-vars": "error",
            "@typescript-eslint/no-explicit-any": "warn"
        }
    }
];
```

## TypeScript

### Configuration

```json
// tsconfig.json
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
  }
}
```

### Types personnalisés

```typescript
// src/app/types/CustomTypes.ts

export interface CustomCommand {
    name: string;
    description: string;
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface Config {
    botName: string;
    botColor: string;
    version: string;
}
```

### Extension du client Discord

```typescript
// src/otterbots/types.d.ts
import { Client, Collection } from "discord.js";
import { SlashCommand } from "./types";

declare module "discord.js" {
    export interface Client {
        slashCommands: Collection<string, SlashCommand>;
    }
}
```

## Gestion des dépendances

### Ajouter une dépendance

```bash
# Dépendance de production
npm install nom-package

# Dépendance de développement
npm install --save-dev nom-package
```

### Mettre à jour les dépendances

```bash
# Vérifier les mises à jour
npm outdated

# Mettre à jour toutes les dépendances
npm update

# Mettre à jour une dépendance spécifique
npm update nom-package
```

### Dépendances importantes

```json
{
  "dependencies": {
    "discord.js": "^14.23.2",    // Framework Discord
    "typescript": "^5.9.3",       // TypeScript
    "dotenv": "^17.2.3",          // Variables d'environnement
    "axios": "^1.12.2",           // Client HTTP
    "pino": "^10.1.0",            // Logs
    "node-cron": "^4.2.1",        // Tâches planifiées
    "figlet": "^1.9.3"            // ASCII art
  }
}
```

## Bonnes pratiques

### 1. Sécurité

```typescript
// ✅ Bon : Validation des entrées
const amount = interaction.options.getInteger("montant");
if (amount < 1 || amount > 1000) {
    await interaction.reply("Montant invalide.");
    return;
}

// ✅ Bon : Vérification des permissions
if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
    await interaction.reply("Permission refusée.");
    return;
}

// ❌ Éviter : Faire confiance aux entrées utilisateur
const query = interaction.options.getString("query");
eval(query); // DANGEREUX !
```

### 2. Performance

```typescript
// ✅ Bon : Utiliser le cache
const channel = guild.channels.cache.get(channelId);

// ❌ Éviter : Requêtes API inutiles
const channel = await guild.channels.fetch(channelId);

// ✅ Bon : Defer pour les traitements longs
await interaction.deferReply();
await longProcess();
await interaction.editReply("Terminé !");
```

### 3. Gestion des erreurs

```typescript
// ✅ Bon : Try/catch avec logs
try {
    await riskyOperation();
} catch (error) {
    otterlogs.error("Erreur dans riskyOperation:", error);
    await interaction.reply({
        content: "Une erreur est survenue.",
        ephemeral: true
    });
}

// ✅ Bon : Vérifications préalables
if (!message.guild) return;
if (!message.member) return;
if (message.author.bot) return;
```

### 4. Code propre

```typescript
// ✅ Bon : Fonctions courtes et ciblées
async function sendWelcomeMessage(member: GuildMember) {
    const embed = createWelcomeEmbed(member);
    const channel = getWelcomeChannel(member.guild);
    if (channel) await channel.send({ embeds: [embed] });
}

// ✅ Bon : Noms descriptifs
const isUserBanned = await checkBanStatus(userId);

// ❌ Éviter : Noms vagues
const x = await check(id);
```

## Git workflow

### Commits

Format des messages de commit :

```
type(scope): description courte

Description détaillée (optionnel)

Fixes #123
```

Types :
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation
- `style`: Formatage
- `refactor`: Refactorisation
- `test`: Tests
- `chore`: Maintenance

Exemples :
```bash
git commit -m "feat(commands): add /kick command"
git commit -m "fix(events): fix welcome message embed"
git commit -m "docs(readme): update installation guide"
```

### Pull Requests

1. Créer une branche depuis `main`
2. Développer la fonctionnalité
3. Tester localement
4. Commit et push
5. Créer une Pull Request
6. Attendre la review
7. Merger après approbation

## Déploiement

### Environnement de production

```env
NODE_ENV=production
```

### Build de production

```bash
npm run build
```

### Démarrage en production

```bash
npm start
```

### PM2 (recommandé)

```bash
# Installer PM2
npm install -g pm2

# Démarrer le bot
pm2 start build/app/index.js --name arisoutre

# Voir les logs
pm2 logs arisoutre

# Redémarrer
pm2 restart arisoutre

# Arrêter
pm2 stop arisoutre
```

## Ressources

### Documentation

- [Discord.js Guide](https://discordjs.guide/)
- [Discord.js Documentation](https://discord.js.org/)
- [Discord API Documentation](https://discord.com/developers/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Outils

- [Discord Developer Portal](https://discord.com/developers/applications)
- [Discord Permissions Calculator](https://discordapi.com/permissions.html)
- [Embed Visualizer](https://leovoel.github.io/embed-visualizer/)

### Communauté

- [Discord.js Discord Server](https://discord.gg/djs)
- [Discord Developers Discord Server](https://discord.gg/discord-developers)

## Contribution

Pour contribuer au projet :

1. Fork le repository
2. Créez une branche (`git checkout -b feature/amazing-feature`)
3. Committez vos changements (`git commit -m 'feat: add amazing feature'`)
4. Pushez vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request

Lisez [CONTRIBUTING.md](../CONTRIBUTING.md) pour plus de détails.
