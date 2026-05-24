import {otterlogs} from "../../otterbots/utils/otterlogs";

export async function fetchAuthorizedDomains() {
    otterlogs.warn('fetchAuthorizedDomains is deprecated')
}

export function getAuthorizedDomains(): string[] | null {
    otterlogs.warn('getAuthorizedDomains is deprecated')
    return null
}