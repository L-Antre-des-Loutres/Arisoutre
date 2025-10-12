import {Collection, ColorResolvable, EmbedBuilder, Events, Message, TextChannel} from "discord.js"
import {errorLogs} from "../utils/message/logs/errorLogs"

export function embedModeration(title: string, message: string, color: ColorResolvable = "#f51302") {
    return new EmbedBuilder()
        .setTitle(title)
        .setDescription(message)
        .setColor(color)
        .setTimestamp()
}

// Collection pour stocker les messages récents par utilisateur
const messageRate = new Collection<string, { count: number; last: number }>();

// Paramètres du système anti-spam / raid
const LIMIT = 6; // Nombre de messages maximum avant sanction
const TIME_WINDOW = 7000; // Temps en millisecondes avant reset du compteur
const TIMEOUT_DURATION = 10 * 60 * 1000; // 10 minutes de timeout

export default {
    name: Events.MessageCreate,
    async execute(message: Message) {
        try {
            if (message.author.bot) return

            // Convertir le contenu du message en minuscules
            const messageContent = message.content.toLowerCase()

            const author = message.author.id
            const authorUsername = message.author.username

            // ---------------- Lien d'invitation Discord ----------------
            // Vérifier si le message contient un lien d'invitation Discord
            if (messageContent.includes("discord.gg/") || messageContent.includes("discordapp.com/invite/")) {
                // Timeout l'utilisateur pendant 1 minute (60000 ms)
                await message.member?.timeout(60000, "Publication d'un lien d'invitation Discord")
                // Supprimer le message
                await message.delete()

                // Envoyer un message dans le salon où le message a été posté
                const channelUser = message.channel as TextChannel
                await channelUser.send({
                    embeds: [embedModeration(
                        "Interdiction de liens Discord",
                        `${authorUsername}, vous n'avez pas le droit de poster des invitations vers d'autres serveurs Discord.`
                    )]
                })

                // Envoyer un message dans le salon de modération
                const channel = message.guild?.channels.cache.find(
                    (ch) => ch.id === "1112707644512288791" && ch instanceof TextChannel
                ) as TextChannel | undefined

                if (channel?.isTextBased()) {
                    channel.send({
                        embeds: [embedModeration(
                            "Modération - Lien d'invitation Discord",
                            `Un lien d'invitation Discord a été posté par ${authorUsername} (${author}) dans le salon <#${message.channel.id}>.\nL'utilisateur a été timeout pendant 1 minute.`
                        )]
                    })
                }
            }

            // ---------------- Système anti-spam / raid ----------------
            const now = Date.now();
            const userData = messageRate.get(author) || { count: 0, last: now };

            // Réinitialise le compteur si le dernier message est ancien
            if (now - userData.last > TIME_WINDOW) {
                userData.count = 0;
            }

            userData.count++;
            userData.last = now;
            messageRate.set(author, userData);

            // Si trop de messages envoyés trop rapidement
            if (userData.count >= LIMIT) {
                try {
                    await message.member?.timeout(TIMEOUT_DURATION, "Spam détecté (système anti-raid)");
                    await message.delete();

                    const channelUser = message.channel as TextChannel;
                    await channelUser.send({
                        embeds: [
                            embedModeration(
                                "Système Anti-Raid",
                                `${authorUsername} a été temporairement mute pour spam excessif.`
                            )
                        ]
                    });

                    const logChannel = message.guild?.channels.cache.find(
                        (ch) => ch.id === "1112707644512288791" && ch instanceof TextChannel
                    ) as TextChannel | undefined;

                    if (logChannel?.isTextBased()) {
                        logChannel.send({
                            embeds: [
                                embedModeration(
                                    "Modération - Anti-Raid",
                                    `⚠️ **${authorUsername}** (\`${author}\`) a été mute pendant 10 minutes pour spam (trop de messages envoyés en peu de temps).`
                                )
                            ]
                        });
                    }

                    // Réinitialise le compteur après sanction
                    messageRate.delete(author);
                } catch (err) {
                    console.error("Erreur lors de la gestion du spam :", err);
                }
            }

        } catch (error) {
            console.error(`❌ Impossible d'exécuter l\'événement OnMessageCreate : ${error}`)
            errorLogs("Erreur lors de l'événement OnMessageCreate", `👤 tag : ${message.author.username} (ID: ${message.author.id}) \n ${error}`, message.client)
        }
    },
}