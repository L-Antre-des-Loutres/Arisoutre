import { otterlogs } from "../../otterbots/utils/otterlogs";
import { Client, Events } from "discord.js";
import { joinTimestamps } from "../utils/voiceState";
import {vocalWithCache, voiceChannelCache} from "../config/cache";

module.exports = {
    name: Events.ClientReady,
    async execute(client: Client) {
        try {
            // Parcourir tous les serveurs du bot
            client.guilds.cache.forEach(guild => {
                // Parcourir tous les salons vocaux
                guild.channels.cache.forEach(channel => {
                    if (channel.isVoiceBased()) {
                        // Parcourir tous les membres connectés
                        channel.members.forEach(member => {
                            if (!member.user.bot) {
                                otterlogs.debug(`Tracking voice state for member ${member.id} in guild ${guild.id}`);
                                joinTimestamps.set(member.id, Date.now());

                                // On vérifie que le channel est un channel vocal
                                if (!channel || !("name" in channel)) {
                                    return;
                                }

                                const rawData = voiceChannelCache.get(member.id);
                                const userChannels = Array.isArray(rawData) ? rawData : [];
                                const channelExists = userChannels.some(c => c.id === channel.id);
                                if (!channelExists) {
                                    voiceChannelCache.set(member.id, [
                                        ...userChannels,
                                        {name: channel.name, id: channel.id}
                                    ]);
                                }
                                // Ajoute tous les autres utilisateurs présents dans le vocal
                                const otherUsers = channel.members
                                    .filter(m => m.id !== member.id && !m.user.bot)
                                    .map(m => ({
                                        id: m.id,
                                        name: m.user.username
                                    }));

                                    const rawVocalWith = vocalWithCache.get(member.id);
                                    const userVocalWith = Array.isArray(rawVocalWith) ? rawVocalWith : [];
                                    const uniqueUsers = otherUsers.filter(user =>
                                        !userVocalWith.some(existing => existing.id === user.id)
                                    );

                                    if (uniqueUsers.length > 0) {
                                        vocalWithCache.set(member.id, [
                                            ...userVocalWith,
                                            ...uniqueUsers.map(user => ({
                                                id: user.id,
                                                username: user.name
                                            }))
                                        ]);}
                            }
                        });
                    }
                });
            });
        } catch (error) {
            otterlogs.error('Error checking voice channels : ' + error);
        }
    }
}