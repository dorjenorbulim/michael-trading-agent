// src/lib/base-client.ts
class ApiError extends Error {
  code;
  details;
  status;
  constructor(code, message, details, status) {
    super(message);
    this.code = code;
    this.details = details;
    this.status = status;
    this.name = "ApiError";
  }
}

class BaseApiClient {
  baseUrl;
  apiKey;
  timeout;
  defaultHeaders;
  constructor(config) {
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.apiKey = config.apiKey;
    this.timeout = config.timeout || 30000;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...config.headers
    };
    if (this.apiKey) {
      this.defaultHeaders["X-API-KEY"] = this.apiKey;
    }
  }
  createNoContentResponse() {
    return { success: true };
  }
  async request(method, path, options) {
    let url;
    if (this.baseUrl) {
      url = new URL(`${this.baseUrl}${path}`);
    } else if (typeof window !== "undefined" && window.location) {
      url = new URL(path, window.location.origin);
    } else {
      url = new URL(path, "http://localhost:3000");
    }
    if (options?.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    const controller = new AbortController;
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    try {
      const headers = {
        ...this.defaultHeaders,
        ...options?.config?.headers,
        ...options?.headers
      };
      if (options?.body instanceof FormData) {
        delete headers["Content-Type"];
      }
      const response = await fetch(url.toString(), {
        method,
        headers,
        body: options?.body instanceof FormData ? options.body : options?.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (response.status === 204 || response.headers.get("content-length") === "0") {
        return this.createNoContentResponse();
      }
      let jsonData;
      try {
        jsonData = await response.json();
      } catch (_error) {
        if (response.ok) {
          return this.createNoContentResponse();
        } else {
          throw new ApiError("PARSE_ERROR", "Failed to parse response as JSON", undefined, response.status);
        }
      }
      if (!response.ok) {
        const errorData = jsonData;
        const error = errorData?.error || {
          code: "HTTP_ERROR",
          message: `HTTP ${response.status}: ${response.statusText}`
        };
        const details = typeof error.details === "string" ? error.details : undefined;
        throw new ApiError(error.code || "HTTP_ERROR", error.message || "Unknown error", details, response.status);
      }
      if (jsonData && typeof jsonData === "object" && "success" in jsonData) {
        const apiResponse = jsonData;
        if (!apiResponse.success) {
          const error = "error" in apiResponse ? apiResponse.error : {
            code: "UNKNOWN_ERROR",
            message: "An unknown error occurred"
          };
          throw new ApiError(error.code, error.message, error.details, response.status);
        }
        return apiResponse.data;
      } else {
        return jsonData;
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof ApiError) {
        throw error;
      }
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new ApiError("TIMEOUT", "Request timed out");
        }
        throw new ApiError("NETWORK_ERROR", error.message);
      }
      throw new ApiError("UNKNOWN_ERROR", "An unknown error occurred");
    }
  }
  async get(path, options) {
    return this.request("GET", path, options);
  }
  async post(path, body, options) {
    return this.request("POST", path, { ...options, body });
  }
  async put(path, body, options) {
    return this.request("PUT", path, { ...options, body });
  }
  async patch(path, body, options) {
    return this.request("PATCH", path, { ...options, body });
  }
  async delete(path, options) {
    return this.request("DELETE", path, options);
  }
}

