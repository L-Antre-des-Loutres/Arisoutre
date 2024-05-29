const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.MessageDelete,
    async execute(message) {

        // Vérifie si le message a été édité par un bot
        if (message.author.bot) return;

        // Déclaration des variables
        const messageChannel = message.channel.name;

        // Récupérer le message supprimé
        const deletedMessage = message.content;

        const user = message.author.tag;
        const userPdp = message.author.displayAvatarURL({ dynamic: true });

        // Récupère le salon de logs dans lequel envoyer le message
        const channelName = '🍜logs-edit-suppression';
        const channel = message.guild.channels.cache.find(ch => ch.name === channelName);

        // Vérifie si les variables sont définies
        if (!channel) return console.error(`Channel ${channelName} non trouvé`);

        try {

            // Crée un embed pour le message édité
            const embed = new EmbedBuilder()
                .setAuthor({
                    name: `Suppression d'un message dans le salon : ${messageChannel} `,
                })
                .setTitle(`Par l'utilisateur : **${user}** `)
                .setDescription(`Message supprimé :\n\`\`\`\n${deletedMessage}\n\`\`\``)
                .setThumbnail(userPdp)
                .setColor("#f50000")
                .setFooter({
                    text: "Arisoutre",
                })
                .setTimestamp();

            await channel.send({ embeds: [embed] });
        }
        catch (error) {
            console.error(`Impossible d'envoyer le message : ${error}`);
        }
    }
};