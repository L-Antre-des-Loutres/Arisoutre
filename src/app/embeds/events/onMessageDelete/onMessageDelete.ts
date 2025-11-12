import {EmbedBuilder, Message} from "discord.js";

/**
 * Handles the creation of an embed to represent a message that has been deleted,
 * including details about the message, its author, the channel, and the executor who deleted it.
 *
 * @param {Message} message - The message object representing the deleted message.
 * @param {{username: string, pdp: string}} executor - An object containing details about the user who deleted the message, including their username and profile picture URL (pdp).
 * @return {Promise<EmbedBuilder>} A promise that resolves to an EmbedBuilder instance containing the formatted message deletion details.
 */
export async function embed_onMessageDelete(message: Message, executor: {username: string, pdp: string}): Promise<EmbedBuilder>  {
    // Variables de l'embed
    const content = message.content?.length ? message.content : "*Contenu non disponible*";

    // Construction de l'embed
    return new EmbedBuilder()
        .setAuthor({
            name: `Message de ${message.author.username} supprimé par ${executor.username}`,
            iconURL: message.author.displayAvatarURL(),
        })
        .setDescription(`**Canal :** ${message.channel}\n**Contenu :**\n\`\`\`${content}\`\`\``)
        .setColor("#f50000")
        .setFooter({ text: process.env.BOT_NAME })
        .setThumbnail(executor.pdp)
        .setTimestamp();
}