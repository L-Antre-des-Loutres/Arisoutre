import {getClient} from "../index";
import {hasNoDataRole} from "../utils/no_data";
import {OtterPocketBase} from "../../otterbots/utils/pocketbase/pocketbase";
import {UtilisateursDiscordType} from "../types/UtilisateursDiscordType";
import {otterlogs} from "../../otterbots/utils/otterlogs";

const GUILD_ID = process.env.DISCORD_GUILD_ID; // L'Antre des Loutres

export async function registerAllMember() {
    // On récupére le client du bot
    const client = getClient()

    if (!client.user) {
        otterlogs.error('Client user is not defined.');
        return;
    }

    const guild = client.guilds.cache.get(GUILD_ID || "");

    if (!guild) {
        otterlogs.error(`Guild ${GUILD_ID} not found`);
        return;
    }

    otterlogs.log("Starting registration of all guild members...");

    try {
        // On récupère tous les membres de la guilde
        const members = await guild.members.fetch();
        otterlogs.log(`Fetched ${members.size} members from Discord.`);

        // Optimisation : On récupère tous les utilisateurs de la BDD d'un coup pour éviter de spammer PocketBase
        const allDbUsers = await OtterPocketBase.execByAlias<UtilisateursDiscordType[]>(
            "otr-utilisateursDiscord-getAll",
            { sort: 'created' }
        );

        if (allDbUsers === undefined) {
            otterlogs.error("Could not fetch users from database. Aborting registration task.");
            return;
        }

        otterlogs.log(`Fetched ${allDbUsers.length} users from database.`);

        // On groupe les utilisateurs par discord_id
        const dbUsersMap = new Map<string, UtilisateursDiscordType[]>();
        for (const u of allDbUsers) {
            if (!dbUsersMap.has(u.discord_id)) {
                dbUsersMap.set(u.discord_id, []);
            }
            dbUsersMap.get(u.discord_id)!.push(u);
        }

        let registeredCount = 0;
        let updatedCount = 0;

        for (const member of members.values()) {
            const users = dbUsersMap.get(member.user.id) || [];
            const user: UtilisateursDiscordType | undefined = users[0];

            if (users.length > 1) {
                otterlogs.warn(`Duplicate found for ${member.user.username} (${member.user.id}). Purging ${users.length - 1} duplicates.`);
                for (let i = 1; i < users.length; i++) {
                    await OtterPocketBase.execByAlias("otr-utilisateursDiscord-delete", users[i].id);
                }
            }

            const isBot = member.user.bot;
            const hasNoData = await hasNoDataRole(member);

            // Valeurs communes
            const avatarUrl = member.user.displayAvatarURL({ extension: 'png', size: 512 });
            const joinDateDiscord = member.joinedAt?.toISOString() || "";

            const rolesList = member.roles.cache.map(role => ({
                id: role.id,
                name: role.name,
                color: role.hexColor
            }));
            const rolesStr = JSON.stringify(rolesList);

            // --- CAS 1 : L'utilisateur n'existe pas ---
            if (!user) {
                if (!isBot && !hasNoData) {
                    otterlogs.debug(`Registering new user: ${member.displayName} (${member.user.id})`);
                    const result = await OtterPocketBase.execByAlias("otr-utilisateursDiscord-create", {
                        discord_id: member.user.id,
                        username: member.displayName,
                        discord_tag: member.user.tag,
                        avatar_url: avatarUrl,
                        joined_at: joinDateDiscord,
                        roles: rolesList // On passe l'objet directement, le SDK gère le JSON
                    });
                    
                    if (result) {
                        registeredCount++;
                        // On l'ajoute à la map pour éviter d'éventuels doublons si le script tourne deux fois par erreur
                        dbUsersMap.set(member.user.id, [result as UtilisateursDiscordType]);
                        // Petit délai pour ne pas spammer PocketBase
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }
                }
                continue;
            }

            // --- CAS 2 : L'utilisateur existe et n'a PAS le rôle no_data ---
            if (!hasNoData) {
                // Optimisation : On ne met à jour que si nécessaire
                const currentRolesStr = JSON.stringify(user.roles);
                const hasChanged =
                    user.username !== member.displayName ||
                    user.discord_tag !== member.user.tag ||
                    user.avatar_url !== avatarUrl ||
                    user.joined_at !== joinDateDiscord ||
                    currentRolesStr !== rolesStr;

                if (hasChanged || user.delete_at !== null) {
                    otterlogs.debug(`Updating user: ${member.displayName} (${member.user.id})`);
                    await OtterPocketBase.execByAlias("otr-utilisateursDiscord-update", user.id, {
                        discord_id: member.user.id,
                        username: member.displayName,
                        discord_tag: member.user.tag,
                        avatar_url: avatarUrl,
                        joined_at: joinDateDiscord,
                        roles: rolesList, // On passe l'objet directement
                        delete_at: null // On reset la date de suppression si elle existait
                    });
                    updatedCount++;
                }
                continue;
            }

            // --- CAS 3 : L'utilisateur existe, a no_data et n'a PAS encore de date de suppression ---
            if (user.delete_at == null) {
                otterlogs.log(
                    `L'utilisateur ${member.user.username} a le rôle no_data, suppression des données dans 30 jours.`
                );

                await OtterPocketBase.execByAlias("otr-utilisateursDiscord-updateDataSuppressionDate", user.id, {
                    delete_at: new Date().toISOString()
                });
            }
        }
        otterlogs.success(`Finished registration: ${registeredCount} new users registered, ${updatedCount} users updated.`);

    } catch (error) {
        otterlogs.error(`Failed to fetch members for guild: ${guild.name} (${GUILD_ID})` + error);
    }
}