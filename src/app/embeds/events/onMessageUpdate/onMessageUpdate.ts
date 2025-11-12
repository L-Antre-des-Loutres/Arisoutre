import { EmbedBuilder, Message } from "discord.js";

export function embed_onMessageUpdate(oldMessage: Message, updatedMessage: Message): EmbedBuilder {
    const oldContent = oldMessage.content?.trim() || "*Aucun contenu (ancien message vide ou embed)*";
    const newContent = updatedMessage.content?.trim() || "*Aucun contenu (nouveau message vide ou embed)*";

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
        .setFooter({ text: "Arisoutre" })
        .setTimestamp();

}
