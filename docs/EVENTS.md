# Événements - Arisoutre

## Vue d'ensemble

Les événements Discord permettent au bot de réagir aux actions qui se produisent sur le serveur. Arisoutre utilise le système d'événements de Discord.js pour gérer les interactions des utilisateurs.

## Événements disponibles

### Événements de membres

#### `GuildMemberAdd`

Déclenché lorsqu'un nouveau membre rejoint le serveur.

**Fichier :** `src/app/events/GuildMemberAdd.ts`

**Fonctionnalités :**
- Message de bienvenue personnalisé
- Attribution de rôles automatiques
- Enregistrement dans la base de données
- Logs dans le canal de modération

**Exemple d'utilisation :**
```typescript
export default {
    name: "guildMemberAdd",
    once: false,
    async execute(member: GuildMember) {
        // Envoyer un message de bienvenue
        const welcomeChannel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
        if (welcomeChannel?.isTextBased()) {
            const embed = await welcomeEmbed(member);
            await welcomeChannel.send({ embeds: [embed] });
        }
    }
};
```

---

#### `GuildMemberRemove`

Déclenché lorsqu'un membre quitte le serveur.

**Fichier :** `src/app/events/GuildMemberRemove.ts`

**Fonctionnalités :**
- Message d'au revoir
- Logs de départ
- Mise à jour de la base de données
- Statistiques de rétention

---

### Événements de messages

#### `OnMessageDelete`

Déclenché lorsqu'un message est supprimé.

**Fichier :** `src/app/events/OnMessageDelete.ts`

**Fonctionnalités :**
- Logs de suppression dans le canal de modération
- Sauvegarde du contenu du message
- Identification de l'auteur de la suppression
- Horodatage de la suppression

**Embed généré :**
- Auteur du message
- Contenu du message supprimé
- Canal où le message a été supprimé
- Date et heure de suppression

---

#### `OnMessageUpdate`

Déclenché lorsqu'un message est modifié.

**Fichier :** `src/app/events/OnMessageUpdate.ts`

**Fonctionnalités :**
- Logs de modification
- Comparaison avant/après
- Détection de modifications suspectes
- Horodatage

**Embed généré :**
- Auteur du message
- Ancien contenu
- Nouveau contenu
- Lien vers le message

---

#### `MessageCount`

Déclenché à chaque message envoyé.

**Fichier :** `src/app/events/MessageCount.ts`

**Fonctionnalités :**
- Comptage des messages par utilisateur
- Statistiques d'activité
- Détection de spam
- Système de niveaux (optionnel)

---

### Événements vocaux

#### `voiceStateUpdate`

Déclenché lorsqu'un utilisateur change d'état vocal.

**Fichier :** `src/app/events/voiceStateUpdate.ts`

**Fonctionnalités :**
- Détection de connexion/déconnexion
- Gestion des salons temporaires
- Logs d'activité vocale
- Statistiques de temps vocal

**États détectés :**
- Connexion à un salon vocal
- Déconnexion d'un salon vocal
- Changement de salon
- Activation/désactivation du micro
- Activation/désactivation de la caméra
- Partage d'écran

---

### Événements du bot

#### `clientReady`

Déclenché lorsque le bot est prêt et connecté.

**Fichier :** `src/otterbots/events/clientReady.ts`

**Fonctionnalités :**
- Affichage du logo ASCII
- Initialisation des modules
- Chargement des commandes
- Configuration de l'activité

**Actions effectuées :**
1. Affichage du logo avec Figlet
2. Chargement des commandes slash
3. Initialisation d'OtterGuard
4. Démarrage des tâches planifiées
5. Logs de démarrage

---

#### `interactionCreate`

Déclenché lorsqu'une interaction est créée (commande, bouton, menu, etc.).

**Fichier :** `src/otterbots/events/commandInteraction.ts`

**Fonctionnalités :**
- Routage des commandes slash
- Gestion des boutons
- Gestion des menus déroulants
- Gestion des modals

**Types d'interactions gérées :**
- `ChatInputCommand` : Commandes slash
- `Button` : Boutons cliquables
- `SelectMenu` : Menus déroulants
- `Modal` : Formulaires modaux

---

#### `emoteReact`

Événement personnalisé pour les réactions emoji.

**Fichier :** `src/otterbots/events/emoteReact.ts`

**Fonctionnalités :**
- Réactions automatiques sur certains messages
- Système de rôles par réaction
- Sondages interactifs
- Validation de messages

---

## Création d'événements personnalisés

### Structure d'un événement

Pour créer un nouvel événement, créez un fichier dans `src/app/events/` :

```typescript
import { Events } from "discord.js";

export default {
    name: Events.EventName, // Nom de l'événement Discord
    once: false, // true si l'événement ne doit se déclencher qu'une fois
    async execute(...args: any[]) {
        // Logique de l'événement
    }
};
```