// src/services/agents.ts
class AgentsService extends BaseApiClient {
  async listAgents() {
    return this.get("/api/agents");
  }
  async getAgent(agentId) {
    return this.get(`/api/agents/${agentId}`);
  }
  async createAgent(params) {
    return this.post("/api/agents", params);
  }
  async updateAgent(agentId, params) {
    return this.patch(`/api/agents/${agentId}`, params);
  }
  async deleteAgent(agentId) {
    return this.delete(`/api/agents/${agentId}`);
  }
  async startAgent(agentId) {
    return this.post(`/api/agents/${agentId}/start`);
  }
  async stopAgent(agentId) {
    return this.post(`/api/agents/${agentId}/stop`);
  }
  async getWorlds() {
    return this.get("/api/agents/worlds");
  }
  async addAgentToWorld(agentId, worldId) {
    return this.post(`/api/agents/${agentId}/worlds`, { worldId });
  }
  async updateAgentWorldSettings(agentId, worldId, settings) {
    return this.patch(`/api/agents/${agentId}/worlds/${worldId}`, { settings });
  }
  async getAgentPanels(agentId) {
    const response = await this.get(`/api/agents/${agentId}/panels`);
    const panels = (Array.isArray(response) ? response : []).map((panel, index) => ({
      id: `${panel.name}-${index}`,
      name: panel.name,
      url: panel.path,
      type: "plugin"
    }));
    return { panels };
  }
  async getAgentLogs(agentId, params) {
    return this.get(`/api/agents/${agentId}/logs`, { params });
  }
  async deleteAgentLog(agentId, logId) {
    return this.delete(`/api/agents/${agentId}/logs/${logId}`);
  }
  async getAgentsForMessageServer(messageServerId) {
    return this.get(`/api/messaging/message-servers/${messageServerId}/agents`);
  }
  async addAgentToMessageServer(messageServerId, agentId) {
    return this.post(`/api/messaging/message-servers/${messageServerId}/agents`, { agentId });
  }
  async removeAgentFromMessageServer(messageServerId, agentId) {
    return this.delete(`/api/messaging/message-servers/${messageServerId}/agents/${agentId}`);
  }
  async getMessageServersForAgent(agentId) {
    return this.get(`/api/messaging/agents/${agentId}/message-servers`);
  }
}

// src/services/messaging.ts
class MessagingService extends BaseApiClient {
  async submitMessage(params) {
    return this.post("/api/messaging/submit", params);
  }
  async completeMessage(params) {
    return this.post("/api/messaging/complete", params);
  }
  async ingestExternalMessages(params) {
    return this.post("/api/messaging/ingest-external", params);
  }
  async createChannel(params) {
    const payload = {
      name: params.name,
      type: params.type,
      message_server_id: params.messageServerId || "00000000-0000-0000-0000-000000000000",
      metadata: params.metadata
    };
    return this.post("/api/messaging/channels", payload);
  }
  async createGroupChannel(params) {
    const DEFAULT_MESSAGE_SERVER_ID = "00000000-0000-0000-0000-000000000000";
    let cleanedMetadata;
    let messageServerIdFromMeta;
    let typeFromMeta;
    if (params.metadata) {
      const metadataCopy = { ...params.metadata };
      if ("message_server_id" in metadataCopy) {
        messageServerIdFromMeta = metadataCopy["message_server_id"];
        delete metadataCopy["message_server_id"];
      }
      if ("type" in metadataCopy) {
        typeFromMeta = metadataCopy["type"];
        delete metadataCopy["type"];
      }
      if (Object.keys(metadataCopy).length > 0) {
        cleanedMetadata = metadataCopy;
      }
    }
    const payload = {
      name: params.name,
      message_server_id: messageServerIdFromMeta || DEFAULT_MESSAGE_SERVER_ID,
      participantCentralUserIds: params.participantIds,
      ...typeFromMeta ? { type: typeFromMeta } : {},
      ...cleanedMetadata ? { metadata: cleanedMetadata } : {}
    };
    return this.post("/api/messaging/channels", payload);
  }
  async getOrCreateDmChannel(params) {
    const [userA, userB] = params.participantIds;
    const query = {
      currentUserId: userA,
      targetUserId: userB,
      dmServerId: "00000000-0000-0000-0000-000000000000"
    };
    return this.get("/api/messaging/dm-channel", { params: query });
  }
  async getChannelDetails(channelId) {
    return this.get(`/api/messaging/channels/${channelId}/details`);
  }
  async getChannelParticipants(channelId) {
    return this.get(`/api/messaging/channels/${channelId}/participants`);
  }
  async addAgentToChannel(channelId, agentId) {
    return this.post(`/api/messaging/channels/${channelId}/agents`, {
      agentId
    });
  }
  async removeAgentFromChannel(channelId, agentId) {
    return this.delete(`/api/messaging/channels/${channelId}/agents/${agentId}`);
  }
  async deleteChannel(channelId) {
    return this.delete(`/api/messaging/channels/${channelId}`);
  }
  async clearChannelHistory(channelId) {
    return this.delete(`/api/messaging/channels/${channelId}/messages`);
  }
  async postMessage(channelId, content, metadata) {
    return this.post(`/api/messaging/channels/${channelId}/messages`, {
      content,
      metadata
    });
  }
  async getChannelMessages(channelId, params) {
    return this.get(`/api/messaging/channels/${channelId}/messages`, {
      params
    });
  }
  async getMessage(messageId) {
    return this.get(`/api/messaging/messages/${messageId}`);
  }
  async deleteMessage(channelId, messageId) {
    return this.delete(`/api/messaging/channels/${channelId}/messages/${messageId}`);
  }
  async updateMessage(messageId, content) {
    return this.patch(`/api/messaging/messages/${messageId}`, { content });
  }
  async searchMessages(params) {
    return this.post("/api/messaging/messages/search", params);
  }
  async getCurrentMessageServer() {
    return this.get("/api/messaging/message-server/current");
  }
  async listMessageServers() {
    return this.get("/api/messaging/message-servers");
  }
  async getMessageServerChannels(messageServerId) {
    return this.get(`/api/messaging/message-servers/${messageServerId}/channels`);
  }
  async createMessageServer(params) {
    return this.post("/api/messaging/message-servers", params);
  }
  async syncMessageServerChannels(messageServerId, params) {
    return this.post(`/api/messaging/message-servers/${messageServerId}/sync-channels`, params);
  }
  async deleteMessageServer(messageServerId) {
    return this.delete(`/api/messaging/message-servers/${messageServerId}`);
  }
  async updateChannel(channelId, params) {
    return this.patch(`/api/messaging/channels/${channelId}`, params);
  }
  async generateChannelTitle(channelId, agentId) {
    return this.post(`/api/messaging/channels/${channelId}/generate-title`, {
      agentId
    });
  }
  async addUserToChannel(channelId, userId) {
    const channel = await this.getChannelDetails(channelId);
    const currentParticipants = channel.metadata?.participantCentralUserIds || [];
    if (!currentParticipants.includes(userId)) {
      const updatedParticipants = [...currentParticipants, userId];
      return this.updateChannel(channelId, {
        participantCentralUserIds: updatedParticipants
      });
    }
    return { success: true, data: channel };
  }
  async addUsersToChannel(channelId, userIds) {
    const channel = await this.getChannelDetails(channelId);
    const currentParticipants = channel.metadata?.participantCentralUserIds || [];
    const newParticipants = [...currentParticipants];
    for (const userId of userIds) {
      if (!newParticipants.includes(userId)) {
        newParticipants.push(userId);
      }
    }
    return this.updateChannel(channelId, {
      participantCentralUserIds: newParticipants
    });
  }
  async removeUserFromChannel(channelId, userId) {
    const channel = await this.getChannelDetails(channelId);
    const currentParticipants = channel.metadata?.participantCentralUserIds || [];
    const updatedParticipants = currentParticipants.filter((id) => id !== userId);
    return this.updateChannel(channelId, {
      participantCentralUserIds: updatedParticipants
    });
  }
}

