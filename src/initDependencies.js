import { apiHost, domainPrefix, xDeviceVersion } from './config';
import { isOnlineMode } from './config-debug';

import { AsyncStorage } from 'react-native';
import Requester from 'locktrip-svc-layer';
import requesterOffline from './utils/debug/offline'

let config = {
    "apiHost": apiHost,
    "domainPrefix": domainPrefix
};

let requester;

if (isOnlineMode) {
	// ONLINE
	requester = new Requester(AsyncStorage, config, { "X-Device-Version": xDeviceVersion });
}
else {
	// OFFLINE
	requester = requesterOffline();
}

export default requester;