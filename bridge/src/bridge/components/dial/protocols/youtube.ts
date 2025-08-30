import type { ReceiverDevice } from "../../../messagingTypes";
import type { SenderMediaMessage } from "../../cast/types";
import type AppProtocol from "./types";
import { parseStringPromise } from "xml2js";

// Lounge endpoints
const loungeApiBase = "https://www.youtube.com/api/lounge";
const loungeApiGetToken = loungeApiBase + "/pairing/get_lounge_token_batch";
const loungeApiBind = loungeApiBase + "/bc/bind";

// Lounge headers
const loungeOrigin = "https://www.youtube.com";
const loungeContentType = "application/x-www-form-urlencoded";
const loungeUserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36";
const loungeHeaders = { "Origin": loungeOrigin, "Content-Type": loungeContentType, "User-Agent": loungeUserAgent };

// Lounge URL parameters
const paramCver = "1";
const paramRidSess = "1";
const paramRidPlay = "2";
const paramVer = "8";
const paramApp = "youtube-desktop";
const paramDevice = "remote-control";
const paramId = "remote";

export default class YoutubeProtocol implements AppProtocol {

    private device: ReceiverDevice;
    private screenId: string | null = null;
    private loungeToken: string | null = null;
    private sid: string | null = null;
    private gsid: string | null = null;

    constructor(device: ReceiverDevice) {
        this.device = device;
        this.getScreenId();
        this.getLoungeToken();
        this.getSessionIds();
    }

    // get the ScreenID of the device to use for requesting sessions with Lounge API
    // TODO: screen must be on/youtube app open for pulling this? 
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

    // Gets the lounge token needed for API calls using the screen id
    private async getLoungeToken() {
        const response = await fetch(loungeApiGetToken, {
            method: "POST",
            headers: loungeHeaders,
            body: "screen_ids=" + this.screenId
        });

        const json = await response.text();
        const parsed = await parseStringPromise(json);

        const token = parsed?.screens?.[0]?.loungeToken ?? null;

        this.loungeToken = token;

    }

    // gets session ids needed for api calls using the lounge token
    private async getSessionIds() {
        const params = new URLSearchParams();
        params.append("CVER", paramCver);
        params.append("RID", paramRidSess);
        params.append("VER", paramVer);
        params.append("app", paramApp);
        params.append("device", paramDevice);
        params.append("id", paramId);
        params.append("name", this.device.friendlyName);
        params.append("loungeIdToken", this.loungeToken!);

        const response = await fetch(
            `${loungeApiBind}?${params}`, {
            method: "POST",
            headers: loungeHeaders
        }
        );

        const json = await response.text();
        const cleaned = json.replace(/^\d+\s*/, "");
        const data = JSON.parse(cleaned);

        // TODO: probably grab this in a more dynamic way, not necessarily guaranteed
        this.sid = data[0][1][1];
                
        this.gsid = data[1][1][1];
    }


    // dispatch API calls with required body params and formatted for Lounge
    // !!not all Cast v2 operations supported!!
    handleMediaMessage(message: SenderMediaMessage): void {
        switch (message.type) {
            case "PLAY":
                // play active media
                this.sendBindCall(new URLSearchParams({req0__sc: "resume"}));
                break;
            case "PAUSE":
                // pause active media
                this.sendBindCall(new URLSearchParams({req0__sc: "pause"}));
                break;
            case "MEDIA_GET_STATUS":
            case "GET_STATUS":
                // TODO: this is supposed to send something back that I probably 
                // need to pass up to the extension
                this.sendBindCall(new URLSearchParams({req0__sc: "getStatus"}));
                // On_media_status update in index --
                // sends something with messaging.sendmessaged with the device id and status stuff
                // presumably this goes to the extension
                break;
            case "STOP":
                // stop playback, end session   
                this.sendBindCall(new URLSearchParams({req0__sc: "stop"}));
                break;
            case "MEDIA_SET_VOLUME":
            case "SET_VOLUME":
                // Set the (youtube app relative) volume
                // TODO: refactor into a separate function?
                let volume = null;

                if (message.volume.muted) {
                    // if muted == True this will set to 0, otherwise will skip if null or False
                    volume = 0;
                } else if (message.volume.level != null) {
                    volume = message.volume.level * 100; // Cast takes 0-1, lounge takes 0-100
                }

                this.sendBindCall(new URLSearchParams({req0__sc: "setVolume", req0__volume: volume!.toString()}));

                break;
            case "SET_PLAYBACK_RATE":
                break;
                // NOT SUPPORTED
                // TODO:: Do nothing?
            case "LOAD":
                break;
                // Load a single video
                // uses set_playlist, same as loading a queue, do something smart
            case "SEEK":
                // jumps to given timestamp in the videothis.sendBindCall(new URLSearchParams({req0__sc: "pause"}));
                
                // currentTime is nullable for livestreams
                // if null just reset to 0 to now
                // TODO: pull the current time if its null and reset it to that?
                this.sendBindCall(new URLSearchParams({req0__sc: "seek", req0__currentTime: message.currentTime?.toString() ?? "0"}));
                
                // if it wants paused then pause it after
                if ((message.resumeState ?? "") === "PLAYBACK_PAUSE") {
                    this.sendBindCall(new URLSearchParams({req0__sc: "pause"}));
                }
                break;
            // jumps to given timestamp in the video
            case "EDIT_TRACKS_INFO":
                break;
                // NOT SUPPORTED
            case "QUEUE_LOAD":
                break;
                // load a queue of videos
            case "QUEUE_INSERT":
                break;
                // insert something into the queue 
            case "QUEUE_UPDATE":
                // this is 3 types of messages
                // update the queue  -- don't think this matters
                // update the queue and jump (?) -- just jump
                // update the queue with a setting to loop/repeat/shuffle -- this isn't directly supported -- mimic this behavior?
                break;
            case "QUEUE_REMOVE":
                break;
                // remove something from the queue
            case "QUEUE_REORDER":
                break;
                // reorder the queue
        }
    }

    private getLoungeParams(): URLSearchParams {
        // fetch Params when needed to get the up to date token and ids
        const params = new URLSearchParams();
        params.append("CVER", paramVer);
        params.append("RID", paramRidPlay);
        params.append("SID", this.sid!);
        params.append("VER", paramVer);
        params.append("gsessionid", this.gsid!);
        params.append("loungeIdToken", this.loungeToken!);

        return params;
    }

    private async sendBindCall(bodyParams: URLSearchParams): Promise<Response> {
        // TODO: See what in the above message types actually need a return/what they need from that. Might have to break those out into separate functions?
        const response = await fetch(
            `${loungeApiBind}?${this.getLoungeParams()}`, {
            method: "POST",
            headers: loungeHeaders,
            body: `${bodyParams}`
        }
        );

        return response;
    }

    // todo -- refresh token when it expires


}