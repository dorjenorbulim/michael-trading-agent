// src/index.ts
import { logger as logger10, ModelType as ModelType7 } from "@elizaos/core";

// src/init.ts
import { logger as logger2 } from "@elizaos/core";

// src/utils/config.ts
import { logger } from "@elizaos/core";
function getSetting(runtime, key, defaultValue) {
  const value = runtime.getSetting(key);
  if (value !== undefined && value !== null) {
    return String(value);
  }
  return process.env[key] ?? defaultValue;
}
function isBrowser() {
  return typeof globalThis !== "undefined" && "document" in globalThis && typeof globalThis.document !== "undefined";
}
function isProxyMode(runtime) {
  return isBrowser() && !!getSetting(runtime, "OPENAI_BROWSER_BASE_URL");
}
function getAuthHeader(runtime, forEmbedding = false) {
  if (isBrowser())
    return {};
  const key = forEmbedding ? getEmbeddingApiKey(runtime) : getApiKey(runtime);
  return key ? { Authorization: `Bearer ${key}` } : {};
}
function getBaseURL(runtime) {
  const browserURL = getSetting(runtime, "OPENAI_BROWSER_BASE_URL");
  const baseURL = isBrowser() && browserURL ? browserURL : getSetting(runtime, "OPENAI_BASE_URL", "https://api.openai.com/v1");
  logger.debug(`[OpenAI] Default base URL: ${baseURL}`);
  return baseURL;
}
function getEmbeddingBaseURL(runtime) {
  const embeddingURL = isBrowser() ? getSetting(runtime, "OPENAI_BROWSER_EMBEDDING_URL") || getSetting(runtime, "OPENAI_BROWSER_BASE_URL") : getSetting(runtime, "OPENAI_EMBEDDING_URL");
  if (embeddingURL) {
    logger.debug(`[OpenAI] Using specific embedding base URL: ${embeddingURL}`);
    return embeddingURL;
  }
  logger.debug("[OpenAI] Falling back to general base URL for embeddings.");
  return getBaseURL(runtime);
}
function getApiKey(runtime) {
  return getSetting(runtime, "OPENAI_API_KEY");
}
function getEmbeddingApiKey(runtime) {
  const embeddingApiKey = getSetting(runtime, "OPENAI_EMBEDDING_API_KEY");
  if (embeddingApiKey) {
    logger.debug("[OpenAI] Using specific embedding API key (present)");
    return embeddingApiKey;
  }
  logger.debug("[OpenAI] Falling back to general API key for embeddings.");
  return getApiKey(runtime);
}
function getSmallModel(runtime) {
  return getSetting(runtime, "OPENAI_SMALL_MODEL") ?? getSetting(runtime, "SMALL_MODEL", "gpt-4o-mini");
}
function getLargeModel(runtime) {
  return getSetting(runtime, "OPENAI_LARGE_MODEL") ?? getSetting(runtime, "LARGE_MODEL", "gpt-4o");
}
function getImageDescriptionModel(runtime) {
  return getSetting(runtime, "OPENAI_IMAGE_DESCRIPTION_MODEL", "gpt-5-nano");
}
function getExperimentalTelemetry(runtime) {
  const setting = getSetting(runtime, "OPENAI_EXPERIMENTAL_TELEMETRY", "false");
  const normalizedSetting = String(setting).toLowerCase();
  const result = normalizedSetting === "true";
  logger.debug(`[OpenAI] Experimental telemetry in function: "${setting}" (type: ${typeof setting}, normalized: "${normalizedSetting}", result: ${result})`);
  return result;
}

// src/init.ts
function initializeOpenAI(_config, runtime) {
  (async () => {
    try {
      if (!getApiKey(runtime) && !isBrowser()) {
        logger2.warn("OPENAI_API_KEY is not set in environment - OpenAI functionality will be limited");
        return;
      }
      try {
        const baseURL = getBaseURL(runtime);
        const response = await fetch(`${baseURL}/models`, {
          headers: getAuthHeader(runtime)
        });
        if (!response.ok) {
          logger2.warn(`OpenAI API key validation failed: ${response.statusText}`);
          logger2.warn("OpenAI functionality will be limited until a valid API key is provided");
        } else {
          logger2.log("OpenAI API key validated successfully");
        }
      } catch (fetchError) {
        const message = fetchError instanceof Error ? fetchError.message : String(fetchError);
        logger2.warn(`Error validating OpenAI API key: ${message}`);
        logger2.warn("OpenAI functionality will be limited until a valid API key is provided");
      }
    } catch (error) {
      const message = error?.errors?.map((e) => e.message).join(", ") || (error instanceof Error ? error.message : String(error));
      logger2.warn(`OpenAI plugin configuration issue: ${message} - You need to configure the OPENAI_API_KEY in your environment variables`);
    }
  })();
}

