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
        let registeredCount = 0;
        let updatedCount = 0;

        for (const member of members.values()) {
            const user: UtilisateursDiscordType | undefined =
                await OtterPocketBase.execByAlias<UtilisateursDiscordType>("otr-utilisateursDiscord-getByDiscordId", `discord_id="${member.user.id}"`);

            const isBot = member.user.bot;
            const hasNoData = await hasNoDataRole(member);

            // Valeurs communes
            const avatarUrl = member.user.displayAvatarURL({ extension: 'png', size: 512 });
            const joinDateDiscord = member.joinedAt?.toISOString();

            const roles = JSON.stringify(member.roles.cache.map(role => ({
                id: role.id,
                name: role.name,
                color: role.hexColor
            })));

            // --- CAS 1 : L'utilisateur n'existe pas ---
            if (!user) {
                if (!isBot && !hasNoData) {
                    await OtterPocketBase.execByAlias("otr-utilisateursDiscord-create", {
                        discord_id: member.user.id,
                        username: member.displayName,
                        discord_tag: member.user.tag,
                        avatar_url: avatarUrl,
                        joined_at: joinDateDiscord,
                        roles: roles
                    });
                    registeredCount++;
                }
                continue;
            }

            // --- CAS 2 : L'utilisateur existe et n'a PAS le rôle no_data ---
            if (!hasNoData) {
                await OtterPocketBase.execByAlias("otr-utilisateursDiscord-update", user.id, {
                    discord_id: member.user.id,
                    username: member.displayName,
                    discord_tag: member.user.tag,
                    avatar_url: avatarUrl,
                    joined_at: joinDateDiscord,
                    roles: roles
                });

                await OtterPocketBase.execByAlias("otr-utilisateursDiscord-resetDataSuppressionDate", user.id, {
                    delete_at: null,
                })

                updatedCount++;
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