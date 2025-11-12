import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    GuildMember,
    InteractionContextType
} from "discord.js";
import {embed_analyze} from "../embeds/events/utils/analyzeEmbed";

export default {
    data: new SlashCommandBuilder()
        .setName("analyze")
        .setDescription("Analyse le score de fiabilité d'un membre du serveur.")
        .setDefaultMemberPermissions(0)
        .setContexts(InteractionContextType.Guild)
    .addUserOption(option =>
            option
                .setName("membre")
                .setDescription("Le membre à analyser")
                .setRequired(true)
        ),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const member = interaction.options.getMember("membre") as GuildMember | null;

        if (!member) {
            await interaction.reply({
                content: "Impossible de trouver ce membre sur le serveur.",
                flags: "Ephemeral"
            });
            return;
        }

        await interaction.deferReply(); // pour gérer les analyses un peu longues

        // Création de l’embed basé sur les données
        const embed = await embed_analyze(member);

        await interaction.editReply({ embeds: [embed] });
    }
};
