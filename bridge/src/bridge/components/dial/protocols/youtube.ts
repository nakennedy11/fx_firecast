import { SenderMediaMessage } from "../../cast/types";
import AppProtocol from "./types";

export default class YoutubeProtocol implements AppProtocol {
    handleMediaMessage(message: SenderMediaMessage): void {
        console.log("handling media message")

                //TODO -- handle these with youtube lounge api behavior 
                // probably just a method for each, have to look more into api spec
                switch (message.type) {
                    case "PLAY":
                        break;
                    case "PAUSE":
                        break;
                    case "MEDIA_GET_STATUS":
                        break;
                    case "GET_STATUS":
                        break;
                    case "STOP":
                        break;
                    case "MEDIA_SET_VOLUME":
                        break;
                    case "SET_VOLUME":
                        break;
                    case "SET_PLAYBACK_RATE":
                        break;
                    case "LOAD":
                        break;
                    case "SEEK":
                        break;
                    case "EDIT_TRACKS_INFO":
                        break;
                    case "QUEUE_LOAD":
                        break;
                    case "QUEUE_INSERT":
                        break;
                    case "QUEUE_UPDATE":
                        // this is 2 types of messages
                        break;
                    case "QUEUE_REMOVE":
                        break;
                    case "QUEUE_REORDER":
                        break;
                    case "QUEUE_UPDATE":
                        break;
                }
    }
}