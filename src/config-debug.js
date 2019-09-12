import { Platform } from 'react-native';

// TODO: Check if there is a better way to know if the code is in testing mode (jest etc.)
// Currently using Platform.Version and (__MYDEV__ === undefined || __TEST__) to know that it is testing (functions loose their context scope)
// Example usage emptyFuncWithDescr, 
// 


/** 
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * FORCE modes - possible in RELEASE                               *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * ALL MUST BE FALSE!!!      (unless you know what you are doing)  *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 */
export const __MYDEV__                               = (__DEV__ && true);
export const __TEST__                                = (Platform.Version == undefined);
export const reactotronLoggingInReleaseForceEnabled  = false;
export const forceOffline                            = false;


/**  
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * Error handling
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * errorLevel: Number
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * 
 *    0   console.warn (message & data)
 *    1   console.error
 *    2   reactotron.error
 * 
*/
export const errorLevel = 0;

  // reactotron
export const reactotronLoggingEnabled           = true;
export const logConverterErrorToReactrotron     = false;
export const showTypesInReactotronLog           = true;
export const warnOnReactotronDisabledCalls      = false;
  // redux
export const reduxConsoleLoggingEnabled         = false;
export const reduxConsoleCollapsedLogging       = true;
export const reduxReactotronLoggingEnabled      = false;
  // console
export const raiseConverterExceptions           = false;
export const logConverterError                  = false;
export const consoleTimeCalculations            = false;    // enable/disable "console.time" & "console.timeEnd" calls
export const consoleShowTimeInLogs              = true;    // prepend with time
/**
 * consoleFilters
 * Two types of filtering - inclusive and exclusive depending on whether first char is exclamation mark (!)
 * Two types of filter data - String or RegEx
 * If the string starts with an ! - exclude it from log
 * If not starting with ! - continue logging it
 * Notes:
 *  - lower index in the array - means a higher priority as a filter meaning if it matches next filters are ignored
 *  - only inclusive regex is supported so far
 */
export const filtersConfig = {
  includeNonMatching: true,
  empty: [],
  0: [],
  1: ['!Require cycle', '!Disabling console.time', '!<object>', "!WARNING", "!deprecated", "!Running appl", "!RCTSplashScreen", "all-other"],
  2: ['includeNonMatching:false','!Require cycle', '!Disabling console.time', '!<object>', "!WARNING", "!deprecated", "!Running appl", "!RCTSplashScreen", "all-other"],
}
export const consoleFilters                     = filtersConfig['2'];
export const consoleClearAtStart                = true;
export const serverLogRequesting                = true;
export const serverExpandErrors                 = false;
  // other
export const webviewDebugEnabled                = true;
export const hotelsSearchMapDebugEnabled        = false;
export const hotelsSearchSocketDebug            = false;
export const checkHotelsDataWithTemplates       = 'static,static-patched,static-parsed,socket,socket-parsed,filter,filter-parsed'; // 2 valies - (1) string in the form "typeOfCheck1,typeOfCheck2" ... or (2) boolean - check all
  // offline mode
  // Enabled if: (__DEV__ == true) and (isOffline == true)
                                let isOffline   = false;
  if (forceOffline) isOffline = forceOffline;
  if (!__DEV__) isOffline = false;
export const isOnline = (!isOffline);
export const autoLoginInOfflineMode             = true;
export var validationStateOfflineWallet         = -1;  // -1: none, 0: invalid, 1: valid
export const offlineEmailVerificationValue      = true;
export const offlineTimeInSeconds = {
  getCountries: 0,
  getCurrencyRates: 0,
  login: 0,
  getUserInfo: 0,
  getLocRateByCurrency: 0,
  getMyHotelBookings: 0,
  getMyConversations: 0,
  getWalletFromEtherJS1: 0,
  getWalletFromEtherJS2: 0,
  getStaticHotels: 1,
  getSearchHotelResults: 1,
  socketDelay: 20, // in milliseconds
  socketDelay2: 1, // in milliseconds
  socketDelay3: 3, // in milliseconds
  getMapInfo: 3,
  getHotelRooms: 0,
  getHotelById: 0,
  sendVerificationEmail: 0.5
}
  // automated flows
    // hotels search
export const autoHotelSearch                    = false;
export const autoHotelSearchFocus               = true;
export const autoHotelSearchPlace               = 'london'
    // homes search
export const autoHomeSearch                     = false;
export const autoHomeSearchPlace                = 'uk1'
  // calendar
export const autoCalendar                       = false;
  // test flows
export const testFlowURL                        = "http://beta.locktrip.com/api/mobile/login";
export const testFlow                           = "";
// TODO: Add the following options
/*
    (1) reactotronLogsLevel - (0) reactotron only  (1) combine with console.log (2) only console.log
    (2) Logging level
      (0) reactotron only
      (1) combine with console.log
      (2) only console.log
      Note: Maybe combine with first or have (1) console logging options (2) reactotron logging options (3) combined options
      Best - make logging defined, as per A) delete console.log/info etc. and B) replace with planned log(), logd() - no more than 3 versions
      for example:
        logd - only when debugging (disabled/cleaned in release)
        log - for info/logging purposes
      and a rule - only one line logs (for easy ato deletion in release -> select_config.rb)
*/

  // ui
export const iconsDebugEnabled                  = false;    

