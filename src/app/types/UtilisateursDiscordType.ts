/**
 * Represents a Discord user's detailed information.
 *
 * This type is structured to store and manage various attributes
 * related to a Discord user, including their identification, activity,
 * messages, roles, and other metadata.
 *
 * @pocketbase {Collection} - discord_users
 *
 * Fields:
 * - `id`: A unique identifier for the user in the system.
 * - `discord_id`: The user's Discord ID as a string.
 * - `username`: The user's Discord display name.
 * - `joined_at`: The date the user joined the Discord server.
 * - `first_active_at`: The timestamp of the user's first recorded activity (optional).
 * - `last_active_at`: The timestamp of the user's last recorded activity (optional).
 * - `discord_tag`: The user's complete Discord tag.
 * - `avatar_url`: URL of the Discord avatar image associated with the user.
 * - `roles`: An array of roles associated with the user. Each role is represented as a `Roles` object.
 * - `delete_at`: The date when the user's data was marked for deletion, or null if the user is still active.
 */
export type UtilisateursDiscordType = {
    id: string
    discord_id: string
    username: string
    discord_tag: string
    avatar_url: string
    roles: Roles[]
    joined_at: string | undefined
    first_active_at?: string
    last_active_at?: string
    delete_at: string | null;
    created?: string;
    updated?: string;
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