// src/models/text.ts
import { logger as logger3, ModelType } from "@elizaos/core";
import { generateText, streamText } from "ai";

// src/providers/openai.ts
import { createOpenAI } from "@ai-sdk/openai";
function createOpenAIClient(runtime) {
  const baseURL = getBaseURL(runtime);
  const apiKey = getApiKey(runtime) ?? (isProxyMode(runtime) ? "sk-proxy" : undefined);
  return createOpenAI({ apiKey: apiKey ?? "", baseURL });
}

// src/utils/events.ts
import { EventType } from "@elizaos/core";
function emitModelUsageEvent(runtime, type, prompt, usage) {
  const promptTokens = ("promptTokens" in usage ? usage.promptTokens : undefined) ?? ("inputTokens" in usage ? usage.inputTokens : undefined) ?? 0;
  const completionTokens = ("completionTokens" in usage ? usage.completionTokens : undefined) ?? ("outputTokens" in usage ? usage.outputTokens : undefined) ?? 0;
  const totalTokens = ("totalTokens" in usage ? usage.totalTokens : undefined) ?? promptTokens + completionTokens;
  const truncatedPrompt = typeof prompt === "string" ? prompt.length > 200 ? `${prompt.slice(0, 200)}…` : prompt : "";
  runtime.emitEvent(EventType.MODEL_USED, {
    runtime,
    source: "openai",
    provider: "openai",
    type,
    prompt: truncatedPrompt,
    tokens: {
      prompt: promptTokens,
      completion: completionTokens,
      total: totalTokens
    }
  });
}

