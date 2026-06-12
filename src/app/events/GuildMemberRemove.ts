import {GuildMember, Events, TextChannel, AuditLogEvent} from "discord.js";
import {otterlogs} from "../../otterbots/utils/otterlogs";
import guilds from "../../../config/discordConfig.json";
import {OtterPocketBase} from "../../otterbots/utils/pocketbase/pocketbase";
import {UtilisateursDiscordType} from "../types/UtilisateursDiscordType";
import {UtilisateursDiscordStatsType} from "../types/UtilisateursDiscordStatsType";
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

            // Détection du types de départ (Audit Logs)
            let actionType: 'leave' | 'kick' | 'ban' = 'leave';
            let executorName: string | undefined = undefined;
            let actionReason: string | undefined = undefined;

            try {
                // On attend un peu que les logs se mettent à jour
                await new Promise(r => setTimeout(r, 1500));

                const fetchedLogs = await guild.fetchAuditLogs({
                    limit: 1,
                }).catch(() => null);

                const auditEntry = fetchedLogs?.entries.first();

                if (auditEntry && Date.now() - auditEntry.createdTimestamp < 10000) {
                    if (auditEntry.action === AuditLogEvent.MemberBanAdd && auditEntry.targetId === member.id) {
                        actionType = 'ban';
                        executorName = auditEntry.executor?.username ?? undefined;
                        actionReason = auditEntry.reason ?? undefined;
                    } else if (auditEntry.action === AuditLogEvent.MemberKick && auditEntry.targetId === member.id) {
                        actionType = 'kick';
                        executorName = auditEntry.executor?.username ?? undefined;
                        actionReason = auditEntry.reason ?? undefined;
                    }
                }
            } catch (auditError) {
                otterlogs.error("Erreur lors de la récupération des audit logs dans GuildMemberRemove: " + auditError);
            }

            const userInfo: UtilisateursDiscordType | undefined = await OtterPocketBase.execByAlias<UtilisateursDiscordType>("otr-utilisateursDiscord-getByDiscordId", `discord_id="${member.user.id}"`)

            let messageCount = 0;
            let vocalTime = 0;

            if (userInfo) {
                // On récupère et somme les stats de l'utilisateur
                const stats = await OtterPocketBase.execByAlias<UtilisateursDiscordStatsType[]>(
                    "otr-utilisateursDiscordStats-getAll",
                    { filter: `discord_user="${userInfo.id}"` }
                );

                if (stats) {
                    messageCount = stats.reduce((sum, stat) => sum + (stat.message_count || 0), 0);
                    vocalTime = stats.reduce((sum, stat) => sum + (stat.vocal_time || 0), 0);
                }

                await OtterPocketBase.execByAlias("otr-utilisateursDiscord-updateDataSuppressionDate", userInfo.id, { delete_at: new Date().toISOString() });

                // On envoie son message de départ
                await channel.send({embeds: [await embed_guildMemberRemove(userInfo, actionType, executorName, messageCount, vocalTime, actionReason)]})

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
                await channel.send({embeds: [await embed_guildMemberRemove(userInfoNoRegister, actionType, executorName, messageCount, vocalTime, actionReason)]})
            }

        } catch (error) {
            otterlogs.error('Error while sending leave message: ' + error)
        }
    },
}
