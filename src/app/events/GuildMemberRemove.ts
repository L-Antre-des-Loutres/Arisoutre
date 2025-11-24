import {GuildMember, Events, TextChannel} from "discord.js";
import {otterlogs} from "../../otterbots/utils/otterlogs";
import guilds from "../config/channels.json";
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

            const userInfo: UtilisateursDiscordType | undefined = await Otterlyapi.getDataByAlias("otr-utilisateursDiscord-getByDiscordId", member.user.id)
            await channel.send({embeds: [await embed_guildMemberRemove(userInfo)]})

        } catch (error) {
            otterlogs.error('Error while sending welcome message: ' + error)
        }
    },
}