import { GuildMember, Events, EmbedBuilder, userMention, roleMention, TextChannel } from "discord.js"
import { BotEvent } from "../types"
import { logsMessage } from "../utils/message/logs/logsMessage"
import UtilisateursDiscord from "../database/Models/Utilisateurs_discord"
import { errorLogs } from "../utils/message/logs/errorLogs"

const event: BotEvent = {
    name: Events.GuildMemberAdd,
    once: false,
    async execute(member: GuildMember): Promise<void> {

        const guild = member.guild

        try {
            const guilds = { channelBienvenue: process.env.WELCOME_CHANNEL, roleBienvenue: process.env.WELCOME_ROLE, roleLoutre: process.env.LOUTRE_ROLE }

            const welcomeChannel = guild.channels.cache.get(guilds.channelBienvenue) as TextChannel

            if (!welcomeChannel) {
                console.error("Le canal de bienvenue n'a pas été trouvé. Vérifiez la configuration.")
                return
            }

            // Déclaration des variables d'id

            const ID_roleLoutre = guilds.roleLoutre

            // Déclaration des variables de mentions

            const userPing = userMention(member.user.id)
            const rolePing = roleMention(guilds.roleBienvenue)
            const roleLoutre = roleMention(guilds.roleLoutre)


            // Envoie un message dans le salon de bienvenue

            welcomeChannel.send(userPing + ` merci de lire, c'est important :`)

            const embed = new EmbedBuilder()
                .setAuthor({
                    name: "L'antre des Loutres",
                })
                .setTitle("Premièrement bienvenue à toi !")
                .setURL("https://www.youtube.com/watch?v=rEq1Z0bjdwc")
                .setDescription("Ce serveur Discord est dédié aux jeux, donc les salons principalement utilisés sont <#1159113861593579612>, <#1288926594781413491>, <#1112784827649904732>, <#1218705208700305408>, et parfois <#1112790796119326812> pour les autres jeux.\n\nN'oublie pas que notre petite communauté nous permet toujours de maintenir une bonne ambiance, alors reste un peu avant de te faire un avis. :otter: \n\nOse lancer des discussions, tu verras que nous sommes présents !")
                .setThumbnail("https://cdn.discordapp.com/attachments/640874969227722752/1173553276801781820/opt__aboutcom__coeus__resources__content_migration__mnn__images__2015__09__river-otters-lead-photo-86eef01e35714da9a6dd974f321e3504.jpg")
                .setColor("#00b0f4")
            welcomeChannel.send({ embeds: [embed] })

            const pingMessage = welcomeChannel.send(`${rolePing} merci de bien l'accueillir et de l'orienter au nécessaire !`)

            // Ajoute un rôle au nouveau membre
            try {
                member.roles.add(ID_roleLoutre)
                logsMessage(`Nouvel utilsateur : ${member.user.tag}`, `Ajout du rôle : ${roleLoutre}`, guild.client, "#0bde00")
            } catch (error) {
                errorLogs(`Erreur lors de l'ajout du rôle : ${roleLoutre}`, `👤 tag : ${member.user.username} (ID: ${member.id}) \n ${error}`, guild.client)
                console.error("❌ Erreur lors de l'ajout du rôle :", error)
            }

            // Enregistre le nouveau membre dans la base de données et envoie un message dans le salon de logs
            try {
                UtilisateursDiscord.register(new UtilisateursDiscord(member.id, member.user.username, member.joinedAt?.toISOString().slice(0, 19).replace('T', ' ') ?? '0000-00-00 00:00:00'))
                logsMessage("Enregistrement en base de données", `📋 Nouveau membre : ${member.user.tag}`, guild.client, "#0bde00")

            } catch (error) {
                console.error("❌ Erreur lors de l'enregistrement du membre :", error)
            }

            // Ajoute une réaction au message de bienvenue
            try {
                (await pingMessage).react("👋")
            } catch (error) {
                console.error("❌ Erreur lors de l'ajout de la réaction :", error)
            }

        } catch (error) {
            console.log('Erreur lors de l\'envoi du message de bienvenue :', error)
            errorLogs("Erreur lors de l'événement GuildMemberAdd", `👤 tag : ${member.user.username} (ID: ${member.id}) \n ${error}`, guild.client)
        }
    },
}

export default event
