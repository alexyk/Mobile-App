import { apiHost, domainPrefix, xDeviceVersion } from "./config";
import { isOnline } from "./config-debug";
import { NETWORK_CONNECTION_TIMEOUT } from "./config-settings";

import { AsyncStorage } from "react-native";
import Requester from "locktrip-svc-layer";
import requesterOffline from "./utils/debug/offline";

let config = {
  apiHost,
  domainPrefix,
  connectionTimeout: NETWORK_CONNECTION_TIMEOUT * 1000
};

let requester;

if (isOnline) {
  // ONLINE
  requester = new Requester(AsyncStorage, config, {
    "X-Device-Version": xDeviceVersion
  });
} else {
  // OFFLINE
  requester = requesterOffline();
}

export default requester;
