# Commandes - Arisoutre

## Vue d'ensemble

Arisoutre utilise les **Slash Commands** de Discord. Toutes les commandes commencent par `/`.

## Commandes disponibles

### Commandes de modération

#### `/analyze`

Analyse le score de fiabilité d'un membre du serveur.

**Permissions requises :** Administrateur

**Usage :**
```
/analyze membre:@utilisateur
```

**Paramètres :**
- `membre` (obligatoire) : Le membre à analyser

**Exemple :**
```
/analyze membre:@Jean#1234
```

**Résultat :**
Affiche un embed contenant :
- Score de fiabilité du membre
- Date de création du compte
- Date d'arrivée sur le serveur
- Nombre de messages envoyés
- Historique de modération
- Recommandations

---

#### `/clear`

Supprime un nombre spécifique de messages dans un canal.

**Permissions requises :** Administrateur

**Usage :**
```
/clear nombre:50
```

**Paramètres :**
- `nombre` (obligatoire) : Nombre de messages à supprimer (1-100)

**Exemple :**
```
/clear nombre:25
```

**Notes :**
- Maximum 100 messages par commande
- Ne peut pas supprimer les messages de plus de 14 jours
- Les messages épinglés ne sont pas supprimés

---

### Commandes d'information

#### `/git-repo`

Affiche les informations du repository Git du bot.

**Permissions requises :** Aucune

**Usage :**
```
/git-repo
```

**Résultat :**
Affiche un embed contenant :
- Nom du projet
- Lien vers le repository
- Version actuelle
- Dernière mise à jour

---

## Création de commandes personnalisées

### Structure d'une commande

Pour créer une nouvelle commande, créez un fichier dans `src/app/commands/` :

```typescript
import { 
    SlashCommandBuilder, 
    ChatInputCommandInteraction 
} from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName("nom_commande")
        .setDescription("Description de la commande")
        .setDefaultMemberPermissions(0) // 0 = Admin uniquement
        .addStringOption(option =>
            option
                .setName("parametre")
                .setDescription("Description du paramètre")
                .setRequired(true)
        ),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        // Récupérer les paramètres
        const param = interaction.options.getString("parametre");

        // Répondre à l'interaction
        await interaction.reply({
            content: `Vous avez dit : ${param}`,
            ephemeral: true // Message visible uniquement par l'utilisateur
        });
    }
};
```

### Types de paramètres

#### String (Texte)

```typescript
.addStringOption(option =>
    option
        .setName("texte")
        .setDescription("Un texte")
        .setRequired(true)
        .setMaxLength(100)
        .setMinLength(1)
)
```

#### Integer (Nombre entier)

```typescript
.addIntegerOption(option =>
    option
        .setName("nombre")
        .setDescription("Un nombre")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
)
```

#### Boolean (Vrai/Faux)

```typescript
.addBooleanOption(option =>
    option
        .setName("activer")
        .setDescription("Activer ou désactiver")
        .setRequired(false)
)
```

#### User (Utilisateur)

```typescript
.addUserOption(option =>
    option
        .setName("membre")
        .setDescription("Un membre du serveur")
        .setRequired(true)
)
```

#### Channel (Canal)

```typescript
.addChannelOption(option =>
    option
        .setName("canal")
        .setDescription("Un canal du serveur")
        .setRequired(true)
)
```

#### Role (Rôle)

```typescript
.addRoleOption(option =>
    option
        .setName("role")
        .setDescription("Un rôle du serveur")
        .setRequired(true)
)
```

#### Choices (Choix multiples)

```typescript
.addStringOption(option =>
    option
        .setName("couleur")
        .setDescription("Choisir une couleur")
        .setRequired(true)
        .addChoices(
            { name: "Rouge", value: "red" },
            { name: "Bleu", value: "blue" },
            { name: "Vert", value: "green" }
        )
)
```

### Permissions

#### Permissions par défaut

```typescript
.setDefaultMemberPermissions(0) // Admin uniquement
```

Valeurs possibles :
- `0` : Administrateur uniquement
- `null` : Tout le monde
- `PermissionFlagsBits.KickMembers` : Permission spécifique

#### Vérifier les permissions dans la commande

```typescript
import { PermissionFlagsBits } from "discord.js";

async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
        await interaction.reply({
            content: "Vous n'avez pas la permission d'utiliser cette commande.",
            ephemeral: true
        });
        return;
    }
    
    // Suite de la commande...
}
```

### Réponses

#### Réponse simple

```typescript
await interaction.reply("Message simple");
```

#### Réponse éphémère (visible uniquement par l'utilisateur)

```typescript
await interaction.reply({
    content: "Message privé",
    ephemeral: true
});
```

#### Réponse avec embed

```typescript
import { EmbedBuilder } from "discord.js";

const embed = new EmbedBuilder()
    .setTitle("Titre")
    .setDescription("Description")
    .setColor("#3498db")
    .addFields(
        { name: "Champ 1", value: "Valeur 1", inline: true },
        { name: "Champ 2", value: "Valeur 2", inline: true }
    )
    .setTimestamp();

await interaction.reply({ embeds: [embed] });
```

