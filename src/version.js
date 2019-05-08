import {LT_CFG} from './config'

const productVersion = require("../package.json").version;
const exploreIsNative = true;   // false: webview version, true: native search version (also updated by scripts/select_config.rb)
const hotelitemIsNative = false;// this line is updated by scripts/select_config.rb
const travisVersion='';         // this line is updated by scripts/select_config.rb
const branchName='';            // this line is updated by scripts/select_config.rb
const compilationTime = '2019-05-08 17:16:27 EEST';

let ui = '';
ui += `\n${exploreIsNative
    ? hotelitemIsNative ? 'native-HotelsSearch-2' : 'native-HotelsSearch-1'
    : 'webview-HotelsSearch'
}`;

let tmpDebug = `${productVersion}`
if (travisVersion.length > 0)   tmpDebug += ` - ${travisVersion}`
if (branchName.length > 0)      tmpDebug += ` - ${branchName}`
tmpDebug += ` - [${compilationTime}] -- `
tmpDebug += ` - ${LT_CFG.toLowerCase()}`
tmpDebug += ` - ${ui}`

export const debugVersion = tmpDebug;
export const isNative = {
    explore: exploreIsNative,
    hotelItem: hotelitemIsNative,
};

export default productVersion;
