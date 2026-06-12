import {AutocompleteInteraction, Client, EmbedBuilder, TextChannel} from "discord.js";
import {otterlogs} from "../utils/otterlogs";
import {SlashCommand} from "../types";
import {OtterPocketBase} from "../utils/pocketbase/pocketbase";
import {UtilisateursDiscordType} from "../../app/types/UtilisateursDiscordType";
import discordConfig from "../../../config/discordConfig.json";

/**
 * Handles interaction events for chat input commands and executes the appropriate command logic.
 *
 * @param {Client} client - The Discord.js client instance used to handle events and manage interactions.
 * @return {void} This function does not return a value; it sets up events listeners for the client.
 */
export async function otterBots_interactionCreate(client: Client): Promise<void> {
    client.on("interactionCreate", async (interaction) => {

        if (interaction.isAutocomplete()) {
            const command: SlashCommand | undefined = client.slashCommands.get(interaction.commandName);
            if (!command || typeof command.autocomplete !== "function") {
                otterlogs.warn(`No autocomplete handler for ${interaction.commandName}`);
                return;
            }

            try {
                await (command.autocomplete as (i: AutocompleteInteraction) => Promise<unknown>)(interaction as AutocompleteInteraction);
            } catch (error) {
                otterlogs.error(`Error during autocomplete for ${interaction.commandName}: ${error}`);
                try {
                    await interaction.respond([
                        { name: "⚠️ Erreur lors de l’autocomplétion", value: "error" },
                    ]);
                } catch {}
            }
            return;
        }

        if (interaction.isButton()) {
            if (interaction.customId === 'verify_user_button') {
                try {
                    const userInfo = await OtterPocketBase.execByAlias<UtilisateursDiscordType>(
                        'otr-utilisateursDiscord-getByDiscordId',
                        `discord_id="${interaction.user.id}"`
                    );

                    if (userInfo) {
                        await OtterPocketBase.execByAlias(
                            'otr-utilisateursDiscord-update',
                            userInfo.id,
                            { is_verified: true }
                        );
                        
                        await interaction.reply({ content: "✅ Félicitations ! Vous êtes maintenant vérifié sur le serveur. Vous pouvez désormais envoyer des pièces jointes.", ephemeral: true });
                        otterlogs.log(`L'utilisateur ${interaction.user.tag} s'est vérifié via le bouton.`);

                        // Notification pour les modérateurs
                        const modChannelId = discordConfig.channels.moderators;
                        if (modChannelId) {
                            try {
                                const modChannel = await client.channels.fetch(modChannelId) as TextChannel;
                                if (modChannel) {
                                    const modEmbed = new EmbedBuilder()
                                        .setColor("#57F287") // Success Green
                                        .setTitle("✅ Nouvelle vérification")
                                        .setDescription(`L'utilisateur **${interaction.user.tag}** vient de terminer sa vérification.`)
                                        .addFields(
                                            { name: "👤 Utilisateur", value: `<@${interaction.user.id}> (${interaction.user.id})`, inline: true },
                                            { name: "📅 Date", value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                                        )
                                        .setThumbnail(interaction.user.displayAvatarURL())
                                        .setFooter({ text: "Système de Vérification" })
                                        .setTimestamp();

                                    await modChannel.send({ embeds: [modEmbed] });
                                }
                            } catch (modError) {
                                otterlogs.error(`Erreur lors de l'envoi de la notification de vérification aux modérateurs: ${modError}`);
                            }
                        }
                    } else {
                        await interaction.reply({ content: "⚠️ Erreur : Votre profil n'a pas été trouvé dans notre base de données. Veuillez envoyer un message sur le serveur pour l'initialiser.", ephemeral: true });
                    }
                } catch (error) {
                    otterlogs.error(`Erreur lors de la vérification via bouton pour ${interaction.user.tag}: ${error}`);
                    if (!interaction.replied) {
                        await interaction.reply({ content: "❌ Une erreur est survenue lors de la vérification.", ephemeral: true });
                    }
                }
            }
            return;
        }

        if (!interaction.isChatInputCommand()) return;

        const command: SlashCommand | undefined = client.slashCommands.get(interaction.commandName);
        if (!command) {
            otterlogs.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            otterlogs.error(`Error executing command ${interaction.commandName}: ${error}`);

            const replyMessage = interaction.replied || interaction.deferred
                ? '🦦 Oups! Une loutre a fait tomber le serveur dans l’eau! La commande n’a pas pu être exécutée.'
                : '🦦 La loutre responsable de cette commande est partie faire la sieste! Réessayez plus tard.';

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: replyMessage, ephemeral: true });
            } else {
                await interaction.reply({ content: replyMessage, ephemeral: true });
            }
        }
    });
}
