import type { MessageBusEventMap } from '../types/server';
type MessageBusHandler<T> = (data: T) => void | Promise<void>;
/**
 * A simple in-memory message bus for distributing messages from the server
 * to subscribed MessageBusService instances within the same process.
 *
 * For multi-process or multi-server deployments, this would need to be replaced
 * with a more robust solution like Redis Pub/Sub, Kafka, RabbitMQ, etc.
 *
 * Uses Bun-native EventTarget internally but maintains EventEmitter-like API.
 *
 * NOTE: This implementation uses a class extending EventTarget rather than functional
 * patterns because EventTarget is a native browser/Bun API that requires class inheritance.
 * This is an intentional architectural decision to leverage Bun's native capabilities
 * instead of Node.js EventEmitter for better compatibility.
 *
 * NOTE: Unlike standard EventEmitter, this implementation prevents duplicate handler
 * registration. This is an intentional design choice to prevent memory leaks and
 * unintended multiple executions of the same handler.
 */
declare class InternalMessageBus extends EventTarget {
    private _maxListeners;
    private handlers;
    emit<K extends keyof MessageBusEventMap>(event: K, data: MessageBusEventMap[K]): boolean;
    on<K extends keyof MessageBusEventMap>(event: K, handler: MessageBusHandler<MessageBusEventMap[K]>): this;
    off<K extends keyof MessageBusEventMap>(event: K, handler: MessageBusHandler<MessageBusEventMap[K]>): void;
    getMaxListeners(): number;
    setMaxListeners(n: number): void;
    removeAllListeners(event?: string): void;
}
declare const internalMessageBus: InternalMessageBus;
export default internalMessageBus;
