import { extractModelAndProvider } from "./extract-model-and-provider";
import { safeguardModelIteration } from "./defensive-programming";

/**
 * Given a list of models, organize them by provider
 * @param models The list of models
 * @returns An object containing the provider and models
 *
 * @example
 * const models = [
 *  "azure/ada",
 *  "azure/gpt-35-turbo",
 *  "cohere.command-r-v1:0",
 * ];
 *
 * organizeModelsAndProviders(models);
 * // returns {
 * //   azure: {
 * //     separator: "/",
 * //     models: ["ada", "gpt-35-turbo"],
 * //   },
 * //   cohere: {
 * //     separator: ".",
 * //     models: ["command-r-v1:0"],
 * //   },
 * // }
 */
export const organizeModelsAndProviders = (models: string[]) => {
  const object: Record<string, { separator: string; models: string[] }> = {};

  // Apply defensive programming
  const safeModels = safeguardModelIteration(models);

  safeModels.forEach((model) => {
    try {
      const {
        separator,
        provider,
        model: modelId,
      } = extractModelAndProvider(model);

      // Ignore "anthropic" providers with a separator of "."
      // These are outdated and incompatible providers.
      if (provider === "anthropic" && separator === ".") {
        return;
      }

      const key = provider || "other";
      if (!object[key]) {
        object[key] = { separator, models: [] };
      }
      object[key].models.push(modelId);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("DEFENSIVE.MODEL_PROCESSING_ERROR", model, error);
      // Continue processing other models
    }
  });

  return object;
};
