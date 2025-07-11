import { GuildMember, Events, TextChannel } from "discord.js"
import { BotEvent } from "../types"
import UtilisateursDiscord from "../database/Models/Utilisateurs_discord"
import { logsMessage } from "../utils/message/logs/logsMessage"
import { errorLogs } from "../utils/message/logs/errorLogs"

const event : BotEvent   = {
    name: Events.GuildMemberRemove,
    once: false,
    async execute(member: GuildMember): Promise<void> {

        const guild = member.guild

        try {

            if (member.user.bot) return

            const guilds = { channelBienvenue: process.env.BOT_ADMIN }

            const welcomeChannel = guild.channels.cache.get(guilds.channelBienvenue) as TextChannel

            if (!welcomeChannel) {
                console.error("Le canal de bienvenue n'a pas été trouvé. Vérifiez la configuration.")
                return
            }

            const user = member.user.tag

            await welcomeChannel.send(`${user} a quitté notre antre... Il nage maintenant dans d'autres eaux. À bientôt, et prends soin de toi, loutre voyageuse ! 🦦🌊`)

            // Supprime le membre de la base de données
            await UtilisateursDiscord.delete(member.id)
            logsMessage( "Suppression en base de données", `📋 Membre supprimé : ${member.user.tag}`, guild.client, "#fc0303")

        } catch (error) {
            console.log('Erreur lors de l\'envoi du message de bienvenue :', error)
            errorLogs("Erreur lors de l'événement GuildMemberRemove", `👤 tag : ${member.user.username} (ID: ${member.id}) \n ${error}`, guild.client)
        }
    },
}

export default event
