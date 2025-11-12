import {Events, Message, TextChannel} from "discord.js"
import {otterlogs} from "../../otterbots/utils/otterlogs";
import channels from "../config.json";
import {embed_onMessageUpdate} from "../embeds/events/onMessageUpdate/onMessageUpdate";

module.exports = {
    name: Events.MessageUpdate,
    async execute(oldMessage: Message, newMessage: Message) {
        try {
            if (!oldMessage.author || oldMessage.author.bot || oldMessage.content === newMessage.content ||
                !(oldMessage.channel instanceof TextChannel)) return;

            const {channels: {log_message: logMessageChannelID}} = channels;
            const guild = oldMessage.guild;
            if (!guild) return;

            const logMessageChannel = (guild.channels.cache.get(logMessageChannelID) as TextChannel) ||
                await guild.channels.fetch(logMessageChannelID) as TextChannel;

            if (!logMessageChannel) {
                otterlogs.error("Unable to retrieve log message channel");
                return;
            }

            await logMessageChannel.send({embeds: [embed_onMessageUpdate(oldMessage, newMessage)]})
                .catch(error => otterlogs.error(`Impossible d'envoyer le message : ${error}`));
        } catch (error) {
            otterlogs.error(`Impossible d'exécuter l\'événement OnMessageUpdate : ${error}`)
        }
    },
}