import {EmbedBuilder} from "discord.js";

export async function welcomeEmbed(): Promise<EmbedBuilder> {
    return new EmbedBuilder()
        .setAuthor({ name: "L'antre des Loutres" })
        .setTitle("Premièrement, bienvenue à toi !")
        .setURL("https://www.youtube.com/watch?v=rEq1Z0bjdwc")
        .setDescription("Ce serveur Discord est dédié aux jeux, donc les salons principalement utilisés sont <#1159113861593579612>, <#1288926594781413491>, <#1112784827649904732>, <#1218705208700305408>, et parfois <#1112790796119326812> pour les autres jeux.\n\nN'oublie pas que notre petite communauté nous permet toujours de maintenir une bonne ambiance, alors reste un peu avant de te faire un avis. 🦦\n\nOse lancer des discussions, tu verras que nous sommes présents !")
        .setThumbnail("https://cdn.discordapp.com/attachments/640874969227722752/1173553276801781820/opt__aboutcom__coeus__resources__content_migration__mnn__images__2015__09__river-otters-lead-photo-86eef01e35714da9a6dd974f321e3504.jpg")
        .setColor("#00b0f4");
}