/**
 * Defensive Programming Utilities
 *
 * This file contains utility functions to make the application more robust
 * by handling edge cases, null/undefined values, and API failures gracefully.
 */

/**
 * Safeguard function to ensure models are always iterable
 * @param models The models to safeguard
 * @returns A safe array of models
 */
export function safeguardModelIteration(models: unknown): string[] {
  // Defensive programming approach
  if (!models) {
    // eslint-disable-next-line no-console
    console.warn("DEFENSIVE.MODELS_UNDEFINED");
    return [];
  }

  // Check if models is actually an array
  const safeModels = Array.isArray(models)
    ? models
    : Object.values(models || {});

  return safeModels
    .map((model) => {
      // Safe transformation logic
      try {
        return String(model);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("DEFENSIVE.MODEL_PROCESSING_ERROR", error);
        return null;
      }
    })
    .filter(Boolean) as string[];
}

/**
 * Safeguard function to ensure API responses are always safe
 * @param apiCall The API call to safeguard
 * @param fallback The fallback value if the API call fails
 * @returns The API response or fallback
 */
export async function safeguardApiCall<T>(
  apiCall: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await apiCall();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("DEFENSIVE.API_CALL_FAILED", error);
    return fallback;
  }
}

/**
 * Safeguard function to ensure settings are always safe to access
 * @param settings The settings object to safeguard
 * @param path The path to access (e.g., 'PROVIDER_TOKENS_SET.github')
 * @param fallback The fallback value if the path doesn't exist
 * @returns The value at the path or fallback
 */
export function safeguardSettingsAccess<T>(
  settings: unknown,
  path: string,
  fallback: T,
): T {
  if (!settings) {
    // eslint-disable-next-line no-console
    console.warn("DEFENSIVE.SETTINGS_UNDEFINED");
    return fallback;
  }

  try {
    const keys = path.split(".");
    let current = settings;

    for (const key of keys) {
      if (current && typeof current === "object" && key in current) {
        current = (current as Record<string, unknown>)[key];
      } else {
        return fallback;
      }
    }

    return current !== undefined ? (current as T) : fallback;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("DEFENSIVE.SETTINGS_ACCESS_ERROR", path, error);
    return fallback;
  }
}

/**
 * Safeguard function to ensure arrays are always safe to iterate
 * @param array The array to safeguard
 * @param fallback The fallback array if the input is invalid
 * @returns A safe array
 */
export function safeguardArray<T>(array: unknown, fallback: T[] = []): T[] {
  if (!array) {
    return fallback;
  }

  if (Array.isArray(array)) {
    return array;
  }

  if (typeof array === "object") {
    return Object.values(array);
  }

  return fallback;
}

/**
 * Safeguard function to ensure objects are always safe to access
 * @param obj The object to safeguard
 * @param fallback The fallback object if the input is invalid
 * @returns A safe object
 */
export function safeguardObject<T extends object>(
  obj: unknown,
  fallback: T,
): T {
  if (!obj || typeof obj !== "object") {
    return fallback;
  }

  return obj as T;
}

/**
 * Safeguard function to ensure strings are always safe
 * @param str The string to safeguard
 * @param fallback The fallback string if the input is invalid
 * @returns A safe string
 */
export function safeguardString(str: unknown, fallback: string = ""): string {
  if (typeof str === "string") {
    return str;
  }

  if (str === null || str === undefined) {
    return fallback;
  }

  try {
    return String(str);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("DEFENSIVE.STRING_CONVERSION_ERROR", error);
    return fallback;
  }
}

/**
 * Safeguard function to ensure numbers are always safe
 * @param num The number to safeguard
 * @param fallback The fallback number if the input is invalid
 * @returns A safe number
 */
export function safeguardNumber(num: unknown, fallback: number = 0): number {
  if (typeof num === "number" && !Number.isNaN(num)) {
    return num;
  }

  if (num === null || num === undefined) {
    return fallback;
  }

  const parsed = Number(num);
  return Number.isNaN(parsed) ? fallback : parsed;
}

/**
 * Safeguard function to ensure booleans are always safe
 * @param bool The boolean to safeguard
 * @param fallback The fallback boolean if the input is invalid
 * @returns A safe boolean
 */
export function safeguardBoolean(
  bool: unknown,
  fallback: boolean = false,
): boolean {
  if (typeof bool === "boolean") {
    return bool;
  }

  if (bool === null || bool === undefined) {
    return fallback;
  }

  return Boolean(bool);
}
