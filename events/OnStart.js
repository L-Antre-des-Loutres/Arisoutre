const { Events, ChannelType, PermissionFlagsBits, Colors } = require('discord.js');
const { categoryName, guildId, roleName } = require('../config.json'); // Ajoutez roleName dans votre config.json

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);
        client.user.setActivity('!help');

        // Noms des salons à créer
        const channelNames = [
            'logs-global',
            'logs-edit',
            'logs-suppression',
            'logs-erreur',
            'mc-myadmin',
        ];

        // Tableau pour stocker les noms des salons existants
        const channelsDiscord = [];

        try {
            // Récupère la guild
            const guild = client.guilds.cache.get(guildId);
            if (!guild) {
                console.error('Guild non trouvée');
                return;
            }

            // Récupère la liste des salons et stocke les noms dans un tableau
            guild.channels.cache.forEach(channel => {
                channelsDiscord.push(channel.name);
            });

            // Vérifie si le rôle existe déjà
            let role = guild.roles.cache.find(r => r.name === roleName);
            if (!role) {
                // Crée un rôle spécifique
                role = await guild.roles.create({
                    name: roleName,
                    color: Colors.Blue,
                    reason: 'Role spécifique pour la catégorie',
                });
                console.log(`Rôle "${roleName}" créé !`);
            } else {
                console.log(`Le rôle "${roleName}" existe déjà`);
            }

            // Vérifie si la catégorie existe déjà
            let category = guild.channels.cache.find(channel => channel.name === categoryName && channel.type === ChannelType.GuildCategory);

            if (category) {
                console.log(`La catégorie "${categoryName}" existe déjà`);
            } else {
                // Crée une catégorie avec les permissions pour le rôle spécifique
                category = await guild.channels.create({
                    name: categoryName,
                    type: ChannelType.GuildCategory,
                    permissionOverwrites: [
                        {
                            id: guild.id, // ID du serveur
                            deny: [PermissionFlagsBits.ViewChannel], // Interdire la vue des salons à tout le monde par défaut
                        },
                        {
                            id: role.id, // ID du rôle spécifique
                            allow: [PermissionFlagsBits.ViewChannel], // Autoriser la vue des salons pour le rôle spécifique
                        },
                    ],
                });
                console.log(`Catégorie "${categoryName}" créée avec les permissions !`);
            }

            // Crée des salons à l'intérieur de la catégorie avec les mêmes permissions
            for (const channelName of channelNames) {
                if (channelsDiscord.includes(channelName)) {
                    console.log(`Le salon "${channelName}" existe déjà`);
                } else {
                    await guild.channels.create({
                        name: channelName,
                        type: ChannelType.GuildText,
                        parent: category.id,
                        permissionOverwrites: [
                            {
                                id: guild.id,
                                deny: [PermissionFlagsBits.ViewChannel],
                            },
                            {
                                id: role.id,
                                allow: [PermissionFlagsBits.ViewChannel],
                            },
                        ],
                    });
                    console.log(`Salon "${channelName}" créé !`);
                }
            }
        } catch (error) {
            console.error(`Erreur lors de la création des salons : ${error}`);
        }
    },
};
