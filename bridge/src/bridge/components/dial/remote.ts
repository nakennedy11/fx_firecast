import type { Remote } from "../generic/types";

import type {
    SenderMediaMessage,
    SenderMessage
} from "../cast/types";


export default class DialRemote implements Remote {

        disconnect(): void {
            //todo
        }

        sendMediaMessage(message: SenderMediaMessage): void {
            let message1 = message;
            //todo
        }

        sendReceiverMessage(message: DistributiveOmit<SenderMessage, "requestId">): void {
            let message1 = message;
            //todo
        }
}