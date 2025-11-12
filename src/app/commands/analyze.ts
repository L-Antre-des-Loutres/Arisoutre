import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    GuildMember
} from "discord.js";
import {analyzeEmbed} from "../embeds/events/utils/analyzeEmbed";

export default {
    data: new SlashCommandBuilder()
        .setName("analyze")
        .setDescription("Analyse le score de fiabilité d'un membre du serveur.")
        // .setDefaultMemberPermissions(0) // ou 0 si réservé à l’admin
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
                ephemeral: true
            });
            return;
        }

        await interaction.deferReply(); // pour gérer les analyses un peu longues

        // Création de l’embed basé sur les données
        const embed = await analyzeEmbed(member);

        await interaction.editReply({ embeds: [embed] });
    }
};
