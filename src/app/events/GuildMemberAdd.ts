import {Events, GuildMember, roleMention, TextChannel, userMention} from "discord.js";
import guilds from "../../../build/channelsConfig.json";
import {Otterlyapi} from "../../otterbots/utils/otterlyapi/otterlyapi";
import {otterlogs} from "../../otterbots/utils/otterlogs";
import {embed_analyze} from "../embeds/events/utils/analyzeEmbed";
import {embed_welcome} from "../embeds/events/guildMemberAdd/welcomeEmbed";

module.exports = {
    name: Events.GuildMemberAdd,
    once: false,
    async execute(member: GuildMember): Promise<void> {
        if (member.user.bot) return;

        const {
            channels: {welcome: channelBienvenueID, moderators: channelModeratorId},
            roles: {bienvenue: roleBienvenueID, loutre: roleLoutreID}
        } = guilds;
        const guild = member.guild;

        try {
            // Récupération du salon de bienvenue
            const welcomeChannel = guild.channels.cache.get(channelBienvenueID) as TextChannel ||
                await guild.channels.fetch(channelBienvenueID) as TextChannel;

            if (!welcomeChannel) {
                otterlogs.error("Unable to retrieve welcome channel");
                return;
            }

            // Envoi des messages de bienvenue
            const userPing = userMention(member.user.id);
            const rolePing = roleMention(roleBienvenueID);

            await Promise.all([
                welcomeChannel.send(`${userPing} merci de lire, c'est important :`),
                welcomeChannel.send({embeds: [await embed_welcome(member)]})
            ]);

            const pingMessage = await welcomeChannel.send(`${rolePing} merci de bien l'accueillir et de l'orienter au nécessaire !`);

            // Ajout du rôle, enregistrement BDD en parallèle et envoie d'un message aux modérateurs
            await Promise.all([
                (async () => {
                    try {
                        await member.roles.add(roleLoutreID);
                    } catch (error) {
                        otterlogs.error("Error while adding role:" + error);
                    }
                })(),
                (async () => {
                    try {
                        const user = await Otterlyapi.getDataByAlias("otr-utilisateursDiscord-getByDiscordId", member.user.id);
                        if (!user) {
                            const avatarUrl = member.user.displayAvatarURL({extension: 'png', size: 512});
                            await Otterlyapi.postDataByAlias("otr-utilisateursDiscord-create", {
                                discord_id: member.user.id,
                                pseudo_discord: member.user.username,
                                tag_discord: member.user.tag,
                                avatar_url: avatarUrl,
                            });
                        }
                    } catch (error) {
                        otterlogs.error("Error while registering member:" + error);
                    }
                })(),
                (async () => {
                    try {
                        const channel = guild.channels.cache.get(channelModeratorId) as TextChannel ||
                            await guild.channels.fetch(channelModeratorId) as TextChannel;
                        if (!channel) return;
                        await channel.send({embeds: [await embed_analyze(member)]});
                    } catch (error) {
                        otterlogs.error("Error while notifying moderators: " + error);
                    }
                })(),
                pingMessage.react("👋").catch(error => {
                    otterlogs.error("Error while adding reaction:" + error);
                })
            ]);
        } catch (error) {
            otterlogs.error("Error while sending welcome message:" + error);
        }
    },
};