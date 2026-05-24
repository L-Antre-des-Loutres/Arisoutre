import {GuildMember, Events, TextChannel} from "discord.js";
import {otterlogs} from "../../otterbots/utils/otterlogs";
import guilds from "../../../config/discordConfig.json";
import {OtterPocketBase} from "../../otterbots/utils/pocketbase/pocketbase";
import {UtilisateursDiscordType} from "../types/UtilisateursDiscordType";
import {embed_guildMemberRemove} from "../embeds/events/guildMemberRemove/guildMemberRemove";

module.exports = {
    name: Events.GuildMemberRemove,
    once: false,
    async execute(member: GuildMember): Promise<void> {

        const guild = member.guild

        try {
            // On ne fait rien si le membre est un bot
            if (member.user.bot) return

            const {
                channels: {moderators: channelModeratorId},
            } = guilds;

            const channel = guild.channels.cache.get(channelModeratorId) as TextChannel ||
                await guild.channels.fetch(channelModeratorId) as TextChannel;
            if (!channel) return otterlogs.error('Unable to retrieve moderator message channel');

            const userInfo: UtilisateursDiscordType | undefined = await OtterPocketBase.execByAlias<UtilisateursDiscordType>("otr-utilisateursDiscord-getByDiscordId", `discord_id="${member.user.id}"`)


            if (userInfo) {
                await OtterPocketBase.execByAlias("otr-utilisateursDiscord-updateDataSuppressionDate", userInfo.id, { delete_at: new Date().toISOString() });

                // On envoie son message de départ
                await channel.send({embeds: [await embed_guildMemberRemove(userInfo)]})

            } else {
                const userInfoNoRegister: UtilisateursDiscordType = {
                    avatar_url: member.user.displayAvatarURL({size: 256}) || "",
                    delete_at: new Date().toISOString(),
                    discord_id: member.user.id,
                    id: "",
                    joined_at: member.joinedAt?.toISOString() || undefined,
                    username: member.displayName,
                    roles: member.roles.cache
                        .filter(role => role.id !== guild.id)
                        .map(role => ({
                            id: role.id,
                            name: role.name,
                            color: role.hexColor
                        })),
                    discord_tag: member.user.tag || `${member.user.username}#${member.user.discriminator}`,
                }
                await channel.send({embeds: [await embed_guildMemberRemove(userInfoNoRegister)]})
            }

        } catch (error) {
            otterlogs.error('Error while sending leave message: ' + error)
        }
    },
}