#### Réponse différée (pour les traitements longs)

```typescript
// Indiquer que le bot traite la commande
await interaction.deferReply();

// Faire le traitement long...
await longProcess();

// Répondre après le traitement
await interaction.editReply("Traitement terminé !");
```

### Sous-commandes

Pour créer des sous-commandes :

```typescript
.addSubcommand(subcommand =>
    subcommand
        .setName("ajouter")
        .setDescription("Ajouter un élément")
        .addStringOption(option =>
            option
                .setName("nom")
                .setDescription("Nom de l'élément")
                .setRequired(true)
        )
)
.addSubcommand(subcommand =>
    subcommand
        .setName("supprimer")
        .setDescription("Supprimer un élément")
        .addStringOption(option =>
            option
                .setName("nom")
                .setDescription("Nom de l'élément")
                .setRequired(true)
        )
)
```

Gérer les sous-commandes dans `execute()` :

```typescript
async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "ajouter") {
        const nom = interaction.options.getString("nom");
        // Logique d'ajout...
    } else if (subcommand === "supprimer") {
        const nom = interaction.options.getString("nom");
        // Logique de suppression...
    }
}
```

## Exemples de commandes

### Commande simple

```typescript
// src/app/commands/ping.ts
import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Répond avec Pong!"),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const ping = interaction.client.ws.ping;
        await interaction.reply(`🏓 Pong! Latence : ${ping}ms`);
    }
};
```

### Commande avec paramètres

```typescript
// src/app/commands/say.ts
import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName("say")
        .setDescription("Fait dire quelque chose au bot")
        .setDefaultMemberPermissions(0)
        .addStringOption(option =>
            option
                .setName("message")
                .setDescription("Le message à envoyer")
                .setRequired(true)
        )
        .addChannelOption(option =>
            option
                .setName("canal")
                .setDescription("Le canal où envoyer le message")
                .setRequired(false)
        ),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const message = interaction.options.getString("message")!;
        const channel = interaction.options.getChannel("canal") || interaction.channel;

        if (channel?.isTextBased()) {
            await channel.send(message);
            await interaction.reply({
                content: "Message envoyé !",
                ephemeral: true
            });
        }
    }
};
```

### Commande avec embed

```typescript
// src/app/commands/info.ts
import { 
    SlashCommandBuilder, 
    ChatInputCommandInteraction,
    EmbedBuilder 
} from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName("info")
        .setDescription("Affiche les informations du serveur"),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const guild = interaction.guild!;

        const embed = new EmbedBuilder()
            .setTitle(`Informations sur ${guild.name}`)
            .setThumbnail(guild.iconURL())
            .setColor("#3498db")
            .addFields(
                { name: "👥 Membres", value: `${guild.memberCount}`, inline: true },
                { name: "📅 Créé le", value: guild.createdAt.toLocaleDateString("fr-FR"), inline: true },
                { name: "👑 Propriétaire", value: `<@${guild.ownerId}>`, inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
```

## Bonnes pratiques

### 1. Validation des entrées

Toujours valider les paramètres avant de les utiliser :

```typescript
const nombre = interaction.options.getInteger("nombre");
if (nombre < 1 || nombre > 100) {
    await interaction.reply({
        content: "Le nombre doit être entre 1 et 100.",
        ephemeral: true
    });
    return;
}
```

### 2. Gestion des erreurs

Entourer le code de try/catch :

```typescript
try {
    // Code de la commande
} catch (error) {
    console.error(error);
    await interaction.reply({
        content: "Une erreur est survenue.",
        ephemeral: true
    });
}
```

### 3. Réponses éphémères pour les erreurs

Les messages d'erreur devraient être éphémères :

```typescript
await interaction.reply({
    content: "❌ Erreur : ...",
    ephemeral: true
});
```

### 4. Defer pour les traitements longs

Si le traitement prend plus de 3 secondes :

```typescript
await interaction.deferReply();
// Traitement long...
await interaction.editReply("Terminé !");
```

### 5. Permissions appropriées

Définir les permissions nécessaires :

```typescript
.setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
```

## Débogage

### Logs

Utiliser le système de logs :

```typescript
import { otterlogs } from "../../otterbots/utils/otterlogs";

otterlogs.debug(`Commande ${interaction.commandName} exécutée par ${interaction.user.tag}`);
```

### Erreurs courantes

1. **"Unknown interaction"** : La réponse a pris plus de 3 secondes → Utiliser `deferReply()`
2. **"Missing permissions"** : Le bot n'a pas les permissions nécessaires
3. **"Command not found"** : La commande n'est pas enregistrée → Redémarrer le bot

## Ressources

- [Documentation Discord.js](https://discord.js.org/)
- [Guide des Slash Commands](https://discordjs.guide/interactions/slash-commands.html)
- [Constructeur de commandes](https://discord.com/developers/docs/interactions/application-commands)
