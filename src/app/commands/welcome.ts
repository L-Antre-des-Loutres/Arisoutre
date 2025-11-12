import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    GuildMember
} from "discord.js";
import {embed_welcome} from "../embeds/events/guildMemberAdd/welcomeEmbed";

export default {
    data: new SlashCommandBuilder()
        .setName("welcome")
        .setDescription("Permet de tester l'embed de bienvenue")
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
        const embed = await embed_welcome(member);

        await interaction.editReply({ embeds: [embed] });
    }
};
