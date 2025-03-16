import { Client, TextChannel, EmbedBuilder, ColorResolvable } from "discord.js";

export function logsMessage(title: string, message: string, client: Client, color: string = "#cbcccd") {
    const channellogsId = "1254821922462634049";

    // Fait un embed pour le message
    const embed = new EmbedBuilder()
        .setAuthor({ name: `${title}` })
        .setTitle(`Par : **Arisoutre**`)
        .setDescription(message)
        .setColor(color as ColorResolvable)
        .setTimestamp();

    // Envoie le message dans le salon de logs
    const channel = client.channels.cache.get(channellogsId);
    (channel as TextChannel).send({ embeds: [embed] });

}