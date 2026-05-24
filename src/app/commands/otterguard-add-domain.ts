import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    PermissionFlagsBits,
    InteractionContextType
} from "discord.js";

/**
 * Command to add an authorized domain to Otterguard.
 * DEPRECATED
 */
export default {
    data: new SlashCommandBuilder()
        .setName("otterguard-add-domain")
        .setDescription("Ajoute un domaine autorisé à Otterguard.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setContexts(InteractionContextType.Guild)
        .addStringOption(option =>
            option
                .setName("domaine")
                .setDescription("L'URL du domaine à autoriser (ex: https://example.com)")
                .setRequired(true)
        ),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.reply({
            content: "❌ Cette commande est obsolète et n'est plus prise en charge.",
            flags: "Ephemeral"
        });
    }
};
