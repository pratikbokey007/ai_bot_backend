const { GoogleGenerativeAI } = require("@google/generative-ai");

const DEFAULT_MODELS = [
  process.env.GEMINI_MODEL,
  "gemini-2.0-flash",
  "gemini-1.5-flash",
].filter(Boolean);

function isModelNotFoundError(error) {
  return (
    error?.message?.includes("[404 Not Found]") &&
    error?.message?.includes("generateContent")
  );
}

function parseRetryAfterSeconds(error) {
  const retryMatch =
    error?.message?.match(/Please retry in\s+([\d.]+)s/i) ||
    error?.message?.match(/"retryDelay":"(\d+)s"/i);

  if (!retryMatch) {
    return null;
  }

  return Math.ceil(Number(retryMatch[1]));
}

function isQuotaExceededError(error) {
  return (
    error?.message?.includes("Quota exceeded") ||
    error?.message?.includes("RESOURCE_EXHAUSTED")
  );
}

async function generateChatReply(prompt) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set.");
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  let lastError;

  for (const modelName of DEFAULT_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      if (isQuotaExceededError(error)) {
        const quotaError = new Error("Gemini API quota exceeded.");
        quotaError.statusCode = 429;
        quotaError.code = "GEMINI_QUOTA_EXCEEDED";
        quotaError.retryAfterSeconds = parseRetryAfterSeconds(error);
        quotaError.details = error.message;
        throw quotaError;
      }

      lastError = error;

      if (!isModelNotFoundError(error)) {
        throw error;
      }
    }
  }

  throw new Error(
    `No supported Gemini model worked. Tried: ${DEFAULT_MODELS.join(", ")}. Last error: ${lastError?.message}`
  );
}

module.exports = { generateChatReply };
