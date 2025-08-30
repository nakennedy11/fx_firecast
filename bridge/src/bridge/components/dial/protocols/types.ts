import type { SenderMediaMessage } from "../../cast/types";

export default interface AppProtocol {
    handleMediaMessage(message: SenderMediaMessage): void;
}