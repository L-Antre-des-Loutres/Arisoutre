import { Client, TextChannel, EmbedBuilder } from "discord.js";

export function logsMessage(message: string, title: string, client: Client) {
    const channellogsId = "1254821922462634049";

    // Fait un embed pour le message
    const embed = new EmbedBuilder()
        .setAuthor({ name: `📃 Tâche périodique : ${title}` })
        .setTitle(`Par : **Arisoutre**`)
        .setDescription(message)
        .setColor("#cbcccd")
        .setTimestamp();

    // Envoie le message dans le salon de logs
    const channel = client.channels.cache.get(channellogsId);
    (channel as TextChannel).send({ embeds: [embed] });

}