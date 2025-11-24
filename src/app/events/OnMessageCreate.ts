import {Events, Message} from "discord.js"
import {otterlogs} from "../../otterbots/utils/otterlogs";
import {lastActivityCache, nbMessageCache} from "../config/cache";

module.exports = {
    name: Events.MessageCreate,
    async execute(message: Message) {
        try {
            // On ne compte pas les messages des bots
            if (message.author.bot) return;

            // On vérifie que les messages proviennent de la guilde
            if (!message.guild) return;

            const authorId = message.author.id;

            // Récupérer l'ancien compteur ou 0
            const messageCount = nbMessageCache.get(authorId) || 0;

            // Incrémenter et stocker directement le nombre
            nbMessageCache.set(authorId, messageCount + 1);
            lastActivityCache.set(authorId, Date.now())

        } catch (error) {
            otterlogs.error("Error in OnMessageCreate event: " + error);
        }
    }
};
