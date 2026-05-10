import axios from "axios";
import fs from "fs";
import path from "path";
import {RoutesType} from "./modules/RoutesType";
import {otterlogs} from "../otterlogs";

export class Otterlyapi {
    private static readonly JSON_FILE_NAME = 'otterlyApiRoutes.json';
    private static initPromise: Promise<void> | null = null;

    /**
     * Returns the absolute path to the JSON file containing route configurations.
     * @private
     */
    private static getFilePath(): string {
        return path.join(process.cwd(), Otterlyapi.JSON_FILE_NAME);
    }

    /**
     * Initializes the application by registering the routes defined in a JSON file.
     * Logs a success message if the registration is successful or an error message if it fails.
     * This method ensures that initialization only happens once, unless forceRefresh is true.
     *
     * @param forceRefresh - If true, clears the existing initialization and re-fetches routes.
     * @return {Promise<void>} A promise that resolves when the initialization process completes.
     */
    public static async init(forceRefresh: boolean = false): Promise<void> {
        if (forceRefresh) {
            Otterlyapi.initPromise = null;
        }

        if (!Otterlyapi.initPromise) {
            Otterlyapi.initPromise = (async () => {
                const api = process.env.API_ROUTES_URL;

                if (!api) {
                    otterlogs.error("Otterlyapi: API_ROUTES_URL is not configured in .env");
                    return;
                }

                try {
                    const response = await axios.get(api);
                    const filePath = Otterlyapi.getFilePath();
                    
                    fs.writeFileSync(filePath, JSON.stringify(response.data, null, 2));
                    otterlogs.success("Otterlyapi: Routes registered successfully!");
                } catch (error) {
                    otterlogs.error("Otterlyapi: Failed to register routes: " + error);
                    // On ne reset pas initPromise ici pour éviter de boucler si l'API est down
                }
            })();
        }
        return Otterlyapi.initPromise;
    }

    /**
     * Instance method for initialization, calls the static init method.
     */
    public async init(forceRefresh: boolean = false): Promise<void> {
        await Otterlyapi.init(forceRefresh);
    }

    /**
     * Fetches route information by its alias from the JSON file containing route configurations.
     * Reads and parses the JSON file, then searches for a route matching the provided alias.
     * Returns undefined if the route is not found or if there's an error reading the file.
     *
     * @param alias The alias identifier of the route to search for
     * @returns The route information (RoutesType) if found, undefined otherwise
     */
    public static async getRoutesInfosByAlias(alias: string): Promise<RoutesType | undefined> {
        await Otterlyapi.init();
        const filePath = Otterlyapi.getFilePath();

        try {
            if (!fs.existsSync(filePath)) {
                return undefined;
            }
            const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            const routes: RoutesType[] = Array.isArray(jsonData.data)
                ? jsonData.data
                : Array.isArray(jsonData) ? jsonData : [];

            return routes.find((route: RoutesType) => route.alias === alias);
        } catch (error) {
            otterlogs.error('Otterlyapi: Error reading routes file: ' + error);
            return undefined;
        }
    }

    /**
     * Retrieves data associated with the given alias.
     */
    public static async getDataByAlias<T>(alias: string, param?: string): Promise<T | undefined> {
        if (!alias) {
            otterlogs.error('Otterlyapi: Invalid alias provided for fetching data');
            return undefined;
        }

        const routeInfo = await Otterlyapi.getRoutesInfosByAlias(alias);
        if (!routeInfo) {
            otterlogs.error(`Otterlyapi: No route found for alias: ${alias}`);
            return undefined;
        }

        try {
            const response = await axios.get(routeInfo.route.replace(/:\w+$/, param || ''));
            return response.data.data as T;
        } catch (error) {
            otterlogs.error(`Otterlyapi: Error fetching data for alias ${alias}: ${error}`);
            return undefined;
        }
    }

    /**
     * Sends an HTTP POST request to a route associated with the given alias and fetches the corresponding data.
     */
    public static async postDataByAlias<T>(alias: string, data: T): Promise<T | undefined> {
        if (!alias) {
            otterlogs.error('Otterlyapi: Invalid alias provided for post data');
            return undefined;
        }

        const routeInfo = await Otterlyapi.getRoutesInfosByAlias(alias);
        if (!routeInfo) {
            otterlogs.error(`Otterlyapi: No route found for alias: ${alias}`);
            return undefined;
        }

        if (!process.env.API_TOKEN) {
            otterlogs.error('Otterlyapi: API token is not configured');
            return undefined;
        }

        try {
            const response = await axios.post(routeInfo.route, data, {
                headers: { Authorization: `${process.env.API_TOKEN}` },
                validateStatus: (status) => status >= 200 && status < 300
            });

            if (!response.data || (!response.data.data && !response.data.success)) {
                otterlogs.error(`Otterlyapi: Invalid response data structure for alias ${alias}`);
                return undefined;
            }

            return response.data.data as T;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                otterlogs.error(`Otterlyapi: HTTP error for alias ${alias}: ${error.message}${error.response?.data ? ` - ${JSON.stringify(error.response.data)}` : ''}`);
            } else {
                otterlogs.error(`Otterlyapi: Unexpected error for alias ${alias}: ${error}`);
            }
            return undefined;
        }
    }

    /**
     * Sends a PUT request to update data associated with a given alias.
     */
    public static async putDataByAlias<T>(alias: string, data: T): Promise<T | undefined> {
        if (!alias) {
            otterlogs.error('Otterlyapi: Invalid alias provided for put data');
            return undefined;
        }

        const routeInfo = await Otterlyapi.getRoutesInfosByAlias(alias);
        if (!routeInfo) {
            otterlogs.error(`Otterlyapi: No route found for alias: ${alias}`);
            return undefined;
        }

        if (!process.env.API_TOKEN) {
            otterlogs.error('Otterlyapi: API token is not configured');
            return undefined;
        }

        try {
            const response = await axios.put(routeInfo.route, data, {
                headers: { Authorization: `${process.env.API_TOKEN}` },
                validateStatus: (status) => status >= 200 && status < 300
            });

            if (!response.data || (!response.data.data && !response.data.success)) {
                otterlogs.error(`Otterlyapi: Invalid response data structure for alias ${alias}`);
                return undefined;
            }

            return response.data.data as T;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                otterlogs.error(`Otterlyapi: HTTP error for alias ${alias}: ${error.message}${error.response?.data ? ` - ${JSON.stringify(error.response.data)}` : ''}`);
            } else {
                otterlogs.error(`Otterlyapi: Unexpected error for alias ${alias}: ${error}`);
            }
            return undefined;
        }
    }
}