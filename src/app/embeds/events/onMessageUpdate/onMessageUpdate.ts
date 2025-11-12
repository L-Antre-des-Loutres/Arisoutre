import { EmbedBuilder, Message } from "discord.js";

/**
 * Handles the update event of a message by creating and returning an embed that highlights the differences
 * between the old and updated message, including their content and author details.
 *
 * @param {Message} oldMessage The original message prior to being updated. It contains details such as the content, author, and channel.
 * @param {Message} updatedMessage The updated version of the message, containing its current content and details.
 * @return {EmbedBuilder} An embed object that summarizes the differences between the old and updated messages, including author, content changes, and channel details.
 */
export function embed_onMessageUpdate(oldMessage: Message, updatedMessage: Message): EmbedBuilder {
    // Variables de l'embed
    const oldContent = oldMessage.content?.trim() || "*Aucun contenu (ancien message vide ou embed)*";
    const newContent = updatedMessage.content?.trim() || "*Aucun contenu (nouveau message vide ou embed)*";

    // Construction de l'embed
    return new EmbedBuilder()
        .setAuthor({
            name: `Modification du message de ${oldMessage.author.username}`,
            iconURL: oldMessage.author.displayAvatarURL(),
        })
        .setDescription(
            [
                `**Canal :** ${oldMessage.channel}`,
                "",
                "**Ancien contenu :**",
                `\`\`\`${oldContent.length > 1000 ? oldContent.slice(0, 1000) + "..." : oldContent}\`\`\``,
                "**Nouveau contenu :**",
                `\`\`\`${newContent.length > 1000 ? newContent.slice(0, 1000) + "..." : newContent}\`\`\``
            ].join("\n")
        )
        .setColor("#ffae00")
        .setThumbnail(oldMessage.author.displayAvatarURL())
        .setFooter({ text: process.env.BOT_NAME })
        .setTimestamp();

}
