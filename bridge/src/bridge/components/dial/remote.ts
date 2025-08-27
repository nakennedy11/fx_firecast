import type { Remote } from "../generic/types";

import type {
    SenderMediaMessage,
    SenderMessage
} from "../cast/types";

import type { ReceiverDevice } from "../../messagingTypes";

import fetch from "node-fetch";
import AppProtocol from "./protocols/types";
import YoutubeProtocol from "./protocols/youtube";


export default class DialRemote implements Remote {
    private device: ReceiverDevice;
    private appId: string | null = null; // for selecting which protocol to use, set when launching an app

    private appProtocol: AppProtocol | null = null;

    constructor(device: ReceiverDevice) {
        this.device = device;
    }

    selectProtocol(appId: string): void {
        switch (appId) {
            case "YouTube":
                this.appProtocol = new YoutubeProtocol(this.device);
        }
    }

    disconnect(): void {
        // TODO -- not sure if this actually needs to do anything
        // actually this can be used to stop the application -- send a delete request to the app URL 
        const response = fetch(this.device.host, {method: "DELETE"});

    }

    sendMediaMessage(message: SenderMediaMessage): void {
        // TODO
        // sends a message type to the receiver (DIAL server/first screen device)
        // currently it's based on the Castv2 API
        // will need to translate it and abstract it to work with more specific
        // implementations for different apps (YouTube, Plex, etc[?])
        // CONTROLS THE MEDIA PLAYBACK/QUEUE/ETC

        /*
        interface MediaReqBase extends ReqBase {
            mediaSessionId: number;
            customData?: unknown;
        }
        */

        this.appProtocol?.handleMediaMessage(message)

    }

    sendReceiverMessage(message: DistributiveOmit<SenderMessage, "requestId">): void {
        let message1 = message;
        // TODO
        // sends a message type like LAUNCH, STOP, GET_STATUS, GET_APP_AVAILABILITY, SET_VOLUME
        // CONTROLS THE DEVICE ITSELF

        switch (message.type) {
            case "LAUNCH":
                console.log("launching");
                //(ReqBase & { type: "LAUNCH"; appId: string })
                // select protocol for this remote based on the app launched
                this.selectProtocol(message.appId)
                // post the appId to the applicationUrl
                fetch(this.device.host + "/" + message.appId, {method: "POST"});
                break;
            case "STOP":
                console.log("STOP");
                // send a delete request to the appId that's being sent to 
                this.disconnect();
                break;
            case "GET_STATUS":
                console.log("GETTING STATUS");
                // not sure what this is -- possibly just ping the dial device desc and see if a 200 comes back? 
                // TODO -- LEAVE BLANK?
                // could indeed ping the application_url and see if it responds
                break;
            case "GET_APP_AVAILABILITY":
                console.log("APP AVAIL");
                // run a get with appId on the applicationURL, read response back
                // TODO -- LEAVE BLANK?
                break;
            case "SET_VOLUME":
                console.log("SET VOL");
                // This doesn't work with DIAL stuff
                // TODO -- LEAVE BLANK? -- MAYBE CAN BE DONE WITH THE YOUTUBE LOUNGE API
                // probably do a handleMediaMessage with a volume ting
                break;
        }
    }
}





