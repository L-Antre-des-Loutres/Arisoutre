import {Otterlyapi} from "../../otterbots/utils/otterlyapi/otterlyapi";
import {otterlogs} from "../../otterbots/utils/otterlogs";
import fs from "fs";
import {AuthorizedDomainsType} from "../types/AuthorizedDomainsType";

export async function fetchAuthorizedDomains() {
    try {
        const authorizedDomains: AuthorizedDomainsType | undefined = await Otterlyapi.getDataByAlias("otr-otterguard-getAll")

        // On enregistre les domaines dans un fichier json
        if (authorizedDomains) {
            const filePath = 'authorizedDomains.json'

            // Create empty JSON file if it doesn't exist
            if (!fs.existsSync(filePath)) {
                fs.writeFileSync(filePath, '[]');
            }

            fs.writeFileSync(filePath, JSON.stringify(authorizedDomains, null, 2));
            otterlogs.success('Authorized domains saved successfully')
        } else {
            otterlogs.warn('No authorized domains retrieved')
        }
    } catch (error : unknown) {
        otterlogs.error(`${error}`)
    }
}

export function getAuthorizedDomains(): string[] | null {
    try {
        const filePath = 'authorizedDomains.json'

        if (!fs.existsSync(filePath)) {
            otterlogs.warn('Authorized domains file does not exist')
            return null
        }

        const fileContent = fs.readFileSync(filePath, 'utf-8')
        const domains: AuthorizedDomainsType[] = JSON.parse(fileContent)
        return domains.map(domain => domain.domain_url)
    } catch (error: unknown) {
        otterlogs.error(`Error reading authorized domains: ${error}`)
        return null
    }
}