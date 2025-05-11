import fs from "fs/promises";
import path from "node:path";
import { normalizeError } from "../utils/normalize-error.ts";

/**
 * Directory where all data files are stored.
 */
const DATA_DIR = path.join(process.cwd(), process.env.DATA_DIR || "data");

/**
 * Reads a JSON file and parses its contents into the specified type.
 *
 * @template T - The expected type of the data in the JSON file
 * @param {string} fileName - Name of the file to read
 * @returns {Promise<T>} - A promise that resolves to the parsed JSON data
 * @throws {Error} - If the file cannot be read or parsed
 *
 */
export async function readFile<T>(fileName: string): Promise<T> {
    const filePath = path.join(DATA_DIR, fileName);

    try {
        const fileContent = await fs.readFile(filePath, "utf-8");

        return JSON.parse(fileContent);
    } catch (error) {
        // Normalize the error for consistent handling
        const normalizedError = normalizeError(error);

        throw new Error(
            `Failed to read JSON data from ${filePath}. Reason: ${normalizedError.message}`,
        );
    }
}

/**
 * Writes data to a JSON file
 *
 * @template T - The type of data to write to the file
 * @param {string} fileName - Name of the file to write
 * @param {T} data - The data to serialize and write to the file
 * @returns {Promise<void>} - A promise that resolves when the write operation completes
 * @throws {Error} - If the file cannot be written
 *
 */
export async function writeFile<T>(fileName: string, data: T): Promise<void> {
    const filePath = path.join(DATA_DIR, fileName);

    try {
        // The '2' parameter adds indentation for readability
        const jsonString = JSON.stringify(data, null, 2);

        await fs.writeFile(filePath, jsonString, "utf-8");
    } catch (error) {
        // Normalize the error for consistent handling
        const normalizedError = normalizeError(error);

        throw new Error(
            `Failed to write JSON data to ${filePath}. Reason: ${normalizedError.message}`,
        );
    }
}
