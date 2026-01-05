/**
 * Converts the current date and time into an SQL-compatible datetime string.
 * The output format is "YYYY-MM-DD HH:mm:ss".
 *
 * @return {string} A string representing the current date and time in SQL-compatible format.
 */
export function getSqlDate() {
    return new Date().toISOString().slice(0, 19).replace("T", " ");
}
