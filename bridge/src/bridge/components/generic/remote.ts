import type {
    SenderMediaMessage,
    SenderMessage
} from "../cast/types";

/**
 * Generic Remote interface to be implemented by specific components to handle remote
 * operations with protocol-specific behaviors
 */
export default interface Remote {
    disconnect(): void;
    sendMediaMessage(message: SenderMediaMessage): void;
    sendReceiverMessage(message: DistributiveOmit<SenderMessage, "requestId">): void;
}