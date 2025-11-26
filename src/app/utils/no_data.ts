import roles from "../../../config/discordConfig.json";
import {GuildMember} from "discord.js";

const {roles: {no_data: roleNoDataID}} = roles;

/**
 * Asynchronously checks whether a guild member does not have the "no data" role.
 *
 * @param {GuildMember} member - The guild member whose roles are being checked.
 * @return {Promise<boolean>} A promise that resolves to `true` if the member has the "no data" role, otherwise `false`.
 */
export async function hasNoDataRole(member: GuildMember): Promise<boolean> {
    return member.roles.cache.has(roleNoDataID);
}