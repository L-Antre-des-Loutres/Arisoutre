/**
 * Represents a badge earned by a user.
 *
 * @pocketbase {Collection} - badges_earned
 *
 * Fields:
 * - `id`: Unique identifier for the earned badge record.
 * - `discord_user`: Relation to the discord_users collection.
 * - `player`: Relation to the players collection.
 * - `date_received`: The date the badge was received.
 * - `badge`: Relation to the badges collection (the badge ID).
 * - `created`: The date the record was created.
 * - `updated`: The date the record was last updated.
 */
export type BadgesEarnedType = {
    id: string;
    discord_user: string;
    player?: string;
    date_received: string;
    badge: string;
    created?: string;
    updated?: string;
}
