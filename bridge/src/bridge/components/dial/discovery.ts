import type { Discovery, DiscoveryOptions } from "../generic/types";

import { Client, SsdpHeaders } from "node-ssdp";

import fetch from "node-fetch";

import { RemoteInfo } from "dgram";

const dialFilter = 'urn:dial-multiscreen-org:service:dial:1';

export default class DialDiscovery implements Discovery {
    constructor(opts: DiscoveryOptions) {
        //todo - constructor to have it send new remotes to the list in index
    }

    findServers(client: Client) {
        // Perform a search
        client.search(dialFilter);

        setTimeout(() => {
        client.stop();
        console.log('Stopped SSDP search.');
        }, 5000);

    }


    start() {
        const client = new Client();

        // Listen for responses
        client.on('response', (headers: SsdpHeaders, statusCode: number, rinfo: RemoteInfo) => {
        console.log('--- SSDP Response ---');
        console.log('Status:', statusCode);
        console.log('Headers:', headers);
        console.log('Remote Info:', rinfo);
        //console.log(typeof parseHeaders(headers))
        //console.log();
        //const parsed_headers = parseHeaders(headers)
        //console.log('LOCATION AGIAN:', parsed_headers.LOCATION);
        //console.log();
        
        client.search(dialFilter);
        });

        // TODO: need to 


    }

    stop() {
        // todo
    }
}

///////////////////////////////////////////////////////////////
// STUFF FROM TEST IMPLEMENTATION IN REPO @DIAL_CLIENT BELOW //
///////////////////////////////////////////////////////////////

//const { Client } = require('node-ssdp');


const client = new Client();



function parseHeaders(headerString: string): Record<string, string> {
  const headers: Record<string, string> = {};
  const lines = headerString.split(/\r?\n/);
  for (const line of lines) {
    const [key, ...rest] = line.split(':');
    if (key && rest.length) {
      headers[key.trim()] = rest.join(':').trim();
    }
  }
  return headers;
}



async function get_desc() {
//'Origin: https://www.youtube.com'
  const response = await fetch('http://10.0.0.163:8009/apps/YouTube', {method: "POST", body: 'v=qbu34plwERw', headers: {'Origin': 'https://www.youtube.com'}});//, {
    //method: "POST"});
  const data = await response;

console.log(data);
}


get_desc();
