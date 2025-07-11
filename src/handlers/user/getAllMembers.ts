import { Client } from 'discord.js'
import UtilisateursDiscord from '../../database/Models/Utilisateurs_discord'
import { logsMessage } from '../../utils/message/logs/logsMessage'

export async function getAllMembers(client: Client, guildId: string): Promise<void> {
    try {
        const guild = await client.guilds.fetch(guildId)
        const members = await guild.members.fetch()

        let botCount = 0

        // Utilisation de Promise.all pour attendre correctement chaque enregistrement
        await Promise.all(
            members.map(async member => {
                if (member.user.bot) {
                    botCount += 1
                    return
                }

                const joinDate = member.joinedAt?.toISOString().slice(0, 19).replace('T', ' ') ?? '0000-00-00 00:00:00'

                // Récupération correcte de l'URL de l'avatar
                const avatarUrl = member.user.displayAvatarURL({ extension: 'png', size: 512 })

                await UtilisateursDiscord.register(
                    new UtilisateursDiscord(
                        member.id,
                        member.displayName,
                        member.user.username,
                        joinDate,
                        avatarUrl
                    )
                )
            })
        )

        logsMessage(
            "📃 Tâche périodique : Enregistrement des membres",
            `📋 Nombre total de membres enregistrés : ${members.size - botCount}`,
            client
        )

    } catch (error) {
        console.error("❌ Erreur lors de la récupération des membres :", error)
    }
}