### Événements Discord.js disponibles

#### Événements de serveur

```typescript
Events.GuildCreate        // Bot ajouté à un serveur
Events.GuildDelete        // Bot retiré d'un serveur
Events.GuildUpdate        // Serveur mis à jour
Events.GuildUnavailable   // Serveur indisponible
```

#### Événements de membres

```typescript
Events.GuildMemberAdd     // Membre rejoint
Events.GuildMemberRemove  // Membre quitte
Events.GuildMemberUpdate  // Membre mis à jour
Events.GuildMemberAvailable // Membre disponible
```

#### Événements de messages

```typescript
Events.MessageCreate      // Message créé
Events.MessageDelete      // Message supprimé
Events.MessageUpdate      // Message modifié
Events.MessageBulkDelete  // Messages supprimés en masse
```

#### Événements de réactions

```typescript
Events.MessageReactionAdd    // Réaction ajoutée
Events.MessageReactionRemove // Réaction retirée
Events.MessageReactionRemoveAll // Toutes réactions retirées
```

#### Événements de rôles

```typescript
Events.GuildRoleCreate    // Rôle créé
Events.GuildRoleDelete    // Rôle supprimé
Events.GuildRoleUpdate    // Rôle mis à jour
```

#### Événements de canaux

```typescript
Events.ChannelCreate      // Canal créé
Events.ChannelDelete      // Canal supprimé
Events.ChannelUpdate      // Canal mis à jour
```

#### Événements vocaux

```typescript
Events.VoiceStateUpdate   // État vocal changé
```

#### Événements d'interactions

```typescript
Events.InteractionCreate  // Interaction créée
```

#### Événements du bot

```typescript
Events.ClientReady        // Bot prêt
Events.Error              // Erreur
Events.Warn               // Avertissement
Events.Debug              // Debug
```

### Exemple : Événement de bienvenue

```typescript
// src/app/events/GuildMemberAdd.ts
import { Events, GuildMember, EmbedBuilder } from "discord.js";

export default {
    name: Events.GuildMemberAdd,
    once: false,
    async execute(member: GuildMember) {
        // Canal de bienvenue
        const welcomeChannel = member.guild.channels.cache.get(
            process.env.WELCOME_CHANNEL_ID!
        );

        if (!welcomeChannel?.isTextBased()) return;

        // Créer l'embed de bienvenue
        const embed = new EmbedBuilder()
            .setTitle(`Bienvenue ${member.user.username} ! 🎉`)
            .setDescription(`Bienvenue sur **${member.guild.name}** !`)
            .setThumbnail(member.user.displayAvatarURL())
            .setColor("#2ecc71")
            .addFields(
                { 
                    name: "Membre n°", 
                    value: `${member.guild.memberCount}`, 
                    inline: true 
                },
                { 
                    name: "Compte créé le", 
                    value: member.user.createdAt.toLocaleDateString("fr-FR"), 
                    inline: true 
                }
            )
            .setTimestamp();

        // Envoyer le message
        await welcomeChannel.send({ 
            content: `${member}`, 
            embeds: [embed] 
        });

        // Attribuer un rôle par défaut
        const defaultRole = member.guild.roles.cache.get(
            process.env.DEFAULT_ROLE_ID!
        );
        if (defaultRole) {
            await member.roles.add(defaultRole);
        }
    }
};
```

### Exemple : Logs de messages supprimés

```typescript
// src/app/events/OnMessageDelete.ts
import { Events, Message, EmbedBuilder } from "discord.js";

export default {
    name: Events.MessageDelete,
    once: false,
    async execute(message: Message) {
        // Ignorer les messages du bot
        if (message.author?.bot) return;

        // Canal de logs
        const logChannel = message.guild?.channels.cache.get(
            process.env.MODERATION_CHANNEL_ID!
        );

        if (!logChannel?.isTextBased()) return;

        // Créer l'embed de log
        const embed = new EmbedBuilder()
            .setTitle("🗑️ Message supprimé")
            .setColor("#e74c3c")
            .addFields(
                { 
                    name: "Auteur", 
                    value: `${message.author}`, 
                    inline: true 
                },
                { 
                    name: "Canal", 
                    value: `${message.channel}`, 
                    inline: true 
                },
                { 
                    name: "Contenu", 
                    value: message.content || "*Aucun contenu texte*" 
                }
            )
            .setTimestamp();

        // Ajouter les pièces jointes si présentes
        if (message.attachments.size > 0) {
            const attachments = message.attachments
                .map(a => a.url)
                .join("\n");
            embed.addFields({ 
                name: "Pièces jointes", 
                value: attachments 
            });
        }

        await logChannel.send({ embeds: [embed] });
    }
};
```

