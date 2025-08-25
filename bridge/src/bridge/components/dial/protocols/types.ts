import { ReceiverDevice } from "../../../messagingTypes";
import { SenderMediaMessage } from "../../cast/types";

export default interface AppProtocol {
    handleMediaMessage(message: SenderMediaMessage, device: ReceiverDevice): void;
}
