import {getClient} from "../index";
import {otterlogs} from "../../otterbots/utils/otterlogs";
import {roles} from "../../../config/discordConfig.json";

const GUILD_ID = process.env.DISCORD_GUILD_ID; // L'Antre des Loutres

export function purgeRole() {
    // On récupére le client du bot
    const client = getClient()

    client.once('clientReady', async () => {
        if (!client.user) {
            console.error('Client user is not defined.');
            return;
        }

        const guild = client.guilds.cache.get(GUILD_ID);

        if (!guild) {
            otterlogs.error(`Guild ${GUILD_ID} not found`);
            return;
        }

            try {
                // On récupère tous les membres de la guilde
                const members = await guild.members.fetch();

                for (const member of members.values()) {
                    // On ne traite pas les bots
                    if (member.user.bot) continue;

                    // On récupére les roles de l'utilisateur
                    const userRoles = member.roles.cache.map(role => role.id);

                    // On vérifie si l'utilisateur à plusieurs rôle non compatible
                    // Hiérarchie des rôles : du plus bas au plus haut
                    const roleHierarchy = [
                        {id: roles.loutre_nouvelle, name: 'loutre_nouvelle'},
                        {id: roles.loutre_assure, name: 'loutre_assure'},
                        {id: roles.loutre_sentinelle, name: 'loutre_sentinelle'},
                        {id: roles.loutre_architecte, name: 'loutre_architecte'},
                        {id: roles.loutre_fondatrice, name: 'loutre_fondatrice'}
                    ];

                    // Trouver les rôles loutre que l'utilisateur possède dans l'ordre de la hiérarchie
                    const userLoutreRoles = roleHierarchy.filter(role => userRoles.includes(role.id));

                    if (userLoutreRoles.length > 1) {
                        // Garder uniquement le rôle le plus élevé (dernier dans la hiérarchie)
                        const highestRole = userLoutreRoles[userLoutreRoles.length - 1];
                        const rolesToRemove = userLoutreRoles.slice(0, -1);

                        for (const roleToRemove of rolesToRemove) {
                            try {
                                await member.roles.remove(roleToRemove.id);
                                otterlogs.log(`Removed "${roleToRemove.name}" from ${member.user.tag} in guild ${guild.name} as they have "${highestRole.name}"`);
                            } catch (error) {
                                otterlogs.error(`Failed to remove "${roleToRemove.name}" from ${member.user.tag} in guild ${guild.name}: ${error}`);
                            }
                        }
                    }
                }
            } catch (error) {
                otterlogs.error(`Failed to purge members for guild: ${guild.name} (${GUILD_ID}): ${error}`);
            }
    });
}