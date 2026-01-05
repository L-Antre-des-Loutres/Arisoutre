/**
 * Represents a structure for storing information about authorized domains.
 * This type is used to define the schema for a domain entity that has been granted authorization.
 * Properties:
 * - `id`: A unique identifier for the authorized domain.
 * - `domain_url`: The URL of the authorized domain.
 */
export type AuthorizedDomainsType = {
    id: number,
    domain_url: string
};