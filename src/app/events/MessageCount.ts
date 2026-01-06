import {Events, Message, TextChannel} from "discord.js"
import {otterlogs} from "../../otterbots/utils/otterlogs";
import {lastActivityCache, nbMessageCache, textChannelCache} from "../config/cache";
import {hasNoDataRole} from "../utils/no_data";
import {getSqlDate} from "../utils/sqlDate";

module.exports = {
    name: Events.MessageCreate,
    async execute(message: Message) {
        try {
            // On ne compte pas les messages des bots
            if (message.author.bot) return;

            // On vérifie que les messages proviennent de la guilde
            if (!message.guild) return;

            // On récupére le membre
            const member = message.member ?? await message.guild.members.fetch(message.author.id);

            // On vérifie que l'utilisateur n'as pas le rôle no_data avant de l'enregistrer en BDD
            if (await hasNoDataRole(member)) return;

            const authorId = message.author.id;

            // Récupérer l'ancien compteur ou 0
            const messageCount = nbMessageCache.get(authorId) || 0;

            // Incrémenter et stocker directement le nombre
            nbMessageCache.set(authorId, messageCount + 1);
            lastActivityCache.set(authorId, getSqlDate())

            // On vérifie que le message provient d'un salon textuel'
            if (!message.channel.isTextBased() || !("name" in message.channel)) {
                return;
            }

            const rawData = textChannelCache.get(authorId);
            const userChannels = Array.isArray(rawData) ? rawData : [];
            const channelIndex = userChannels.findIndex(channel => channel.id === message.channel.id);
            if (channelIndex === -1) {
                textChannelCache.set(authorId, [
                    ...userChannels,
                    {name: (message.channel as TextChannel).name, id: message.channel.id, nb_message: 1}
                ]);
            } else {
                userChannels[channelIndex].nb_message = (userChannels[channelIndex].nb_message || 0) + 1;
                textChannelCache.set(authorId, userChannels);
            }
        } catch (error) {
            otterlogs.error("Error in OnMessageCreate event: " + error);
        }
    }
};
