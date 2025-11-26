import {Events, Message} from "discord.js"
import {otterlogs} from "../../otterbots/utils/otterlogs";
import {lastActivityCache, nbMessageCache} from "../config/cache";
import {hasNoDataRole} from "../utils/no_data";

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
            lastActivityCache.set(authorId, Date.now())

        } catch (error) {
            otterlogs.error("Error in OnMessageCreate event: " + error);
        }
    }
};
