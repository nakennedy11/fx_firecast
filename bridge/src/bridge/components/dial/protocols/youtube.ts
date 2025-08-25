import { ReceiverDevice } from "../../../messagingTypes";
import { SenderMediaMessage } from "../../cast/types";
import AppProtocol from "./types";
import { parseStringPromise } from "xml2js";


const loungeApiBase = "https://www.youtube.com/api/lounge";
const loungeApiGetToken = loungeApiBase + "/pairing/get_lounge_token_batch";
const loungeApiBind = loungeApiBase + "/bc/bind";

const loungeOrigin = "https://www.youtube.com";
const loungeContentType = "application/x-www-form-urlencoded";
const loungeUserAgent = "ozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36";

export default class YoutubeProtocol implements AppProtocol {

    private device: ReceiverDevice;
    private screenId: string | null = null;
    private loungeToken: string | null = null;



    constructor(device: ReceiverDevice) {
        this.device = device;
        this.getScreenId();
        this.getLoungeToken();
    }

    private async getScreenId() {
        const response = await fetch(this.device.host + '/YouTube', {
            headers: {
                'Origin': 'https://www.youtube.com'
            }
        });

        const xml = await response.text();
        const parsed = await parseStringPromise(xml);

        const screenId =
            parsed?.service?.additionalData?.[0]?.screenId?.[0] ?? null;

        this.screenId = screenId;
    }

    private async getLoungeToken() {
        const response = await fetch(loungeApiGetToken, {
            method: "POST",
            headers: { "Origin": loungeOrigin, "Content-Type": loungeContentType, "User-Agent": loungeUserAgent },
            body: "screen_ids=" + this.screenId
        });

        const json = await response.text();
        const parsed = await parseStringPromise(json);

        const token = parsed?.screens?.[0]?.loungeToken ?? null;

        this.loungeToken = token;

    }

    handleMediaMessage(message: SenderMediaMessage, device: ReceiverDevice): void {
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


    private play() {
        
    }


    // todo -- refersh token when it expires
    // todo -- find out what all these messages actually do
    // 
}