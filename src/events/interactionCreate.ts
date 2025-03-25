import { Events, Interaction } from "discord.js"
import { BotEvent } from "../types"

const event: BotEvent = {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction: Interaction) {
        
        if (!interaction.isChatInputCommand()) return

        const command = interaction.client.slashCommands.get(interaction.commandName)

        if (!command) return interaction.reply({ content: "Cette commande n'existe pas ou plus !", ephemeral: true })

        await command.execute(interaction)
    }
}

export default event