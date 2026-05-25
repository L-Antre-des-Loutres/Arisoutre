/**
 * Represents a linking code record in PocketBase.
 * Used to link a Discord account with an in-game player account.
 *
 * @pocketbase {Collection} - linking_codes
 */
export type LinkingCodeType = {
    id: string;
    linking_code: string;
    player: string;
    used_at: string | null;
    created: string;
    updated: string;
}