### Exemple : Système de niveaux

```typescript
// src/app/events/MessageCount.ts
import { Events, Message } from "discord.js";

// Map pour éviter le spam
const cooldowns = new Map<string, number>();

export default {
    name: Events.MessageCreate,
    once: false,
    async execute(message: Message) {
        // Ignorer les bots
        if (message.author.bot) return;

        // Vérifier le cooldown (1 message par minute)
        const userId = message.author.id;
        const now = Date.now();
        const cooldownAmount = 60 * 1000; // 1 minute

        if (cooldowns.has(userId)) {
            const expirationTime = cooldowns.get(userId)! + cooldownAmount;
            if (now < expirationTime) return;
        }

        cooldowns.set(userId, now);

        // Ajouter de l'XP (exemple avec API)
        try {
            // Logique d'ajout d'XP...
            console.log(`XP ajouté pour ${message.author.tag}`);
        } catch (error) {
            console.error("Erreur lors de l'ajout d'XP:", error);
        }
    }
};
```

## Gestion des embeds

### Créer un embed réutilisable

Créez vos templates d'embeds dans `src/app/embeds/` :

```typescript
// src/app/embeds/events/guildMemberAdd/welcomeEmbed.ts
import { EmbedBuilder, GuildMember } from "discord.js";

export async function welcomeEmbed(member: GuildMember): Promise<EmbedBuilder> {
    return new EmbedBuilder()
        .setTitle(`Bienvenue ${member.user.username} ! 🎉`)
        .setDescription(`Bienvenue sur **${member.guild.name}** !`)
        .setThumbnail(member.user.displayAvatarURL())
        .setColor(process.env.BOT_COLOR || "#3498db")
        .addFields(
            { name: "Membre n°", value: `${member.guild.memberCount}`, inline: true },
            { name: "Compte créé", value: member.user.createdAt.toLocaleDateString("fr-FR"), inline: true }
        )
        .setFooter({ text: process.env.BOT_NAME || "Arisoutre" })
        .setTimestamp();
}
```

Utilisation dans l'événement :

```typescript
import { welcomeEmbed } from "../embeds/events/guildMemberAdd/welcomeEmbed";

const embed = await welcomeEmbed(member);
await channel.send({ embeds: [embed] });
```

## Bonnes pratiques

### 1. Gestion des erreurs

Toujours entourer le code d'un try/catch :

```typescript
async execute(...args: any[]) {
    try {
        // Code de l'événement
    } catch (error) {
        console.error(`Erreur dans l'événement ${this.name}:`, error);
    }
}
```

### 2. Vérifications de sécurité

Vérifier que les objets existent avant de les utiliser :

```typescript
if (!message.guild) return; // Message en DM
if (!message.member) return; // Membre introuvable
if (message.author.bot) return; // Ignorer les bots
```

### 3. Optimisation

Utiliser le cache quand possible :

```typescript
// ✅ Bon - utilise le cache
const channel = guild.channels.cache.get(channelId);

// ❌ Éviter - fait une requête API
const channel = await guild.channels.fetch(channelId);
```

### 4. Cooldowns

Implémenter des cooldowns pour éviter le spam :

```typescript
const cooldowns = new Map<string, number>();

// Dans l'événement
const userId = user.id;
const now = Date.now();
const cooldownAmount = 5000; // 5 secondes

if (cooldowns.has(userId)) {
    const expirationTime = cooldowns.get(userId)! + cooldownAmount;
    if (now < expirationTime) return;
}

cooldowns.set(userId, now);
```

### 5. Logs appropriés

Utiliser le système de logs :

```typescript
import { otterlogs } from "../../otterbots/utils/otterlogs";

otterlogs.info(`Nouveau membre: ${member.user.tag}`);
otterlogs.warn(`Message supprimé dans #${channel.name}`);
otterlogs.error(`Erreur dans l'événement: ${error}`);
```

## Débogage

### Activer les logs de debug

Dans votre `.env` :

```env
NODE_ENV=dev
```

### Événement de debug

Créer un événement pour logger tous les événements :

```typescript
// src/app/events/Debug.ts
import { Events } from "discord.js";

export default {
    name: Events.Debug,
    once: false,
    execute(info: string) {
        if (process.env.NODE_ENV === "dev") {
            console.log(`[DEBUG] ${info}`);
        }
    }
};
```

## Ressources

- [Documentation Discord.js - Events](https://discord.js.org/#/docs/discord.js/main/class/Client)
- [Guide Discord.js - Events](https://discordjs.guide/creating-your-bot/event-handling.html)
- [Liste complète des événements](https://discord.js.org/#/docs/discord.js/main/class/Client?scrollTo=e-applicationCommandPermissionsUpdate)
