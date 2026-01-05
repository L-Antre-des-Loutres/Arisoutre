import {getClient} from "../index";
import {hasNoDataRole} from "../utils/no_data";
import {Otterlyapi} from "../../otterbots/utils/otterlyapi/otterlyapi";
import {UtilisateursDiscordType} from "../types/UtilisateursDiscordType";
import {otterlogs} from "../../otterbots/utils/otterlogs";

const GUILD_ID = process.env.DISCORD_GUILD_ID; // L'Antre des Loutres

export function registerAllMember() {
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
            /**
             * export type Roles = {
             *     id: string;
             *     name: string;
             *     color: string;
             * }
             */
            try {
                // On récupère tous les membres de la guilde
                const members = await guild.members.fetch();

                for (const member of members.values()) {

                    const user: UtilisateursDiscordType | undefined =
                        await Otterlyapi.getDataByAlias("otr-utilisateursDiscord-getByDiscordId", member.user.id);

                    const isBot = member.user.bot;
                    const hasNoData = await hasNoDataRole(member);

                    // Valeurs communes
                    const avatarUrl = member.user.displayAvatarURL({ extension: 'png', size: 512 });
                    const roles = JSON.stringify(member.roles.cache.map(role => ({
                        id: role.id,
                        name: role.name,
                        color: role.hexColor
                    })));

                    // --- CAS 1 : L'utilisateur n'existe pas ---
                    if (!user) {

                        if (!isBot && !hasNoData) {
                            await Otterlyapi.postDataByAlias("otr-utilisateursDiscord-create", {
                                discord_id: member.user.id,
                                pseudo_discord: member.user.username,
                                tag_discord: member.user.tag,
                                avatar_url: avatarUrl,
                                roles: roles
                            });
                        }

                        continue;
                    }

                    // --- CAS 2 : L'utilisateur existe et n'a PAS le rôle no_data ---
                    if (!hasNoData) {
                        await Otterlyapi.putDataByAlias("otr-utilisateursDiscord-update", {
                            id: user.id,
                            discord_id: member.user.id,
                            pseudo_discord: member.user.username,
                            tag_discord: member.user.tag,
                            avatar_url: avatarUrl,
                            roles: roles
                        });

                        await Otterlyapi.putDataByAlias("otr-utilisateursDiscord-resetDataSuppressionDate", {
                            discord_id: member.user.id,
                        })

                        continue;
                    }

                    // --- CAS 3 : L'utilisateur existe, a no_data et n'a PAS encore de date de suppression ---
                    if (user.delete_date == null) {
                        otterlogs.log(
                            `L'utilisateur ${member.user.username} a le rôle no_data, suppression des données dans 30 jours.`
                        );

                        await Otterlyapi.putDataByAlias("otr-utilisateursDiscord-updateDataSuppressionDate", {
                            discord_id: member.user.id
                        });
                    }
                }

            } catch (error) {
                otterlogs.error(`Failed to fetch members for guild: ${guild.name} (${GUILD_ID})` + error);
            }
    });
}