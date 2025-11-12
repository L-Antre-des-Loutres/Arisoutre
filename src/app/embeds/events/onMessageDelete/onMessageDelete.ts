import {EmbedBuilder, Message} from "discord.js";

export async function embed_onMessageDelete(message: Message, executor: {username: string, pdp: string}): Promise<EmbedBuilder>  {
    // Contenu sécurisé du message
    const content = message.content?.length ? message.content : "*Contenu non disponible*";

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