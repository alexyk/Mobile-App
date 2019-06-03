import {LT_CFG} from './config'

const compilationTime = '';     // this line is updated by scripts/select_config.rb
const branchName='';            // this line is updated by scripts/select_config.rb and travis-version.rb
const travisVersion='';         // this line is updated by scripts/select_config.rb and travis-version.rb
const exploreIsNative = true;
const hotelitemIsNative = false;
const packJsonVersion = require("../package.json").version;
const productVersion = `${packJsonVersion}${travisVersion.length >0 ? ` (Build ${travisVersion})` : ''}`;

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
