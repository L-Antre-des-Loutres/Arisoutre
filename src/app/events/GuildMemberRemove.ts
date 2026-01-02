import {GuildMember, Events, TextChannel} from "discord.js";
import {otterlogs} from "../../otterbots/utils/otterlogs";
import guilds from "../../../config/discordConfig.json";
import {Otterlyapi} from "../../otterbots/utils/otterlyapi/otterlyapi";
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

            let userInfo: UtilisateursDiscordType | undefined = await Otterlyapi.getDataByAlias("otr-utilisateursDiscord-getByDiscordId", member.user.id)


            if (userInfo) {
                await Otterlyapi.putDataByAlias("otr-utilisateursDiscord-updateDataSuppressionDate", {discord_id: member.user.id});
            } else {
                // On génére des données minimales pour l'utilisateur afin d'avoir un historique de sa suppression
                await Otterlyapi.putDataByAlias("otr-utilisateursDiscord-updateDataSuppressionDate", {
                    avatar_url: member.user.displayAvatarURL(),
                    delete_date: new Date().toISOString(),
                    first_activity: new Date().toISOString(),
                    id: 0,
                    last_activity: new Date().toISOString(),
                    nb_message: 0,
                    roles: [],
                    tag_discord: member.user.tag,
                    vocal_time: 0,
                    discord_id: member.user.id,
                    pseudo_discord: member.user.username,
                    join_date_discord: member.joinedAt ? member.joinedAt.toISOString() : undefined
                });
                userInfo = await Otterlyapi.getDataByAlias("otr-utilisateursDiscord-getByDiscordId", member.user.id);
            }

            await channel.send({embeds: [await embed_guildMemberRemove(userInfo)]})

        } catch (error) {
            otterlogs.error('Error while sending leave message: ' + error)
        }
    },
}