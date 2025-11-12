import {EmbedBuilder, GuildMember} from "discord.js";

export async function embed_welcome(member: GuildMember): Promise<EmbedBuilder> {
    return new EmbedBuilder()
        .setAuthor({
            name: `Bienvenue sur L'antre des Loutres ! 🦦`
        })
        .setTitle(`Ravi de te voir parmi nous !`)
        .setURL("https://antredesloutres.fr")
        .setDescription(
            `Salut ${member.user}, nous sommes super heureux que tu aies rejoint notre communauté ! 🎉\n\n` +
            `Ici, tu trouveras des discussions sur nos jeux préférés dans les salons : ` +
            `<#1159113861593579612>, <#1288926594781413491>, <#1112784827649904732>, ` +
            `<#1218705208700305408>, et parfois <#1112790796119326812> pour les autres jeux.\n\n` +
            `N'hésite pas à participer aux conversations, poser des questions, ou simplement dire bonjour. ` +
            `Plus on est, plus on s'amuse !`
        )
        .setThumbnail(member.user.displayAvatarURL({ extension: "png", size: 512 }))
        .setColor("#00b0f4")
        .setFooter({ text: `antredesloutres.fr - ${process.env.BOT_NAME}` });
}