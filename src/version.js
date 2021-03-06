import {LT_CFG} from './config'
import { hotelSearchIsNative } from './config-settings';
const { step1Results, step2HotelDetails, step3BookingDetails } = hotelSearchIsNative;

const compilationTime = '2019-07-05 12:14:17 EEST';
const branchName='';            // this line is updated by scripts/select_config.rb and travis-version.rb
const travisVersion='';         // this line is updated by scripts/select_config.rb and travis-version.rb
const packJsonVersion = require("../package.json").version;
const productVersion = `${packJsonVersion}${travisVersion.length >0 ? ` (Build ${travisVersion})` : ''}`;

let ui = (
    step1Results
    ? step2HotelDetails 
        ? step3BookingDetails
            ? 'native-HotelsSearch-3'
            : 'native-HotelsSearch-2'
        : 'native-HotelsSearch-1'
    : 'webview-HotelsSearch'
);

export var debugVersion = `${productVersion}`
if (branchName.length > 0)      debugVersion += `\nbranch: ${branchName}`
debugVersion += `\n[${compilationTime}]`
debugVersion += `\nenv: ${LT_CFG.toLowerCase()}`
debugVersion += `\nui: ${ui}`

export default productVersion;
