export interface Remote {
    disconnect(): void;
    sendReceiverMessage(): void;
    sendMediaMessage(): void;
}