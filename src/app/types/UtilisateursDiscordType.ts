/**
 * Represents a Discord user's detailed information.
 *
 * This type is structured to store and manage various attributes
 * related to a Discord user, including their identification, activity,
 * messages, roles, and other metadata.
 *
 * Fields:
 * - `id`: A unique numeric identifier for the user in the system.
 * - `discord_id`: The user's Discord ID as a string.
 * - `pseudo_discord`: The user's Discord pseudonym or username without discriminator.
 * - `join_date_discord`: The date the user joined the Discord server, if available.
 * - `first_activity`: The timestamp of the user's first recorded activity, if applicable (optional).
 * - `last_activity`: The timestamp of the user's last recorded activity, if applicable (optional).
 * - `nb_message`: The total number of messages sent by the user in the server.
 * - `tag_discord`: The user's complete Discord tag, including username and discriminator (e.g., "username#1234").
 * - `avatar_url`: URL of the Discord avatar image associated with the user.
 * - `vocal_time`: Total time the user has spent in voice channels, represented as a number.
 * - `roles`: An array of roles associated with the user. Each role is represented as a `Roles` object.
 * - `delete_date`: The date when the user's data was deleted, or null if the user is still active.
 */
export type UtilisateursDiscordType = {
    id: number
    discord_id: string
    pseudo_discord: string
    join_date_discord: string | undefined
    first_activity?: string
    last_activity?: string
    nb_message: number
    tag_discord: string
    avatar_url: string
    vocal_time : number
    roles: Roles[]
    delete_date: string | null;
}

/**
 * Represents a role in the system with specific attributes.
 *
 * @typedef {Object} Roles
 * @property {string} id - The unique identifier for the role.
 * @property {string} name - The display name of the role.
 * @property {string} color - The color associated with the role, typically represented as a string.
 */
export type Roles = {
    id: string;
    name: string;
    color: string;
}