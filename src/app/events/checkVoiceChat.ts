import { otterlogs } from "../../otterbots/utils/otterlogs";
import { Client, Events } from "discord.js";

import { joinTimestamps } from "../utils/voiceState";

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