// src/models/text.ts
async function generateTextByModelType(runtime, params, modelType, getModelFn) {
  const openai = createOpenAIClient(runtime);
  const modelName = getModelFn(runtime);
  logger3.debug(`[OpenAI] ${modelType} model: ${modelName}`);
  const generateParams = {
    model: openai.languageModel(modelName),
    prompt: params.prompt,
    system: runtime.character.system ?? undefined,
    temperature: params.temperature ?? 0.7,
    maxOutputTokens: params.maxTokens ?? 8192,
    frequencyPenalty: params.frequencyPenalty ?? 0.7,
    presencePenalty: params.presencePenalty ?? 0.7,
    stopSequences: params.stopSequences ?? [],
    experimental_telemetry: { isEnabled: getExperimentalTelemetry(runtime) }
  };
  if (params.stream) {
    const result = streamText(generateParams);
    return {
      textStream: result.textStream,
      text: result.text,
      usage: result.usage.then((u) => u ? {
        promptTokens: u.inputTokens ?? 0,
        completionTokens: u.outputTokens ?? 0,
        totalTokens: (u.inputTokens ?? 0) + (u.outputTokens ?? 0)
      } : undefined),
      finishReason: result.finishReason
    };
  }
  const { text, usage } = await generateText(generateParams);
  if (usage)
    emitModelUsageEvent(runtime, modelType, params.prompt, usage);
  return text;
}
async function handleTextSmall(runtime, params) {
  return generateTextByModelType(runtime, params, ModelType.TEXT_SMALL, getSmallModel);
}
async function handleTextLarge(runtime, params) {
  return generateTextByModelType(runtime, params, ModelType.TEXT_LARGE, getLargeModel);
}
// src/models/embedding.ts
import { logger as logger4, ModelType as ModelType2, VECTOR_DIMS } from "@elizaos/core";
async function handleTextEmbedding(runtime, params) {
  const embeddingModelName = getSetting(runtime, "OPENAI_EMBEDDING_MODEL", "text-embedding-3-small");
  const embeddingDimension = Number.parseInt(getSetting(runtime, "OPENAI_EMBEDDING_DIMENSIONS", "1536") || "1536", 10);
  if (!Object.values(VECTOR_DIMS).includes(embeddingDimension)) {
    const errorMsg = `Invalid embedding dimension: ${embeddingDimension}. Must be one of: ${Object.values(VECTOR_DIMS).join(", ")}`;
    logger4.error(errorMsg);
    throw new Error(errorMsg);
  }
  if (params === null) {
    logger4.debug("Creating test embedding for initialization");
    const testVector = Array(embeddingDimension).fill(0);
    testVector[0] = 0.1;
    return testVector;
  }
  let text;
  if (typeof params === "string") {
    text = params;
  } else if (typeof params === "object" && params.text) {
    text = params.text;
  } else {
    const errorMsg = "Invalid input format for embedding";
    logger4.warn(errorMsg);
    const fallbackVector = Array(embeddingDimension).fill(0);
    fallbackVector[0] = 0.2;
    return fallbackVector;
  }
  if (!text.trim()) {
    const errorMsg = "Empty text for embedding";
    logger4.warn(errorMsg);
    const fallbackVector = Array(embeddingDimension).fill(0);
    fallbackVector[0] = 0.3;
    return fallbackVector;
  }
  const embeddingBaseURL = getEmbeddingBaseURL(runtime);
  try {
    const response = await fetch(`${embeddingBaseURL}/embeddings`, {
      method: "POST",
      headers: {
        ...getAuthHeader(runtime, true),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: embeddingModelName,
        input: text
      })
    });
    if (!response.ok) {
      logger4.error(`OpenAI API error: ${response.status} - ${response.statusText}`);
      throw new Error(`OpenAI API error: ${response.status} - ${response.statusText}`);
    }
    const data = await response.json();
    if (!data?.data?.[0]?.embedding) {
      logger4.error("API returned invalid structure");
      throw new Error("API returned invalid structure");
    }
    const embedding = data.data[0].embedding;
    if (!Array.isArray(embedding) || embedding.length !== embeddingDimension) {
      const errorMsg = `Embedding length ${embedding?.length ?? 0} does not match configured dimension ${embeddingDimension}`;
      logger4.error(errorMsg);
      const fallbackVector = Array(embeddingDimension).fill(0);
      fallbackVector[0] = 0.4;
      return fallbackVector;
    }
    if (data.usage) {
      const usage = {
        inputTokens: data.usage.prompt_tokens,
        outputTokens: 0,
        totalTokens: data.usage.total_tokens
      };
      emitModelUsageEvent(runtime, ModelType2.TEXT_EMBEDDING, text, usage);
    }
    logger4.log(`Got valid embedding with length ${embedding.length}`);
    return embedding;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger4.error(`Error generating embedding: ${message}`);
    throw error instanceof Error ? error : new Error(message);
  }
}
// src/models/image.ts
import { logger as logger5, ModelType as ModelType3 } from "@elizaos/core";
async function handleImageGeneration(runtime, params) {
  const n = params.count || 1;
  const size = params.size || "1024x1024";
  const prompt = params.prompt;
  const modelName = getSetting(runtime, "OPENAI_IMAGE_MODEL", "gpt-image-1");
  logger5.log(`[OpenAI] Using IMAGE model: ${modelName}`);
  const baseURL = getBaseURL(runtime);
  try {
    const response = await fetch(`${baseURL}/images/generations`, {
      method: "POST",
      headers: {
        ...getAuthHeader(runtime),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: modelName,
        prompt,
        n,
        size
      })
    });
    if (!response.ok) {
      throw new Error(`Failed to generate image: ${response.statusText}`);
    }
    const data = await response.json();
    const typedData = data;
    return typedData.data;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw error;
  }
}
async function handleImageDescription(runtime, params) {
  let imageUrl;
  let promptText;
  const modelName = getImageDescriptionModel(runtime);
  logger5.log(`[OpenAI] Using IMAGE_DESCRIPTION model: ${modelName}`);
  const maxTokens = Number.parseInt(getSetting(runtime, "OPENAI_IMAGE_DESCRIPTION_MAX_TOKENS", "8192") || "8192", 10);
  const DEFAULT_PROMPT = "Please analyze this image and provide a title and detailed description.";
  if (typeof params === "string") {
    imageUrl = params;
    promptText = DEFAULT_PROMPT;
  } else {
    imageUrl = params.imageUrl;
    promptText = params.prompt || DEFAULT_PROMPT;
  }
  const messages = [
    {
      role: "user",
      content: [
        { type: "text", text: promptText },
        { type: "image_url", image_url: { url: imageUrl } }
      ]
    }
  ];
  const baseURL = getBaseURL(runtime);
  try {
    const requestBody = {
      model: modelName,
      messages,
      max_tokens: maxTokens
    };
    const response = await fetch(`${baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(runtime)
      },
      body: JSON.stringify(requestBody)
    });
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }
    const result = await response.json();
    const typedResult = result;
    const content = typedResult.choices?.[0]?.message?.content;
    if (typedResult.usage) {
      emitModelUsageEvent(runtime, ModelType3.IMAGE_DESCRIPTION, typeof params === "string" ? params : params.prompt || "", {
        inputTokens: typedResult.usage.prompt_tokens,
        outputTokens: typedResult.usage.completion_tokens,
        totalTokens: typedResult.usage.total_tokens
      });
    }
    if (!content) {
      return {
        title: "Failed to analyze image",
        description: "No response from API"
      };
    }
    const titleMatch = content.match(/title[:\s]+(.+?)(?:\n|$)/i);
    const title = titleMatch?.[1]?.trim();
    if (!title) {
      logger5.warn("Could not extract title from image description response");
    }
    const finalTitle = title || "Image Analysis";
    const description = content.replace(/title[:\s]+(.+?)(?:\n|$)/i, "").trim();
    const processedResult = { title: finalTitle, description };
    return processedResult;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger5.error(`Error analyzing image: ${message}`);
    return {
      title: "Failed to analyze image",
      description: `Error: ${message}`
    };
  }
}
// src/models/audio.ts
import { logger as logger7 } from "@elizaos/core";

// src/utils/audio.ts
import { logger as logger6 } from "@elizaos/core";
var MAGIC_BYTES = {
  WAV: {
    HEADER: [82, 73, 70, 70],
    IDENTIFIER: [87, 65, 86, 69]
  },
  MP3_ID3: [73, 68, 51],
  OGG: [79, 103, 103, 83],
  FLAC: [102, 76, 97, 67],
  FTYP: [102, 116, 121, 112],
  WEBM_EBML: [26, 69, 223, 163]
};
function matchBytes(buffer, offset, bytes) {
  for (let i = 0;i < bytes.length; i++) {
    if (buffer[offset + i] !== bytes[i])
      return false;
  }
  return true;
}
function detectAudioMimeType(buffer) {
  if (buffer.length < 12) {
    return "application/octet-stream";
  }
  if (matchBytes(buffer, 0, MAGIC_BYTES.WAV.HEADER) && matchBytes(buffer, 8, MAGIC_BYTES.WAV.IDENTIFIER)) {
    return "audio/wav";
  }
  if (matchBytes(buffer, 0, MAGIC_BYTES.MP3_ID3) || buffer[0] === 255 && (buffer[1] & 224) === 224) {
    return "audio/mpeg";
  }
  if (matchBytes(buffer, 0, MAGIC_BYTES.OGG)) {
    return "audio/ogg";
  }
  if (matchBytes(buffer, 0, MAGIC_BYTES.FLAC)) {
    return "audio/flac";
  }
  if (matchBytes(buffer, 4, MAGIC_BYTES.FTYP)) {
    return "audio/mp4";
  }
  if (matchBytes(buffer, 0, MAGIC_BYTES.WEBM_EBML)) {
    return "audio/webm";
  }
  logger6.warn("Could not detect audio format from buffer, using generic binary type");
  return "application/octet-stream";
}

// src/models/audio.ts
async function fetchTextToSpeech(runtime, options) {
  const defaultModel = getSetting(runtime, "OPENAI_TTS_MODEL", "gpt-4o-mini-tts");
  const defaultVoice = getSetting(runtime, "OPENAI_TTS_VOICE", "nova");
  const defaultInstructions = getSetting(runtime, "OPENAI_TTS_INSTRUCTIONS", "");
  const baseURL = getBaseURL(runtime);
  const model = options.model || defaultModel;
  const voice = options.voice || defaultVoice;
  const instructions = options.instructions ?? defaultInstructions;
  const format = options.format || "mp3";
  try {
    const res = await fetch(`${baseURL}/audio/speech`, {
      method: "POST",
      headers: {
        ...getAuthHeader(runtime),
        "Content-Type": "application/json",
        ...format === "mp3" ? { Accept: "audio/mpeg" } : {}
      },
      body: JSON.stringify({
        model,
        voice,
        input: options.text,
        format,
        ...instructions && { instructions }
      })
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI TTS error ${res.status}: ${err}`);
    }
    return await res.arrayBuffer();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to fetch speech from OpenAI TTS: ${message}`);
  }
}
async function handleTranscription(runtime, input) {
  let modelName = getSetting(runtime, "OPENAI_TRANSCRIPTION_MODEL", "gpt-4o-mini-transcribe");
  logger7.log(`[OpenAI] Using TRANSCRIPTION model: ${modelName}`);
  const baseURL = getBaseURL(runtime);
  let blob;
  let extraParams = null;
  if (input instanceof Blob || input instanceof File) {
    blob = input;
  } else if (Buffer.isBuffer(input)) {
    const detectedMimeType = detectAudioMimeType(input);
    logger7.debug(`Auto-detected audio MIME type: ${detectedMimeType}`);
    const uint8Array = new Uint8Array(input);
    blob = new Blob([uint8Array], { type: detectedMimeType });
  } else if (typeof input === "object" && input !== null && input.audio != null) {
    const params = input;
    if (!(params.audio instanceof Blob) && !(params.audio instanceof File) && !Buffer.isBuffer(params.audio)) {
      throw new Error("TRANSCRIPTION param 'audio' must be a Blob/File/Buffer.");
    }
    if (Buffer.isBuffer(params.audio)) {
      let mimeType = params.mimeType;
      if (!mimeType) {
        mimeType = detectAudioMimeType(params.audio);
        logger7.debug(`Auto-detected audio MIME type: ${mimeType}`);
      } else {
        logger7.debug(`Using provided MIME type: ${mimeType}`);
      }
      const uint8Array = new Uint8Array(params.audio);
      blob = new Blob([uint8Array], { type: mimeType });
    } else {
      blob = params.audio;
    }
    extraParams = params;
    if (typeof params.model === "string" && params.model) {
      modelName = params.model;
    }
  } else {
    throw new Error("TRANSCRIPTION expects a Blob/File/Buffer or an object { audio: Blob/File/Buffer, mimeType?, language?, response_format?, timestampGranularities?, prompt?, temperature?, model? }");
  }
  const mime = blob.type || "audio/webm";
  const filename = blob.name || (mime.includes("mp3") || mime.includes("mpeg") ? "recording.mp3" : mime.includes("ogg") ? "recording.ogg" : mime.includes("wav") ? "recording.wav" : mime.includes("webm") ? "recording.webm" : "recording.bin");
  const formData = new FormData;
  formData.append("file", blob, filename);
  formData.append("model", String(modelName));
  if (extraParams) {
    if (typeof extraParams.language === "string") {
      formData.append("language", String(extraParams.language));
    }
    if (typeof extraParams.response_format === "string") {
      formData.append("response_format", String(extraParams.response_format));
    }
    if (typeof extraParams.prompt === "string") {
      formData.append("prompt", String(extraParams.prompt));
    }
    if (typeof extraParams.temperature === "number") {
      formData.append("temperature", String(extraParams.temperature));
    }
    if (Array.isArray(extraParams.timestampGranularities)) {
      for (const g of extraParams.timestampGranularities) {
        formData.append("timestamp_granularities[]", String(g));
      }
    }
  }
  try {
    const response = await fetch(`${baseURL}/audio/transcriptions`, {
      method: "POST",
      headers: {
        ...getAuthHeader(runtime)
      },
      body: formData
    });
    if (!response.ok) {
      throw new Error(`Failed to transcribe audio: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data.text || "";
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger7.error(`TRANSCRIPTION error: ${message}`);
    throw error;
  }
}
async function handleTextToSpeech(runtime, input) {
  const options = typeof input === "string" ? { text: input } : input;
  const resolvedModel = options.model || getSetting(runtime, "OPENAI_TTS_MODEL", "gpt-4o-mini-tts");
  logger7.log(`[OpenAI] Using TEXT_TO_SPEECH model: ${resolvedModel}`);
  try {
    return await fetchTextToSpeech(runtime, options);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger7.error(`Error in TEXT_TO_SPEECH: ${message}`);
    throw error;
  }
}
// src/models/object.ts
import { logger as logger9, ModelType as ModelType4 } from "@elizaos/core";
import { generateObject } from "ai";

