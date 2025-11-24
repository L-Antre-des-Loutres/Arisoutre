import { Events, Message, TextChannel, AuditLogEvent } from "discord.js";
import { otterlogs } from "../../otterbots/utils/otterlogs";
import channels from "../../../build/channelsConfig.json";
import {embed_onMessageDelete} from "../embeds/events/onMessageDelete/onMessageDelete";

// Cache simple pour relier un message supprimé à son exécuteur
const deletionCache = new Map<string, string>();

module.exports = {
    name: Events.MessageDelete,
    async execute(message: Message) {
        if (!message.author || message.author.bot) return;

        const {channels: { log_message: logMessageChannelID },} = channels;
        const guild = message.guild;
        if (!guild) return;

        try {
            // Récupération du salon de log
            const logMessageChannel = (guild.channels.cache.get(logMessageChannelID) as TextChannel) ||
                await guild.channels.fetch(logMessageChannelID) as TextChannel;

            if (!logMessageChannel) {
                otterlogs.error("Unable to retrieve log message channel");
                return;
            }

            await new Promise(r => setTimeout(r, 1500));
            // Récupération des logs d'audit
            const fetchedLogs = await guild.fetchAuditLogs({
                limit: 1,
                type: AuditLogEvent.MessageDelete,
            }).catch(console.error);

            const auditEntry = fetchedLogs?.entries.first();

            // Déterminer l'auteur de la suppression
            const executor = {username: '', pdp: ''};

            if (auditEntry && Date.now() - (auditEntry.createdTimestamp ?? 0) < 20000) {
                executor.username = auditEntry.executor?.username || "Inconnu";
                executor.pdp = auditEntry.executor?.displayAvatarURL() || "https://cdn.discordapp.com/embed/avatars/0.png";
            } else if (deletionCache.has(message.id)) {
                // Si on a un cache depuis l'événement GuildAuditLogEntryCreate
                executor.username = deletionCache.get(message.id)!;
                executor.pdp = "https://cdn.discordapp.com/embed/avatars/0.png";
            } else {
                executor.username = message.author.username;
                executor.pdp = message.author.displayAvatarURL();
            }

            // Création de l'embed
            await logMessageChannel.send({ embeds: [await embed_onMessageDelete(message, executor)] });
        } catch (error) {
            otterlogs.error(`Erreur lors de l'événement MessageDelete 👤 tag : ${message.author.username} (ID: ${message.author.id})\n${error}`);
        }
    },
};
