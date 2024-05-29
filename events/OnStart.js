const { Events, ChannelType } = require('discord.js');
const { categoryName, guildId } = require('../config.json'); // Ajoutez guildId dans votre config.json

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);
        client.user.setActivity('!help');

        // Tableau pour stocker les salons
        const channelsDiscord = [];

        // Stocke l'id de la catégorie
        let category;

        try {

            // Récupère la guild
            const guild = client.guilds.cache.get(guildId);
            if (!guild) {
                console.error('Guild non trouvée');
                return;
            }

            // Récupère la liste des salons et stock la liste dans un tableau
            guild.channels.cache.forEach(channel => {
                console.log(`Fetched channel ${channel.name}`);
                channelsDiscord.push(channel.name);

                // Rajoute l'id de la catégorie dans le tableau
                if (channel.type === ChannelType.GuildCategory) {
                    channelsDiscord.push(channel.name);
                }
            });


            // Vérifie si la catégorie existe déjà
            if (channelsDiscord.includes(categoryName)) {
                console.log(`La catégorie "${categoryName}" existe déjà`);

                // Récupère l'id de la catégorie déjà existante
                category = guild.channels.cache.find(channel => channel.name === categoryName && channel.type === ChannelType.GuildCategory);

            } else {
                // Crée une catégorie
                category = await guild.channels.create({
                    name: categoryName,
                    type: ChannelType.GuildCategory,
                });
                console.log(`Catégorie "${categoryName}" créée !`);
            }

            // Crée des salons à l'intérieur de la catégorie

            // Vérifie si les salons existent déjà
            if (channelsDiscord.includes('logs-global')) {
                console.log(`Le salon "logs-global" existe déjà`);
            } else {
                await guild.channels.create({
                    name: 'logs-global',
                    type: ChannelType.GuildText,
                    parent: category.id,
                });
                console.log(`Salon "logs-global" créé !`);
            }

            if (channelsDiscord.includes('logs-edit')) {
                console.log(`Le salon "logs-edit" existe déjà`);
            } else {
                await guild.channels.create({
                    name: 'logs-edit',
                    type: ChannelType.GuildText,
                    parent: category.id,
                });
                console.log(`Salon "logs-edit" créé !`);
            }

            if (channelsDiscord.includes('logs-suppression')) {
                console.log(`Le salon "logs-suppression" existe déjà`);
            }
            else {
                await guild.channels.create({
                    name: 'logs-suppression',
                    type: ChannelType.GuildText,
                    parent: category.id,
                });
                console.log(`Salon "logs-suppression" créé !`);
            }

            if (channelsDiscord.includes('logs-erreur')) {
                console.log(`Le salon "logs-erreur" existe déjà`);
            }
            else {
                await guild.channels.create({
                    name: 'logs-erreur',
                    type: ChannelType.GuildText,
                    parent: category.id,
                });
                console.log(`Salon "logs-erreur" créé !`);
            }

            if (channelsDiscord.includes('mc-myadmin')) {
                console.log(`Le salon "mc-myadmin" existe déjà`);
            }
            else {
                await guild.channels.create({
                    name: 'mc-myadmin',
                    type: ChannelType.GuildText,
                    parent: category.id,
                });
                console.log(`Salon "mc-myadmin" créé !`);
            }
        } catch (error) {
            console.error(`Erreur lors de la création des salons : ${error}`);
        }
    },
};
