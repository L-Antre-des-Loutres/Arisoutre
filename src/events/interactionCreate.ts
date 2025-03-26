import { Events, Interaction } from "discord.js"
import { BotEvent } from "../types"
import { errorLogs } from "../utils/message/logs/errorLogs"
import { command } from "../slashCommands/clear"

const event: BotEvent = {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction: Interaction) {
        try {
            if (!interaction.isChatInputCommand()) return

            const command = interaction.client.slashCommands.get(interaction.commandName)

            if (!command) return interaction.reply({ content: "Cette commande n'existe pas ou plus !", ephemeral: true })

            await command.execute(interaction)
        } catch (error) {
            console.error(error)
            errorLogs(`Erreur lors de l'exécution de la commande : ${command.name}`, `👤 tag : ${interaction.user.username} (ID: ${interaction.user.id}) \n ${error}`, interaction.client)
        }
    }
}

export default event