import {LT_CFG} from './config'

const compilationTime = '2019-06-06 18:29:45 EEST';
const branchName='';            // this line is updated by scripts/select_config.rb and travis-version.rb
const travisVersion='';         // this line is updated by scripts/select_config.rb and travis-version.rb
const exploreIsNative = true;
const hotelitemIsNative = true;
const packJsonVersion = require("../package.json").version;
const productVersion = `${packJsonVersion}${travisVersion.length >0 ? ` (Build ${travisVersion})` : ''}`;

let ui = '';
ui += `\n${exploreIsNative
    ? hotelitemIsNative ? 'native-HotelsSearch-2' : 'native-HotelsSearch-1'
    : 'webview-HotelsSearch'
}`;

let tmpDebug = `${productVersion}`
if (travisVersion.length > 0)   tmpDebug += `\r${travisVersion}`
if (branchName.length > 0)      tmpDebug += `\rbranch:${branchName}`
tmpDebug += `[${compilationTime}]`
tmpDebug += `env:${LT_CFG.toLowerCase()}`
tmpDebug += `${ui}`

export const debugVersion = tmpDebug;
export const isNative = {
    explore: exploreIsNative,
    hotelItem: hotelitemIsNative,
};

export default productVersion;