// src/services/memory.ts
class MemoryService extends BaseApiClient {
  async getAgentMemories(agentId, params) {
    return this.get(`/api/memory/${agentId}/memories`, { params });
  }
  async getRoomMemories(agentId, roomId, params) {
    return this.get(`/api/memory/${agentId}/rooms/${roomId}/memories`, {
      params
    });
  }
  async updateMemory(agentId, memoryId, params) {
    return this.patch(`/api/memory/${agentId}/memories/${memoryId}`, params);
  }
  async clearAgentMemories(agentId) {
    return this.delete(`/api/memory/${agentId}/memories`);
  }
  async clearRoomMemories(agentId, roomId) {
    return this.delete(`/api/memory/${agentId}/memories/all/${roomId}`);
  }
  async listAgentRooms(agentId) {
    return this.get(`/api/memory/${agentId}/rooms`);
  }
  async getRoom(agentId, roomId) {
    return this.get(`/api/memory/${agentId}/rooms/${roomId}`);
  }
  async createRoom(agentId, params) {
    return this.post(`/api/memory/${agentId}/rooms`, params);
  }
  async createWorldFromMessageServer(messageServerId, params) {
    return this.post(`/api/memory/groups/${messageServerId}`, params);
  }
  async deleteWorld(messageServerId) {
    return this.delete(`/api/memory/groups/${messageServerId}`);
  }
  async clearWorldMemories(messageServerId) {
    return this.delete(`/api/memory/groups/${messageServerId}/memories`);
  }
  async deleteMemory(agentId, memoryId) {
    return this.delete(`/api/memory/${agentId}/memories/${memoryId}`);
  }
  async getAgentInternalMemories(agentId, agentPerspectiveRoomId, includeEmbedding) {
    return this.get(`/api/memory/${agentId}/rooms/${agentPerspectiveRoomId}/memories`, { params: { includeEmbedding } });
  }
  async deleteAgentInternalMemory(agentId, memoryId) {
    return this.delete(`/api/memory/${agentId}/memories/${memoryId}`);
  }
  async deleteAllAgentInternalMemories(agentId, agentPerspectiveRoomId) {
    return this.delete(`/api/memory/${agentId}/memories/all/${agentPerspectiveRoomId}`);
  }
  async updateAgentInternalMemory(agentId, memoryId, memoryData) {
    return this.patch(`/api/memory/${agentId}/memories/${memoryId}`, memoryData);
  }
  async deleteGroupMemory(messageServerId, memoryId) {
    return this.delete(`/api/messaging/channels/${messageServerId}/messages/${memoryId}`);
  }
  async clearGroupChat(messageServerId) {
    return this.delete(`/api/messaging/channels/${messageServerId}/messages`);
  }
}

