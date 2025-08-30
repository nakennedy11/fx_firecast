import type {
    SenderMediaMessage,
    SenderMessage
} from "../cast/types";

import type { ReceiverDevice } from "../../messagingTypes";

/**
 * Generic Remote interface to be implemented by specific components to handle remote
 * operations with protocol-specific behaviors
 */
export interface Remote {
    disconnect(): void;
    sendMediaMessage(message: SenderMediaMessage): void;
    sendReceiverMessage(message: DistributiveOmit<SenderMessage, "requestId">): void;
}

export interface DiscoveryOptions {
    onDeviceFound(device: ReceiverDevice): void;
    onDeviceDown(deviceId: string): void;
}

export interface Discovery {
    start(): void;
    stop(): void;
}