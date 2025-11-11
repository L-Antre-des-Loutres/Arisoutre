import {EmbedBuilder, GuildMember} from "discord.js";

export async function embed_guildMemberAddSuccess(member: GuildMember): Promise<EmbedBuilder> {
    return new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle('New Member Joined!')
        .setDescription(`Welcome to the server, ${member.user.tag}!`)
        .setThumbnail(member.user.displayAvatarURL())
        .addFields(
            { name: 'Member Count', value: `${member.guild.memberCount}`, inline: true },
            { name: 'Joined At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
        )
        .setTimestamp();
}

export async function embed_guildMemberAddError(member: GuildMember): Promise<EmbedBuilder> {
    return new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('Error Welcoming New Member')
        .setDescription(`There was an error welcoming ${member.user.tag} to the server.`)
        .setThumbnail(member.user.displayAvatarURL())
        .addFields(
            { name: 'Member Count', value: `${member.guild.memberCount}`, inline: true },
            { name: 'Joined At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
        )
        .setTimestamp();
}