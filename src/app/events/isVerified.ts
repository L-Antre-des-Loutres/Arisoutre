import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    Events,
    GuildMember,
    Message,
    TextChannel
} from "discord.js"
import {otterlogs} from "../../otterbots/utils/otterlogs";
import {OtterPocketBase} from "../../otterbots/utils/pocketbase/pocketbase";
import {UtilisateursDiscordType} from "../types/UtilisateursDiscordType";
import discordConfig from "../../../config/discordConfig.json";

module.exports = {
    name: Events.MessageCreate,
    async execute(message: Message) {
        try {
            // On ne compte pas les messages des bots
            if (message.author.bot) return;

            // On vérifie que les messages proviennent de la guilde
            if (!message.guild) return;

            // On récupére le membre
            const member = message.member ?? await message.guild.members.fetch(message.author.id);

            // On récupére les infos du membre en BDD
            const userInfo = await OtterPocketBase.execByAlias<UtilisateursDiscordType>(
                'otr-utilisateursDiscord-getByDiscordId',
                `discord_id="${member.id}"`
            );

            // Expression régulière pour détecter les liens (http/https)
            const urlRegex = /(https?:\/\/[^\s]+)/g;
            const hasLinks = urlRegex.test(message.content);
            const isVerified = userInfo ? userInfo.is_verified : false;

            // Si l'utilisateur n'est pas vérifié (ou non trouvé en bdd) et qu'il envoie une pièce jointe ou un lien, on supprime son message
            if (!isVerified && (message.attachments.size > 0 || hasLinks)) {
                try {
                    const reason = message.attachments.size > 0 ? "une pièce jointe" : "un lien";
                    
                    // On envoie une trace dans le salon de modération avant suppression
                    const modChannelId = discordConfig.channels.moderators;
                    if (modChannelId) {
                        try {
                            const modChannel = await message.client.channels.fetch(modChannelId) as TextChannel;
                            if (modChannel) {
                                const logEmbed = new EmbedBuilder()
                                    .setColor("#ED4245")
                                    .setTitle("🛡️ Contenu bloqué (Non vérifié)")
                                    .setDescription(`Un utilisateur non vérifié a tenté de poster ${reason}.`)
                                    .addFields(
                                        { name: "👤 Utilisateur", value: `${member.user.tag} (${member.id})`, inline: true },
                                        { name: "📅 Date", value: `<t:${Math.floor(message.createdTimestamp / 1000)}:F>`, inline: true },
                                        { name: "📝 Contenu du message", value: message.content || "*Message vide (uniquement pièce jointe)*" }
                                    )
                                    .setFooter({ text: "Système de Sécurité • L'Antre des Loutres" })
                                    .setTimestamp();

                                await modChannel.send({ embeds: [logEmbed] });
                            }
                        } catch (logError) {
                            otterlogs.error(`Erreur lors de l'envoi du log de modération: ${logError}`);
                        }
                    }

                    await message.delete();
                    otterlogs.debug(`Message avec ${reason} de l'utilisateur non vérifié ${member.user.tag} supprimé.`);
                    
                    // On envoie l'embed de vérification
                    await activateUserVerification(member);
                } catch (deleteError) {
                    otterlogs.error(`Impossible de supprimer le message de ${member.user.tag}: ${deleteError}`);
                }
                return;
            }

            if (!userInfo) {
                otterlogs.debug(`Utilisateur ${member.user.tag} non trouvé en base de données.`);
                return;
            }

            // On peut maintenant utiliser userInfo


        } catch (error) {
            otterlogs.error(`Erreur dans isVerified.ts: ${error}`);
        }
    }
};

/**
 * Fonction pour envoyer l'embed de vérification à un utilisateur.
 * 
 * @param member Le membre Discord à qui envoyer l'embed.
 */
async function activateUserVerification(member: GuildMember) {
    try {
        const embed = new EmbedBuilder()
            .setColor("#0099ff")
            .setTitle("🔒 Vérification Requise")
            .setDescription(`${member} ! Avant de pouvoir partager des liens ou des images avec la communauté de **${member.guild.name}**, merci de bien vouloir valider votre compte via l'étape de vérification.`)
            .addFields({
                name: "Pourquoi se vérifier ?",
                value: "La vérification permet de protéger le serveur contre le spam et de s'assurer que vous avez pris connaissance des règles."
            })
            .setFooter({ text: `${process.env.BOT_NAME} • Système de vérification` })
            .setTimestamp();

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('verify_user_button')
                    .setLabel('Se vérifier')
                    .setStyle(ButtonStyle.Success)
            );

        try {
            await member.send({
                embeds: [embed],
                components: [row]
            });
            otterlogs.log(`Embed de vérification envoyé en MP à ${member.user.tag}.`);
        } catch (error) {
            otterlogs.warn(`Impossible d'envoyer l'embed de vérification en MP à ${member.user.tag} (DMs fermés): ${error}`);
        }

    } catch (error) {
        otterlogs.error(`Erreur lors de l'envoi de la vérification pour ${member.user.tag}: ${error}`);
    }
}
