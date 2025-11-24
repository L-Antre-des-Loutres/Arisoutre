import {Events, Message} from "discord.js"
import {otterlogs} from "../../otterbots/utils/otterlogs";
import {nbMessageCache} from "../config/cache";

module.exports = {
    name: Events.MessageCreate,
    async execute(message: Message) {
        try {
            const authorId = message.author.id;

            // Récupérer l'ancien compteur ou 0
            const messageCount = nbMessageCache.get(authorId) || 0;

            // Incrémenter et stocker directement le nombre
            nbMessageCache.set(authorId, messageCount + 1);

        } catch (error) {
            otterlogs.error("Error in OnMessageCreate event: " + error);
        }
    }
};
