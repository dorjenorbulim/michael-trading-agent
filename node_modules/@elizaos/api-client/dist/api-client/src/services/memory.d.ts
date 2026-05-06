import { UUID } from '@elizaos/core';
import { BaseApiClient } from '../lib/base-client';
import { Memory, Room, MemoryParams, MemoryUpdateParams, RoomCreateParams, WorldCreateParams } from '../types/memory';
export declare class MemoryService extends BaseApiClient {
    /**
     * Get agent memories
     */
    getAgentMemories(agentId: UUID, params?: MemoryParams): Promise<{
        memories: Memory[];
    }>;
    /**
     * Get room-specific memories
     */
    getRoomMemories(agentId: UUID, roomId: UUID, params?: MemoryParams): Promise<{
        memories: Memory[];
    }>;
    /**
     * Update a memory
     */
    updateMemory(agentId: UUID, memoryId: UUID, params: MemoryUpdateParams): Promise<Memory>;
    /**
     * Clear all agent memories
     */
    clearAgentMemories(agentId: UUID): Promise<{
        deleted: number;
    }>;
    /**
     * Clear room memories
     */
    clearRoomMemories(agentId: UUID, roomId: UUID): Promise<{
        deleted: number;
    }>;
    /**
     * List agent's rooms
     */
    listAgentRooms(agentId: UUID): Promise<{
        rooms: Room[];
    }>;
    /**
     * Get room details
     */
    getRoom(agentId: UUID, roomId: UUID): Promise<Room>;
    /**
     * Create a room
     */
    createRoom(agentId: UUID, params: RoomCreateParams): Promise<Room>;
    /**
     * Create world from message server
     */
    createWorldFromMessageServer(messageServerId: UUID, params: WorldCreateParams): Promise<{
        worldId: UUID;
    }>;
    /**
     * Delete a world
     */
    deleteWorld(messageServerId: UUID): Promise<{
        success: boolean;
    }>;
    /**
     * Clear world memories
     */
    clearWorldMemories(messageServerId: UUID): Promise<{
        deleted: number;
    }>;
    /**
     * Delete a specific memory
     */
    deleteMemory(agentId: UUID, memoryId: UUID): Promise<{
        success: boolean;
    }>;
    /**
     * Get agent internal memories
     */
    getAgentInternalMemories(agentId: UUID, agentPerspectiveRoomId: UUID, includeEmbedding?: boolean): Promise<{
        success: boolean;
        data: Memory[];
    }>;
    /**
     * Delete agent internal memory
     */
    deleteAgentInternalMemory(agentId: UUID, memoryId: UUID): Promise<{
        success: boolean;
    }>;
    /**
     * Delete all agent internal memories
     */
    deleteAllAgentInternalMemories(agentId: UUID, agentPerspectiveRoomId: UUID): Promise<{
        success: boolean;
    }>;
    /**
     * Update agent internal memory
     */
    updateAgentInternalMemory(agentId: UUID, memoryId: UUID, memoryData: MemoryUpdateParams): Promise<Memory>;
    /**
     * Delete group memory (implemented via messaging channel message deletion)
     */
    deleteGroupMemory(messageServerId: UUID, memoryId: UUID): Promise<{
        success: boolean;
    }>;
    /**
     * Clear group chat (implemented via messaging channel history clearing)
     */
    clearGroupChat(messageServerId: UUID): Promise<{
        success: boolean;
    }>;
}
//# sourceMappingURL=memory.d.ts.map