import {Collection, ColorResolvable, EmbedBuilder, Events, Message, TextChannel} from "discord.js"
import {errorLogs} from "../utils/message/logs/errorLogs"

export function embedModeration(title: string, message: string, color: ColorResolvable = "#f51302") {
    return new EmbedBuilder()
        .setTitle(title)
        .setDescription(message)
        .setColor(color)
        .setTimestamp()
}

const userMessages = new Map<string, number[]>();

export default {
    name: Events.MessageCreate,
    async execute(message: Message) {
        try {
            if (message.author.bot) return; // Ignorer les bots

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

            // ---------------- Anti-raid ----------------
            const spamConfig = {
                maxMessages: 5,     // Nombre de messages max
                interval: 10000,    // Intervalle en ms (10 secondes)
                muteTime: 60000     // Durée du mute en ms (1 minute)
            };

            // Map globale pour stocker les messages des utilisateurs
            const userMessages = new Map<string, number[]>();

            const now = Date.now();
            const authorId = message.author.id;

            if (!userMessages.has(authorId)) {
                userMessages.set(authorId, []);
            }

            let authorMessages = userMessages.get(authorId)!;

            // Filtrer les messages trop vieux
            authorMessages = authorMessages.filter(ts => now - ts <= spamConfig.interval);

            // Ajouter le message actuel
            authorMessages.push(now);
            userMessages.set(authorId, authorMessages);

            // Vérifier le spam
            if (authorMessages.length > spamConfig.maxMessages) {
                const channel = message.channel as TextChannel;

                // Réinitialiser immédiatement pour éviter plusieurs triggers
                userMessages.delete(authorId);

                // Timeout l'utilisateur
                await message.member?.timeout(spamConfig.muteTime, "Spam détecté");

                // Supprimer tous les messages récents de l'utilisateur dans le salon
                try {
                    let hasMore = true;
                    while (hasMore) {
                        const fetchedMessages = await channel.messages.fetch({ limit: 100 });
                        const messagesToDelete = fetchedMessages.filter(m => m.author.id === authorId);
                        if (messagesToDelete.size > 0) {
                            await channel.bulkDelete(messagesToDelete, true);
                        } else {
                            hasMore = false;
                        }
                    }
                } catch (err) {
                    console.error("Impossible de supprimer les messages spam :", err);
                }

                // Envoyer **une seule notification** dans le salon
                await channel.send({
                    embeds: [embedModeration(
                        "Anti-spam",
                        `${message.author.username}, vous envoyez trop de messages rapidement. Vous avez été timeout pendant 1 minute.`
                    )]
                });

                // Envoyer dans le salon de modération
                const modChannel = message.guild?.channels.cache.get("1112707644512288791") as TextChannel | undefined;
                if (modChannel?.isTextBased()) {
                    modChannel.send({
                        embeds: [embedModeration(
                            "Modération - Anti-spam",
                            `Spam détecté de ${message.author.username} (${authorId}) dans le salon <#${channel.id}>.\nL'utilisateur a été timeout pendant 1 minute.`
                        )]
                    });
                }
            }

        } catch (error) {
            console.error(`❌ Impossible d'exécuter l\'événement OnMessageCreate : ${error}`)
            errorLogs("Erreur lors de l'événement OnMessageCreate", `👤 tag : ${message.author.username} (ID: ${message.author.id}) \n ${error}`, message.client)
        }
    },
}