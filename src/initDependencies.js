import { apiHost, domainPrefix, xDeviceVersion } from "./config";
import DBG from "./config-debug";
import { NETWORK_CONNECTION_TIMEOUT } from "./config-settings";

import { AsyncStorage } from "react-native";
import Requester from "locktrip-svc-layer";
import requesterOffline from "./utils/debug/offline";

var config = {
  apiHost,
  domainPrefix,
  connectionTimeout: NETWORK_CONNECTION_TIMEOUT * 1000
};

var requester;

function refreshRequester() {
  if (DBG.isOnline) {
    // ONLINE
    requester = new Requester(AsyncStorage, config, {
      "X-Device-Version": xDeviceVersion
    });
  } else {
    // OFFLINE
    requester = requesterOffline();
  }

  return requester;
}
refreshRequester();


export {
  refreshRequester
}
export default requester;