// src/services/audio.ts
class AudioService extends BaseApiClient {
  async requestBinary(method, path, options) {
    let url;
    if (this.baseUrl) {
      url = new URL(`${this.baseUrl}${path}`);
    } else if (typeof window !== "undefined" && window.location) {
      url = new URL(path, window.location.origin);
    } else {
      url = new URL(path, "http://localhost:3000");
    }
    if (options?.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    const controller = new AbortController;
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    try {
      const headers = {
        ...this.defaultHeaders,
        ...options?.headers
      };
      if (options?.body instanceof FormData) {
        delete headers["Content-Type"];
      }
      const response = await fetch(url.toString(), {
        method,
        headers,
        body: options?.body instanceof FormData ? options.body : options?.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.arrayBuffer();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error("Request timed out");
        }
        throw error;
      }
      throw new Error("An unknown error occurred");
    }
  }
  processAudioInput(audio) {
    if (audio instanceof Blob) {
      return audio;
    }
    if (typeof audio === "string") {
      if (audio.startsWith("data:")) {
        try {
          const [header, base64Data] = audio.split(",");
          const mimeMatch = header.match(/data:([^;]+)/);
          const mimeType = mimeMatch ? mimeMatch[1] : "audio/wav";
          const binaryString = atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0;i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          return new Blob([bytes], { type: mimeType });
        } catch (error) {
          throw new Error(`Invalid base64 data URL: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
      }
      if (this.isBase64String(audio)) {
        try {
          const binaryString = atob(audio);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0;i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          return new Blob([bytes], { type: "audio/wav" });
        } catch (_error) {
          return audio;
        }
      }
      return audio;
    }
    if (this.isBuffer(audio)) {
      return new Blob([new Uint8Array(audio)], { type: "audio/wav" });
    }
    if (audio instanceof ArrayBuffer) {
      return new Blob([audio], { type: "audio/wav" });
    }
    if (audio && typeof audio === "object" && "buffer" in audio && audio.buffer instanceof ArrayBuffer && "BYTES_PER_ELEMENT" in audio.constructor) {
      return new Blob([audio.buffer], { type: "audio/wav" });
    }
    throw new Error(`Unsupported audio input type: ${typeof audio}. Expected Blob, Buffer, ArrayBuffer, or string.`);
  }
  isBase64String(str) {
    const base64Pattern = /^[A-Za-z0-9+/]*={0,2}$/;
    if (str.length < 4 || str.length % 4 !== 0) {
      return false;
    }
    return base64Pattern.test(str);
  }
  isBuffer(obj) {
    if (obj === null || obj === undefined || typeof obj !== "object") {
      return false;
    }
    const o = obj;
    return typeof o.constructor === "function" && o.constructor.name === "Buffer" && typeof o.readUInt8 === "function";
  }
  async speechConversation(agentId, params) {
    const formData = new FormData;
    const processedAudio = this.processAudioInput(params.audio);
    if (processedAudio instanceof Blob) {
      formData.append("file", processedAudio);
    } else {
      formData.append("file", processedAudio);
    }
    if (params.format) {
      formData.append("format", params.format);
    }
    if (params.language) {
      formData.append("language", params.language);
    }
    if (params.metadata) {
      formData.append("metadata", JSON.stringify(params.metadata));
    }
    return this.request("POST", `/api/audio/${agentId}/speech/conversation`, {
      body: formData
    });
  }
  async generateSpeech(agentId, params) {
    const audioBuffer = await this.requestBinary("POST", `/api/audio/${agentId}/speech/generate`, {
      body: params
    });
    const bytes = new Uint8Array(audioBuffer);
    let binary = "";
    for (let i = 0;i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64Audio = btoa(binary);
    const format = "mpeg";
    return {
      audio: base64Audio,
      format
    };
  }
  async synthesizeAudioMessage(agentId, params) {
    return this.post(`/api/audio/${agentId}/audio-messages/synthesize`, params);
  }
  async transcribe(agentId, params) {
    const formData = new FormData;
    const processedAudio = this.processAudioInput(params.audio);
    if (processedAudio instanceof Blob) {
      formData.append("file", processedAudio);
    } else {
      formData.append("file", processedAudio);
    }
    if (params.format) {
      formData.append("format", params.format);
    }
    if (params.language) {
      formData.append("language", params.language);
    }
    return this.request("POST", `/api/audio/${agentId}/transcriptions`, {
      body: formData
    });
  }
  async processSpeech(agentId, audio, metadata) {
    const formData = new FormData;
    const processedAudio = this.processAudioInput(audio);
    if (processedAudio instanceof Blob) {
      formData.append("file", processedAudio);
    } else {
      formData.append("file", processedAudio);
    }
    if (metadata) {
      formData.append("metadata", JSON.stringify(metadata));
    }
    return this.request("POST", `/api/audio/${agentId}/speech`, {
      body: formData
    });
  }
}

// src/services/media.ts
class MediaService extends BaseApiClient {
  async uploadAgentMedia(agentId, params) {
    const formData = new FormData;
    formData.append("file", params.file, params.filename);
    if (params.contentType) {
      formData.append("contentType", params.contentType);
    }
    if (params.metadata) {
      formData.append("metadata", JSON.stringify(params.metadata));
    }
    return this.request("POST", `/api/media/agents/${agentId}/upload-media`, {
      body: formData
    });
  }
  async uploadChannelMedia(channelId, file) {
    const formData = new FormData;
    formData.append("file", file);
    return this.request("POST", `/api/messaging/channels/${channelId}/upload-media`, {
      body: formData
    });
  }
}

// src/services/server.ts
class ServerService extends BaseApiClient {
  async checkHealth() {
    return this.get("/api/server/health");
  }
  async ping() {
    return this.get("/api/server/ping");
  }
  async hello() {
    return this.get("/api/server/hello");
  }
  async getStatus() {
    return this.get("/api/server/status");
  }
  async stopServer() {
    return this.post("/api/server/stop");
  }
  async getDebugInfo() {
    return this.get("/api/server/debug/servers");
  }
  async submitLogs(logs) {
    return this.post("/api/server/logs", { logs });
  }
  async clearLogs() {
    return this.delete("/api/server/logs");
  }
}

// src/services/system.ts
class SystemService extends BaseApiClient {
  async getEnvironment() {
    return this.get("/api/system/env/local");
  }
  async updateLocalEnvironment(params) {
    if (!params || typeof params !== "object") {
      throw new Error("updateLocalEnvironment requires a configuration object");
    }
    let body;
    if ("variables" in params) {
      const localParams = params;
      body = { content: localParams.variables };
    } else if ("content" in params) {
      const contentParams = params;
      body = { content: contentParams.content };
    } else {
      const recordParams = params;
      body = { content: recordParams };
    }
    return this.post("/api/system/env/local", body);
  }
  async getGlobalLogs(params) {
    const response = await fetch(this.buildUrl("/api/server/logs", { params }), {
      method: "GET",
      headers: this.getHeaders()
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    return {
      logs: data.logs || [],
      count: data.count || 0,
      total: data.total || 0,
      level: data.requestedLevel || data.level || "all",
      levels: data.levels || []
    };
  }
  buildUrl(path, options) {
    const url = new URL(`${this.baseUrl}${path}`);
    if (options?.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return url.toString();
  }
  getHeaders() {
    return {
      ...this.defaultHeaders
    };
  }
  async deleteGlobalLogs() {
    return this.delete("/api/server/logs");
  }
  async deleteLog(_logId) {
    throw new Error("Individual log deletion is not supported. Use deleteGlobalLogs() to clear all logs.");
  }
}

// src/services/sessions.ts
function toTimestampString(value, paramName) {
  if (!value) {
    return;
  }
  let timestamp;
  if (value instanceof Date) {
    timestamp = value.getTime();
  } else if (typeof value === "string") {
    const date = new Date(value);
    timestamp = date.getTime();
    if (isNaN(timestamp)) {
      console.warn(`Invalid date string for ${paramName}: ${value}`);
      return;
    }
  } else if (typeof value === "number") {
    timestamp = value;
  } else {
    console.warn(`Invalid type for ${paramName}: ${typeof value}`);
    return;
  }
  return timestamp.toString();
}
function validateRequiredParam(value, paramName) {
  if (!value || value.trim() === "") {
    throw new Error(`${paramName} is required and cannot be empty`);
  }
}

class SessionsService extends BaseApiClient {
  async checkHealth() {
    return this.get("/api/messaging/sessions/health");
  }
  async createSession(params) {
    return this.post("/api/messaging/sessions", params);
  }
  async getSession(sessionId) {
    validateRequiredParam(sessionId, "sessionId");
    return this.get(`/api/messaging/sessions/${sessionId}`);
  }
  async sendMessage(sessionId, params) {
    validateRequiredParam(sessionId, "sessionId");
    validateRequiredParam(params?.content, "content");
    return this.post(`/api/messaging/sessions/${sessionId}/messages`, params);
  }
  async sendMessageSync(sessionId, params) {
    return this.sendMessage(sessionId, { ...params, transport: "http" });
  }
  async getMessages(sessionId, params) {
    validateRequiredParam(sessionId, "sessionId");
    const queryParams = {};
    if (params?.limit) {
      queryParams.limit = params.limit.toString();
    }
    const beforeTimestamp = toTimestampString(params?.before, "before");
    if (beforeTimestamp) {
      queryParams.before = beforeTimestamp;
    }
    const afterTimestamp = toTimestampString(params?.after, "after");
    if (afterTimestamp) {
      queryParams.after = afterTimestamp;
    }
    return this.get(`/api/messaging/sessions/${sessionId}/messages`, {
      params: queryParams
    });
  }
  async deleteSession(sessionId) {
    validateRequiredParam(sessionId, "sessionId");
    return this.delete(`/api/messaging/sessions/${sessionId}`);
  }
  async listSessions() {
    return this.get("/api/messaging/sessions");
  }
}

// src/services/runs.ts
class RunsService extends BaseApiClient {
  async listRuns(agentId, params) {
    return this.get(`/api/agents/${agentId}/runs`, { params });
  }
  async getRun(agentId, runId, roomId) {
    return this.get(`/api/agents/${agentId}/runs/${runId}`, {
      params: roomId ? { roomId } : undefined
    });
  }
}

// src/types/jobs.ts
var JobStatus;
((JobStatus2) => {
  JobStatus2["PENDING"] = "pending";
  JobStatus2["PROCESSING"] = "processing";
  JobStatus2["COMPLETED"] = "completed";
  JobStatus2["FAILED"] = "failed";
  JobStatus2["TIMEOUT"] = "timeout";
})(JobStatus ||= {});
var JobValidation = {
  MAX_CONTENT_LENGTH: 50000,
  MAX_METADATA_SIZE: 1e4,
  DEFAULT_TIMEOUT_MS: 30000,
  MAX_TIMEOUT_MS: 300000,
  MIN_TIMEOUT_MS: 1000
};

// src/services/jobs.ts
class JobsService extends BaseApiClient {
  async create(params) {
    return this.post("/api/messaging/jobs", params);
  }
  async getJob(jobId) {
    return this.get(`/api/messaging/jobs/${jobId}`);
  }
  async list(params) {
    return this.get("/api/messaging/jobs", { params });
  }
  async health() {
    return this.get("/api/messaging/jobs/health");
  }
  async poll(jobId, options = {}) {
    const { interval = 1000, maxAttempts = 30, timeout, onProgress } = options;
    const startTime = Date.now();
    let attempts = 0;
    const effectiveMaxAttempts = timeout ? Math.ceil(timeout / interval) : maxAttempts;
    while (attempts < effectiveMaxAttempts) {
      if (timeout && Date.now() - startTime > timeout) {
        const job3 = await this.getJob(jobId);
        return {
          success: false,
          job: job3,
          attempts,
          timeMs: Date.now() - startTime
        };
      }
      if (attempts > 0) {
        await new Promise((resolve) => setTimeout(resolve, interval));
      }
      attempts++;
      const job2 = await this.getJob(jobId);
      if (onProgress) {
        onProgress(job2, attempts);
      }
      if (job2.status === "completed" /* COMPLETED */) {
        return {
          success: true,
          job: job2,
          attempts,
          timeMs: Date.now() - startTime
        };
      }
      if (job2.status === "failed" /* FAILED */ || job2.status === "timeout" /* TIMEOUT */) {
        return {
          success: false,
          job: job2,
          attempts,
          timeMs: Date.now() - startTime
        };
      }
    }
    const job = await this.getJob(jobId);
    return {
      success: false,
      job,
      attempts,
      timeMs: Date.now() - startTime
    };
  }
  async createAndPoll(params, pollOptions) {
    const createResponse = await this.create(params);
    return this.poll(createResponse.jobId, pollOptions);
  }
  async createAndPollWithBackoff(params, options = {}) {
    const {
      initialInterval = 500,
      maxInterval = 5000,
      multiplier = 1.5,
      maxAttempts = 40,
      timeout,
      onProgress
    } = options;
    const createResponse = await this.create(params);
    const jobId = createResponse.jobId;
    const startTime = Date.now();
    let attempts = 0;
    let currentInterval = initialInterval;
    while (attempts < maxAttempts) {
      if (timeout && Date.now() - startTime > timeout) {
        const job3 = await this.getJob(jobId);
        return {
          success: false,
          job: job3,
          attempts,
          timeMs: Date.now() - startTime
        };
      }
      if (attempts > 0) {
        await new Promise((resolve) => setTimeout(resolve, currentInterval));
        currentInterval = Math.min(currentInterval * multiplier, maxInterval);
      }
      attempts++;
      const job2 = await this.getJob(jobId);
      if (onProgress) {
        onProgress(job2, attempts);
      }
      if (job2.status === "completed" /* COMPLETED */) {
        return {
          success: true,
          job: job2,
          attempts,
          timeMs: Date.now() - startTime
        };
      }
      if (job2.status === "failed" /* FAILED */ || job2.status === "timeout" /* TIMEOUT */) {
        return {
          success: false,
          job: job2,
          attempts,
          timeMs: Date.now() - startTime
        };
      }
    }
    const job = await this.getJob(jobId);
    return {
      success: false,
      job,
      attempts,
      timeMs: Date.now() - startTime
    };
  }
  async ask(userId, content, agentId, pollOptions) {
    const result = await this.createAndPoll({
      userId,
      content,
      ...agentId && { agentId }
    }, pollOptions);
    if (!result.success || !result.job.result) {
      throw new Error(result.job.error || "Job failed or timed out without a response");
    }
    return result.job.result.message.content;
  }
}

// src/client.ts
class ElizaClient {
  agents;
  messaging;
  memory;
  audio;
  media;
  server;
  system;
  sessions;
  runs;
  jobs;
  constructor(config) {
    this.agents = new AgentsService(config);
    this.messaging = new MessagingService(config);
    this.memory = new MemoryService(config);
    this.audio = new AudioService(config);
    this.media = new MediaService(config);
    this.server = new ServerService(config);
    this.system = new SystemService(config);
    this.sessions = new SessionsService(config);
    this.runs = new RunsService(config);
    this.jobs = new JobsService(config);
  }
  static create(config) {
    return new ElizaClient(config);
  }
}
export {
  SystemService,
  SessionsService,
  ServerService,
  RunsService,
  MessagingService,
  MemoryService,
  MediaService,
  JobsService,
  JobValidation,
  JobStatus,
  ElizaClient,
  BaseApiClient,
  AudioService,
  ApiError,
  AgentsService
};

//# debugId=0B276318C61F002264756E2164756E21
//# sourceMappingURL=index.js.map
