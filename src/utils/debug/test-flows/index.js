/**
 * Go to config-debug and set testFlow const to:
 * 
 * (function object) defined here in default export
 *  - require('./utils/debug/test-flows/recaptcha').default.request
 *  - require('./utils/debug/test-flows/recaptcha').default.webview
 *  - require('./utils/debug/test-flows/recaptcha').default.webviewHTML
 * 
 * (string) defined in "src/utils/debug/debug-tools/index.js"
 *  - hotelDetails
 *  - guestInfo
 *  - <default>
 * 
 * (string) defined in "test-flows" separate project
 *  - sampleFlow
 *  - sampleFlowAxios
 *  - sampleFlowFetch
 */


import recaptcha from './recaptcha';
import api from './api';


export default {
  recaptcha, api
}