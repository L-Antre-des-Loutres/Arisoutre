const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.MessageUpdate,
    async execute(message) {

        // VÃ©rifie si le message a Ã©tÃ© Ã©ditÃ© par un bot
        if (message.author.bot) return;

        // DÃ©claration des variables
        const messageContent = await message.fetch()
        const messageChannel = message.channel.name;
        const oldMessage = message.content;
        const user = message.author.tag;
        const userPdp = message.author.displayAvatarURL({ dynamic: true });

        // RÃ©cupÃ¨re le salon de logs dans lequel envoyer le message
        const channelName = 'ðŸœlogs-edit-suppression';
        const channel = message.guild.channels.cache.find(ch => ch.name === channelName);

        // VÃ©rifie si les variables sont dÃ©finies
        if (!oldMessage) return console.error(`Message ${message.id} non trouvÃ©`);
        if (!channel) return console.error(`Channel ${channelName} non trouvÃ©`);

        try {

            // CrÃ©e un embed pour le message Ã©ditÃ©
            const embed = new EmbedBuilder()
                .setAuthor({
                    name: `Edit de message dans le salon : ${messageChannel} `,
                })
                .setTitle(`Par l'utilisateur : **${user}** `)
                .setDescription(`Message avant Ã©dition :\n\`\`\`\n${oldMessage}\n\`\`\`\nMessage aprÃ¨s Ã©dition :\n\`\`\`\n${messageContent}\n\`\`\``)
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