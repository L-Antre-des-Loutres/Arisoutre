import { Client, TextChannel, EmbedBuilder, ColorResolvable } from "discord.js";

export function logsMessage(title: string, message: string, client: Client, color: string = "#cbcccd") {

    // Fait un embed pour le message
    const embed = new EmbedBuilder()
        .setAuthor({ name: `${title}` })
        .setTitle(`Par : **Arisoutre**`)
        .setDescription(message)
        .setColor(color as ColorResolvable)
        .setTimestamp();

    // Envoie le message dans le salon de logs
    const channel = client.channels.cache.get(process.env.GLOBAL_LOGS) as TextChannel;
    (channel).send({ embeds: [embed] });

}