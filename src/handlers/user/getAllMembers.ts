
import { Client } from 'discord.js'
import UtilisateursDiscord from '../../database/Models/Utilisateurs_discord'
import { logsMessage } from '../../utils/message/logs/logsMessage'

export async function getAllMembers(client: Client, guildId: string): Promise<void> {
    try {
        const guild = await client.guilds.fetch(guildId)
        const members = await guild.members.fetch()

        let botCount = 0

        // Enregistre les membres dans la base de données
        members.forEach(async member => {
            // Affiche les informations sur le membre
            // console.log(`👤 tag : ${member.user.username} (ID: ${member.id})  pseudo d'affichage : ${member.user.displayName}, ${member.user.bot}`)

            // Vérifie si le membre est un bot
            if (member.user.bot) {botCount += 1; return;}

            // Transforme la date de join en format SQL
            const joinDate = member.joinedAt?.toISOString().slice(0, 19).replace('T', ' ') ?? '0000-00-00 00:00:00'

            // Enregistre le membre dans la base de données
            console.log(`👤 tag : ${member.user.username} (ID: ${member.id})  pseudo d'affichage : ${member.user.displayName}`)
            UtilisateursDiscord.register(new UtilisateursDiscord(member.id, member.user.username, joinDate))

        })
        
        // Envoie un message dans le salon de logs
        logsMessage("📃 Tâche périodique : Enregistrement des membres", `📋 Nombre total de membres enregistrés : ${members.size - botCount}`, client)

    } catch (error) {
        console.error("❌ Erreur lors de la récupération des membres :", error)
        return
    }
}