// src/utils/json.ts
import { logger as logger8 } from "@elizaos/core";
import { JSONParseError } from "ai";
function getJsonRepairFunction() {
  return async ({ text, error }) => {
    try {
      if (error instanceof JSONParseError) {
        const cleanedText = text.replace(/```json\n|\n```|```/g, "");
        JSON.parse(cleanedText);
        return cleanedText;
      }
      return null;
    } catch (jsonError) {
      const message = jsonError instanceof Error ? jsonError.message : String(jsonError);
      logger8.warn(`Failed to repair JSON text: ${message}`);
      return null;
    }
  };
}

// src/models/object.ts
async function generateObjectByModelType(runtime, params, modelType, getModelFn) {
  const openai = createOpenAIClient(runtime);
  const modelName = getModelFn(runtime);
  logger9.log(`[OpenAI] Using ${modelType} model: ${modelName}`);
  const temperature = params.temperature ?? 0;
  const schemaPresent = !!params.schema;
  if (schemaPresent) {
    logger9.warn(`Schema provided but ignored: OpenAI object generation currently uses output=no-schema. The schema parameter has no effect.`);
  }
  try {
    const { object, usage } = await generateObject({
      model: openai.languageModel(modelName),
      output: "no-schema",
      prompt: params.prompt,
      temperature,
      experimental_repairText: getJsonRepairFunction()
    });
    if (usage) {
      emitModelUsageEvent(runtime, modelType, params.prompt, usage);
    }
    return object;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger9.error(`[generateObject] Error: ${message}`);
    throw error;
  }
}
async function handleObjectSmall(runtime, params) {
  return generateObjectByModelType(runtime, params, ModelType4.OBJECT_SMALL, getSmallModel);
}
async function handleObjectLarge(runtime, params) {
  return generateObjectByModelType(runtime, params, ModelType4.OBJECT_LARGE, getLargeModel);
}
// src/models/tokenizer.ts
import { ModelType as ModelType6 } from "@elizaos/core";

// src/utils/tokenization.ts
import { ModelType as ModelType5 } from "@elizaos/core";
import { encodingForModel, getEncoding } from "js-tiktoken";
function resolveTokenizerEncoding(modelName) {
  const normalized = modelName.toLowerCase();
  const fallbackEncoding = normalized.includes("4o") ? "o200k_base" : "cl100k_base";
  try {
    return encodingForModel(modelName);
  } catch (error) {
    return getEncoding(fallbackEncoding);
  }
}
async function tokenizeText(runtime, model, prompt) {
  const modelName = model === ModelType5.TEXT_SMALL ? getSmallModel(runtime) : getLargeModel(runtime);
  const tokens = resolveTokenizerEncoding(modelName).encode(prompt);
  return tokens;
}
async function detokenizeText(runtime, model, tokens) {
  const modelName = model === ModelType5.TEXT_SMALL ? getSmallModel(runtime) : getLargeModel(runtime);
  return resolveTokenizerEncoding(modelName).decode(tokens);
}

// src/models/tokenizer.ts
async function handleTokenizerEncode(runtime, { prompt, modelType = ModelType6.TEXT_LARGE }) {
  return await tokenizeText(runtime, modelType, prompt);
}
async function handleTokenizerDecode(runtime, { tokens, modelType = ModelType6.TEXT_LARGE }) {
  return await detokenizeText(runtime, modelType, tokens);
}
// src/index.ts
var openaiPlugin = {
  name: "openai",
  description: "OpenAI plugin",
  config: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_BASE_URL: process.env.OPENAI_BASE_URL,
    OPENAI_SMALL_MODEL: process.env.OPENAI_SMALL_MODEL,
    OPENAI_LARGE_MODEL: process.env.OPENAI_LARGE_MODEL,
    SMALL_MODEL: process.env.SMALL_MODEL,
    LARGE_MODEL: process.env.LARGE_MODEL,
    OPENAI_EMBEDDING_MODEL: process.env.OPENAI_EMBEDDING_MODEL,
    OPENAI_EMBEDDING_API_KEY: process.env.OPENAI_EMBEDDING_API_KEY,
    OPENAI_EMBEDDING_URL: process.env.OPENAI_EMBEDDING_URL,
    OPENAI_EMBEDDING_DIMENSIONS: process.env.OPENAI_EMBEDDING_DIMENSIONS,
    OPENAI_IMAGE_DESCRIPTION_MODEL: process.env.OPENAI_IMAGE_DESCRIPTION_MODEL,
    OPENAI_IMAGE_DESCRIPTION_MAX_TOKENS: process.env.OPENAI_IMAGE_DESCRIPTION_MAX_TOKENS,
    OPENAI_EXPERIMENTAL_TELEMETRY: process.env.OPENAI_EXPERIMENTAL_TELEMETRY
  },
  async init(_config, runtime) {
    initializeOpenAI(_config, runtime);
  },
  models: {
    [ModelType7.TEXT_EMBEDDING]: async (runtime, params) => {
      return handleTextEmbedding(runtime, params);
    },
    [ModelType7.TEXT_TOKENIZER_ENCODE]: async (runtime, params) => {
      return handleTokenizerEncode(runtime, params);
    },
    [ModelType7.TEXT_TOKENIZER_DECODE]: async (runtime, params) => {
      return handleTokenizerDecode(runtime, params);
    },
    [ModelType7.TEXT_SMALL]: async (runtime, params) => {
      return handleTextSmall(runtime, params);
    },
    [ModelType7.TEXT_LARGE]: async (runtime, params) => {
      return handleTextLarge(runtime, params);
    },
    [ModelType7.IMAGE]: async (runtime, params) => {
      return handleImageGeneration(runtime, params);
    },
    [ModelType7.IMAGE_DESCRIPTION]: async (runtime, params) => {
      return handleImageDescription(runtime, params);
    },
    [ModelType7.TRANSCRIPTION]: async (runtime, input) => {
      return handleTranscription(runtime, input);
    },
    [ModelType7.TEXT_TO_SPEECH]: async (runtime, input) => {
      return handleTextToSpeech(runtime, input);
    },
    [ModelType7.OBJECT_SMALL]: async (runtime, params) => {
      return handleObjectSmall(runtime, params);
    },
    [ModelType7.OBJECT_LARGE]: async (runtime, params) => {
      return handleObjectLarge(runtime, params);
    }
  },
  tests: [
    {
      name: "openai_plugin_tests",
      tests: [
        {
          name: "openai_test_url_and_api_key_validation",
          fn: async (runtime) => {
            const baseURL = getBaseURL(runtime);
            const response = await fetch(`${baseURL}/models`, {
              headers: getAuthHeader(runtime)
            });
            const data = await response.json();
            logger10.log({ data: data?.data?.length ?? "N/A" }, "Models Available");
            if (!response.ok) {
              throw new Error(`Failed to validate OpenAI API key: ${response.statusText}`);
            }
          }
        },
        {
          name: "openai_test_text_embedding",
          fn: async (runtime) => {
            try {
              const embedding = await runtime.useModel(ModelType7.TEXT_EMBEDDING, {
                text: "Hello, world!"
              });
              logger10.log({ embedding }, "embedding");
            } catch (error) {
              const message = error instanceof Error ? error.message : String(error);
              logger10.error(`Error in test_text_embedding: ${message}`);
              throw error;
            }
          }
        },
        {
          name: "openai_test_text_large",
          fn: async (runtime) => {
            try {
              const text = await runtime.useModel(ModelType7.TEXT_LARGE, {
                prompt: "What is the nature of reality in 10 words?"
              });
              if (text.length === 0) {
                throw new Error("Failed to generate text");
              }
              logger10.log({ text }, "generated with test_text_large");
            } catch (error) {
              const message = error instanceof Error ? error.message : String(error);
              logger10.error(`Error in test_text_large: ${message}`);
              throw error;
            }
          }
        },
        {
          name: "openai_test_text_small",
          fn: async (runtime) => {
            try {
              const text = await runtime.useModel(ModelType7.TEXT_SMALL, {
                prompt: "What is the nature of reality in 10 words?"
              });
              if (text.length === 0) {
                throw new Error("Failed to generate text");
              }
              logger10.log({ text }, "generated with test_text_small");
            } catch (error) {
              const message = error instanceof Error ? error.message : String(error);
              logger10.error(`Error in test_text_small: ${message}`);
              throw error;
            }
          }
        },
        {
          name: "openai_test_image_generation",
          fn: async (runtime) => {
            logger10.log("openai_test_image_generation");
            try {
              const image = await runtime.useModel(ModelType7.IMAGE, {
                prompt: "A beautiful sunset over a calm ocean",
                count: 1,
                size: "1024x1024"
              });
              logger10.log({ image }, "generated with test_image_generation");
            } catch (error) {
              const message = error instanceof Error ? error.message : String(error);
              logger10.error(`Error in test_image_generation: ${message}`);
              throw error;
            }
          }
        },
        {
          name: "image-description",
          fn: async (runtime) => {
            try {
              logger10.log("openai_test_image_description");
              try {
                const result = await runtime.useModel(ModelType7.IMAGE_DESCRIPTION, "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Vitalik_Buterin_TechCrunch_London_2015_%28cropped%29.jpg/537px-Vitalik_Buterin_TechCrunch_London_2015_%28cropped%29.jpg");
                if (result && typeof result === "object" && "title" in result && "description" in result) {
                  logger10.log({ result }, "Image description");
                } else {
                  logger10.error("Invalid image description result format:", result);
                }
              } catch (e) {
                const message = e instanceof Error ? e.message : String(e);
                logger10.error(`Error in image description test: ${message}`);
              }
            } catch (e) {
              const message = e instanceof Error ? e.message : String(e);
              logger10.error(`Error in openai_test_image_description: ${message}`);
            }
          }
        },
        {
          name: "openai_test_transcription",
          fn: async (runtime) => {
            logger10.log("openai_test_transcription");
            try {
              const response = await fetch("https://upload.wikimedia.org/wikipedia/en/4/40/Chris_Benoit_Voice_Message.ogg");
              const arrayBuffer = await response.arrayBuffer();
              const transcription = await runtime.useModel(ModelType7.TRANSCRIPTION, Buffer.from(new Uint8Array(arrayBuffer)));
              logger10.log({ transcription }, "generated with test_transcription");
            } catch (error) {
              const message = error instanceof Error ? error.message : String(error);
              logger10.error(`Error in test_transcription: ${message}`);
              throw error;
            }
          }
        },
        {
          name: "openai_test_text_tokenizer_encode",
          fn: async (runtime) => {
            const prompt = "Hello tokenizer encode!";
            const tokens = await runtime.useModel(ModelType7.TEXT_TOKENIZER_ENCODE, { prompt, modelType: ModelType7.TEXT_SMALL });
            if (!Array.isArray(tokens) || tokens.length === 0) {
              throw new Error("Failed to tokenize text: expected non-empty array of tokens");
            }
            logger10.log({ tokens }, "Tokenized output");
          }
        },
        {
          name: "openai_test_text_tokenizer_decode",
          fn: async (runtime) => {
            const prompt = "Hello tokenizer decode!";
            const tokens = await runtime.useModel(ModelType7.TEXT_TOKENIZER_ENCODE, { prompt, modelType: ModelType7.TEXT_SMALL });
            const decodedText = await runtime.useModel(ModelType7.TEXT_TOKENIZER_DECODE, {
              tokens,
              modelType: ModelType7.TEXT_SMALL
            });
            if (decodedText !== prompt) {
              throw new Error(`Decoded text does not match original. Expected "${prompt}", got "${decodedText}"`);
            }
            logger10.log({ decodedText }, "Decoded text");
          }
        },
        {
          name: "openai_test_text_to_speech",
          fn: async (runtime) => {
            try {
              const response = await runtime.useModel(ModelType7.TEXT_TO_SPEECH, {
                text: "Hello, this is a test for text-to-speech."
              });
              if (!response) {
                throw new Error("Failed to generate speech");
              }
              logger10.log("Generated speech successfully");
            } catch (error) {
              const message = error instanceof Error ? error.message : String(error);
              logger10.error(`Error in openai_test_text_to_speech: ${message}`);
              throw error;
            }
          }
        },
        {
          name: "openai_test_text_generation_large",
          fn: async (runtime) => {
            try {
              const result = await runtime.useModel(ModelType7.TEXT_LARGE, {
                prompt: "Say hello in 5 words."
              });
              if (!result || result.length === 0) {
                throw new Error("Text generation returned empty result");
              }
              logger10.log({ result }, "Text generation test completed");
            } catch (error) {
              const message = error instanceof Error ? error.message : String(error);
              logger10.error(`Error in openai_test_text_generation_large: ${message}`);
              throw error;
            }
          }
        },
        {
          name: "openai_test_streaming",
          fn: async (runtime) => {
            try {
              const chunks = [];
              const result = await runtime.useModel(ModelType7.TEXT_LARGE, {
                prompt: "Count from 1 to 5.",
                onStreamChunk: (chunk) => {
                  chunks.push(chunk);
                }
              });
              if (!result || result.length === 0) {
                throw new Error("Streaming returned empty result");
              }
              if (chunks.length === 0) {
                throw new Error("No streaming chunks received");
              }
              logger10.log({ chunks: chunks.length, result: result.substring(0, 50) }, "Streaming test completed");
            } catch (error) {
              const message = error instanceof Error ? error.message : String(error);
              logger10.error(`Error in openai_test_streaming: ${message}`);
              throw error;
            }
          }
        }
      ]
    }
  ]
};
var src_default = openaiPlugin;
export {
  openaiPlugin,
  src_default as default
};

//# debugId=382E411BFB8DEF2564756E2164756E21
