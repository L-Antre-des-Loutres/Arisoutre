import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    GuildMember, InteractionContextType
} from "discord.js";
import {embed_welcome} from "../embeds/events/guildMemberAdd/welcomeEmbed";

export default {
    data: new SlashCommandBuilder()
        .setName("welcome")
        .setDescription("Permet de tester l'embed de bienvenue")
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
        const embed = await embed_welcome(member);

        await interaction.editReply({ embeds: [embed] });
    }
};
