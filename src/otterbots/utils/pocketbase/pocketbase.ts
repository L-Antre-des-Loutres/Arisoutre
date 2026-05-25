import PocketBase, { ClientResponseError } from 'pocketbase';
import fs from 'fs';
import yaml from 'js-yaml';
import { PocketBaseAlias, PocketBaseConfig } from './modules/PocketBaseTypes';
import { otterlogs } from '../otterlogs';
import http from 'http';
import https from 'https';

/**
 * OtterPocketBase utility class to manage PocketBase interactions using YAML aliases.
 */
export class OtterPocketBase {
    private static pb: PocketBase;
    private static config: PocketBaseConfig;
    private static readonly configPath = 'endpoint_alias.yaml';
    private static initPromise: Promise<void> | null = null;

    /**
     * Initializes the PocketBase instance and loads the YAML configuration.
     * This method is private because it is called automatically by ensureInitialized.
     */
    private static async init(): Promise<void> {
        try {
            if (!fs.existsSync(OtterPocketBase.configPath)) {
                otterlogs.error(`OtterPocketBase: Configuration file not found: ${OtterPocketBase.configPath}`);
                return;
            }

            const fileContents = fs.readFileSync(OtterPocketBase.configPath, 'utf8');
            OtterPocketBase.config = yaml.load(fileContents) as PocketBaseConfig;

            const url = process.env.PB_URL;
            const email = process.env.PB_EMAIL;
            const password = process.env.PB_PASSWORD;

            if (!url) {
                otterlogs.error("OtterPocketBase: PocketBase URL (PB_URL) missing in .env.");
                return;
            }

            // Optimisation pour Docker : Utilisation de Keep-Alive pour éviter les Status 0 / Connection Reset
            const agentOptions = { keepAlive: true, timeout: 60000 };
            const httpAgent = new http.Agent(agentOptions);
            const httpsAgent = new https.Agent(agentOptions);

            const pbInstance = new PocketBase(url, undefined);
            
            // Custom fetch pour gérer le Keep-Alive
            pbInstance.beforeSend = (url, options) => {
                options.agent = url.startsWith('https') ? httpsAgent : httpAgent;
                return { url, options };
            };

            pbInstance.autoCancellation(false);

            if (email && password) {
                try {
                    // Exclusive authentication via the '_superusers' collection (PocketBase v0.23+)
                    await pbInstance.collection('_superusers').authWithPassword(email, password);
                    otterlogs.debug("OtterPocketBase: Successfully initialized via _superusers!");
                } catch (error) {
                    otterlogs.error(`OtterPocketBase: Authentication failed (_superusers): ${error}`);
                }
            } else {
                otterlogs.debug("OtterPocketBase: Initialized in guest mode.");
            }

            // We only set the static instance once it's fully ready/authenticated
            OtterPocketBase.pb = pbInstance;
        } catch (error) {
            otterlogs.error(`OtterPocketBase: Error during initialization: ${error}`);
        }
    }

    /**
     * Ensures the instance is initialized before any operation.
     */
    private static async ensureInitialized(): Promise<void> {
        if (!OtterPocketBase.initPromise) {
            OtterPocketBase.initPromise = OtterPocketBase.init();
        }

        await OtterPocketBase.initPromise;
    }

    /**
     * Retrieves the configuration of a specific alias.
     */
    private static getAliasConfig(alias: string): PocketBaseAlias | undefined {
        return OtterPocketBase.config?.aliases.find(a => a.alias === alias);
    }

    /**
     * Executes a PocketBase action via an alias defined in the YAML file.
     * 
     * @param alias The unique identifier for the action in the YAML config.
     * @param params Additional parameters depending on the action (ID, data, options, etc.).
     * @returns A promise resolving to the typed result T or undefined on error.
     */
    public static async execByAlias<T>(alias: string, ...params: unknown[]): Promise<T | undefined> {
        await OtterPocketBase.ensureInitialized();

        const aliasConfig = OtterPocketBase.getAliasConfig(alias);

        if (!aliasConfig) {
            otterlogs.error(`OtterPocketBase: Alias "${alias}" not found.`);
            return undefined;
        }

        if (!OtterPocketBase.pb) {
            otterlogs.error("OtterPocketBase: Instance could not be initialized.");
            return undefined;
        }

        const maxRetries = 3;
        let attempt = 0;

        while (attempt < maxRetries) {
            try {
                const collection = OtterPocketBase.pb.collection(aliasConfig.collection);
                let result: unknown;

                // Construction intelligente des options
                // On ne prend pas le dernier paramètre s'il correspond à de la data (create/update)
                let providedOptions: Record<string, unknown> = {};
                const lastParam = params[params.length - 1];

                if (params.length > 0 && typeof lastParam === 'object' && lastParam !== null && !Array.isArray(lastParam)) {
                    // Si c'est un getList/getFullList/etc, le dernier param est souvent les options
                    // Pour create/update, on vérifie si on a assez de params pour que le dernier soit les options
                    if (
                        (aliasConfig.action === 'create' && params.length > 1) ||
                        (aliasConfig.action === 'update' && params.length > 2) ||
                        (['getList', 'getFullList', 'getOne', 'getFirstListItem'].includes(aliasConfig.action))
                    ) {
                        providedOptions = lastParam as Record<string, unknown>;
                    }
                }

                const options = {
                    ...(aliasConfig.options || {}),
                    ...providedOptions,
                    requestKey: null // On force la désactivation de l'auto-cancellation
                };

                switch (aliasConfig.action) {
                    case 'getList':
                        result = await collection.getList(params[0] as number || 1, params[1] as number || 30, options);
                        break;
                    case 'getOne':
                        result = await collection.getOne(params[0] as string, options);
                        break;
                    case 'getFullList':
                        result = await collection.getFullList(options);
                        break;
                    case 'getFirstListItem':
                        result = await collection.getFirstListItem(params[0] as string, options);
                        break;
                    case 'create':
                        result = await collection.create(params[0] as Record<string, unknown>, options);
                        break;
                    case 'update':
                        result = await collection.update(params[0] as string, params[1] as Record<string, unknown>, options);
                        break;
                    case 'delete':
                        result = await collection.delete(params[0] as string, options);
                        break;
                    default:
                        otterlogs.error(`OtterPocketBase: Action "${aliasConfig.action}" not supported.`);
                        return undefined;
                }

                return result as T;
            } catch (error) {
                if (error instanceof ClientResponseError && error.status === 404) {
                    return undefined;
                }
                
                if (error instanceof ClientResponseError && (error.status === 0 || error.status >= 500)) {
                    attempt++;
                    if (attempt < maxRetries) {
                        const delay = attempt * 1000;
                        otterlogs.warn(`OtterPocketBase: Alias "${alias}" failed (Status ${error.status}). Retrying in ${delay}ms... (Attempt ${attempt}/${maxRetries})`);
                        await new Promise(resolve => setTimeout(resolve, delay));
                        continue;
                    }
                }

                if (error instanceof ClientResponseError) {
                    otterlogs.error(`OtterPocketBase: Error executing alias "${alias}" (Status ${error.status}): ${error.message} - Data: ${JSON.stringify(error.data)}`);
                } else {
                    otterlogs.error(`OtterPocketBase: Unexpected error executing alias "${alias}": ${error}`);
                }
                
                return undefined;
            }
        }
    }

    /**
     * Direct access to the PocketBase instance for complex needs.
     * Automatically initializes the connection if necessary.
     */
    public static async getClient(): Promise<PocketBase> {
        await OtterPocketBase.ensureInitialized();
        return OtterPocketBase.pb;
    }
}
