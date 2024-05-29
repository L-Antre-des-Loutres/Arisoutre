const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.MessageUpdate,
    async execute(message) {

        // Vérifie si le message a été édité par un bot
        if (message.author.bot) return;

        // Déclaration des variables
        const oldMessage = await message.fetch()
        const messageChannel = message.channel.name;
        const messageContent = message.content;
        const user = message.author.tag;
        const userPdp = message.author.displayAvatarURL({ dynamic: true });

        // Récupère le salon de logs dans lequel envoyer le message
        const channelName = '🍜logs-edit-suppression';
        const channel = message.guild.channels.cache.find(ch => ch.name === channelName);

        // Vérifie si les variables sont définies
        if (!oldMessage) return console.error(`Message ${message.id} non trouvé`);
        if (!channel) return console.error(`Channel ${channelName} non trouvé`);

        try {

            // Crée un embed pour le message édité
            const embed = new EmbedBuilder()
                .setAuthor({
                    name: `Edit de message dans le salon : ${messageChannel} `,
                })
                .setTitle(`Par l'utilisateur : **${user}** `)
                .setDescription(`Message avant édition :\n\`\`\`\n${oldMessage}\n\`\`\`\nMessage après édition :\n\`\`\`\n${messageContent}\n\`\`\``)
                .setThumbnail(userPdp)
                .setColor("#cbcccd")
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