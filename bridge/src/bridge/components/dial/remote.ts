import type { Remote } from "../generic/types";

import type {
    SenderMediaMessage,
    SenderMessage
} from "../cast/types";


export default class DialRemote implements Remote {

        disconnect(): void {
            // TODO -- not sure if this actually needs to do anything
        }

        sendMediaMessage(message: SenderMediaMessage): void {
            let message1 = message;
            // TODO
            // sends a message type to the receiver (DIAL server/first screen device)
            // currently it's based on the Castv2 API
            // will need to translate it and abstract it to work with more specific
            // implementations for different apps (YouTube, Plex, etc[?])
            // CONTROLS THE MEDIA PLAYBACK/QUEUE/ETC
        }

        sendReceiverMessage(message: DistributiveOmit<SenderMessage, "requestId">): void {
            let message1 = message;
            // TODO
            // sends a message type like LAUNCH, STOP, GET_STATUS, GET_APP_AVAILABILITY, SET_VOLUME
            // CONTROLS THE DEVICE ITSELF
        }
}