import {getAuthorizedDomains} from "../tasks/fetchAuthorizedDomains";

/**
 * Represents the configuration settings for the Otterguard system.
 * This configuration determines specific protective behaviors.
 *
 * @type {Object<boolean>}
 * @property {boolean} protectLink - Indicates whether link protection is enabled or disabled.
 */
export const otterguardConfig: { [key: string]: boolean } = {
    protectLink: true,
    protectScam: true,
    protectSpam: true,
};

/**
 * List of authorized domains for link protection.
 */
export const authorizedDomains: string[] = getAuthorizedDomains() || [];