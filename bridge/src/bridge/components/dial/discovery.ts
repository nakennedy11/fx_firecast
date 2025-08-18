import type { Discovery, DiscoveryOptions } from "../generic/types";

import type { ReceiverDevice } from "../../messagingTypes";

import { Client, SsdpHeaders } from "node-ssdp";

import { RemoteInfo } from "dgram";

import fetch from "node-fetch";

import xml2js from "xml2js";

const dialSearchTarget = 'urn:dial-multiscreen-org:service:dial:1';


export interface DialDevice {
  deviceType: string;
  friendlyName: string;
  manufacturer: string;
  manufacturerURL: string;
  modelDescription: string;
  modelName: string;
  modelNumber: string;
  modelURL: string;
  serialNumber: string;
  UDN: string;
  applicationURL: string; // should never be null based on DIAL protocol
}


export default class DialDiscovery implements Discovery {

  // node-ssdp client 
  client = new Client();


  private parseSsdpHeaders(raw: SsdpHeaders): Record<string, string> {
    const lines = raw.toString().split(/\r?\n/);
    const map: Record<string, string> = {};

    for (const line of lines) {
      const idx = line.indexOf(":");
      if (idx === -1) continue;
      map[line.slice(0, idx).trim().toLowerCase()] = line.slice(idx + 1).trim();
    }

    return map;
  }


  private async getDialDeviceDesc(location: string): Promise<DialDevice> {
    const response = await fetch(location);
    const xmlText = await response.text();
    const parsed = await xml2js.parseStringPromise(xmlText, { explicitArray: false });

    const device = parsed.root.device

    const dialDevice: DialDevice = {
      deviceType: device.deviceType,
      friendlyName: device.friendlyName,
      manufacturer: device.manufacturer,
      manufacturerURL: device.manufacturerURL,
      modelDescription: device.modelDescription,
      modelName: device.modelName,
      modelNumber: device.modelNumber,
      modelURL: device.modelURL,
      serialNumber: device.serialNumber,
      UDN: device.UDN,
      applicationURL: response.headers.get("application-url")!
    };

    return dialDevice;
  }

  constructor(opts: DiscoveryOptions) {
    //todo - constructor to have it send new remotes to the list in index

    // Listen for responses
    this.client.on('response', (headers: SsdpHeaders, statusCode: number, rinfo: RemoteInfo) => {
      /*
        SsdpHeaders:
          LOCATION? (url where the service description can be found)
          ST? (urn:dial-multiscreen-org:service:dial:1)
          --
          USN? (unique service name of responding device)
        
        RemoteInfo:
          address: string
          family: "IPv4" | "IPv6"
          port: number
          size: number
      */

      this.handleResponse(headers, rinfo, opts)

    });
  }

  private async handleResponse(headers: SsdpHeaders, rinfo: RemoteInfo, opts: DiscoveryOptions) {
    // parse the SSDP reponse header to a usable map
    const parsedHeaders = this.parseSsdpHeaders(headers);
    // get the device description from the given header location as a DialDevice
    const dialDevice = await this.getDialDeviceDesc(parsedHeaders.location)



    const device: ReceiverDevice = {
      id: dialDevice.UDN,
      friendlyName: dialDevice.friendlyName,
      modelName: dialDevice.modelName,
      capabilities: 0, //TODO: IDK IF THIS ACTUALLY MATTERS OR NOT
      host: dialDevice.applicationURL,
      port: rinfo.port
    }

    opts.onDeviceFound(device);
  }

  start() {
    // do an ssdp search with the DIAL search target to find DIAL servers/first screen devices
    this.client.search(dialSearchTarget);
  }

  stop() {
    this.client.stop();
  }
}


