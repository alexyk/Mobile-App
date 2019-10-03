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
var __MYDEV__                               = (__DEV__ && true);
var __TEST__                                = (Platform.Version == undefined);
var reactotronLoggingInReleaseForceEnabled  = false;
var forceOffline                            = false;


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
var errorLevel = 0;

  // reactotron
var reactotronLoggingEnabled           = true;
var logConverterErrorToReactotron      = false;
var showTypesInReactotronLog           = false;
var warnOnReactotronDisabledCalls      = false;
  // redux
var reduxConsoleLoggingEnabled         = false;
var reduxConsoleCollapsedLogging       = true;
var reduxReactotronLoggingEnabled      = false;
  // console
var raiseConverterExceptions           = false;
var logConverterError                  = false;
var consoleTimeCalculations            = false;    // enable/disable "console.time" & "console.timeEnd" calls
var consoleShowTimeInLogs              = true;     // prepend with time
var consoleClearAtStart                = true;
var consoleFilter                      = 'custom' || (testFlow ? 'testFlow' : '');
var serverLogRequesting                = true;
var serverExpandErrors                 = false;
  // other
var webviewDebugEnabled                = true;
var hotelsSearchMapDebugEnabled        = false;
var hotelsSearchSocketDebug            = false;
var checkHotelsDataWithTemplates       = 'static,static-patched,static-parsed,socket,socket-parsed,filter,filter-parsed'; // 2 valies - (1) string in the form "typeOfCheck1,typeOfCheck2" ... or (2) boolean - check all
  // offline mode
  // Enabled if: (__DEV__ == true) and (isOffline == true)
                       let isOffline   = false || !!testFlow;
  if (forceOffline) isOffline = forceOffline;
  if (!__DEV__) isOffline = false;
var isOnline = (!isOffline);
var autoLoginInOfflineMode             = true;
var validationStateOfflineWallet       = -1;  // -1: none, 0: invalid, 1: valid
var offlineEmailVerificationValue      = true;
  // automated flows
    // hotels search
var autoHotelSearch                    = false;
var autoHotelSearchFocus               = false;
var autoHotelSearchPlace               = 'araraquara';
var skipEmailVerification              = false;
    // homes search
var autoHomeSearch                     = false;
var autoHomeSearchPlace                = 'uk1'
  // calendar
var autoCalendar                       = false;
  // message dialog
var messageDialogDebug                 = true;
  // test flows
var testFlowURL                        = "http://beta.locktrip.com/api/hotels/searh?query=london";
var testFlow                           = "";


// ------------ data definitions ----------------
var offlineTimeInSeconds = {
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
  initialSocketDelay: 1500, // in milliseconds
  socketDelay: 0, // in milliseconds
  socketOnDoneDelay: 500, // in milliseconds
  getMapInfo: 3,
  getHotelRooms: 0,
  getHotelById: 0,
  sendVerificationEmail: 0.5
}

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
var iconsDebugEnabled                  = false;


// prettier-ignore
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
var filtersConfig = {
  includeNonMatching: true,
  leaveOnFirstMatch: true,
  mode: 'and',
  empty: [],
  0: [],
  default: ['!\`scale', '!Require cycle', "!Async Storage ", "!SocketRocket", '!Disabling console.time', '!deprecated', "!RCTSplashScreen", "!using weak randomBytes", "!Running application", "!serverUtils"],
}
filtersConfig.default2 = [].concat(filtersConfig.default, ['!<object>'])
filtersConfig.default3 = ['mode:liM'].concat(filtersConfig.default2, [])
filtersConfig.default4 = [`mode:liM`].concat(filtersConfig.default2, [])
filtersConfig.fav1   = ['serverUtil'].concat(filtersConfig.default4, [])
filtersConfig.fav2   = ['MessageDialog', 'includeNonMatching: false']
filtersConfig.safari = [].concat(filtersConfig.default2)
filtersConfig.vscode = [].concat(filtersConfig.default4, ['MessageDialog', 'serverUtil'])
filtersConfig.vscode2  = [].concat(filtersConfig.vscode, ['action'])
filtersConfig.testFlow = [].concat(filtersConfig.default, ['includeNonMatching: true'])
filtersConfig.simple = [].concat(filtersConfig.default4, ['includeNonMatching: false', 'serverUtil'])
filtersConfig.server = ['includeNonMatching: false', 'serverUtil', ]
filtersConfig.redux  = ["mode: liM"].concat(filtersConfig.default2, ['serverUtil', 'action', "Flow", 'redux', "!next state", "!prev state"])
filtersConfig.debug1  = ["mode: LiM", "error", 'serverUtils'].concat(filtersConfig.default2)
filtersConfig.flows  = ["mode: Lim", /^search flow step/]

filtersConfig.custom  = ["mode:Lim", "parent::",'MessageDialog', 'parent', 'error'] //'!Rejection', ].concat(filtersConfig.default)

var consoleFilters                     = ( consoleFilter ? filtersConfig[consoleFilter] : null );


function setDebugOption(name, value) {
  switch (name) {
    case 'reduxLog':             reduxConsoleLoggingEnabled = value;   break;
    case 'dialogDebug':          messageDialogDebug = value;           break;
    case 'reactotron':           reactotronLoggingEnabled = value;     break;
    case 'skipEmailVerify':      skipEmailVerification = value;        break;
    case 'testFlow':             testFlow = value;                     break;
    case 'isOnline':             isOnline = value;                     break;
    case 'consoleFilter':        consoleFilter = value;                break;
    case 'customFilter':         consoleFilters.custom = value;        break;
  }

}

export {
  __MYDEV__,
  __TEST__,
  reactotronLoggingInReleaseForceEnabled,
  forceOffline,
  errorLevel,
  reactotronLoggingEnabled,
  logConverterErrorToReactotron,
  showTypesInReactotronLog,
  warnOnReactotronDisabledCalls,
  reduxConsoleLoggingEnabled,
  reduxConsoleCollapsedLogging,
  reduxReactotronLoggingEnabled,
  raiseConverterExceptions,
  logConverterError,
  consoleTimeCalculations,
  consoleShowTimeInLogs,
  consoleClearAtStart,
  consoleFilter,
  serverLogRequesting,
  serverExpandErrors,
  webviewDebugEnabled,
  hotelsSearchMapDebugEnabled,
  hotelsSearchSocketDebug,
  checkHotelsDataWithTemplates,
  isOnline,
  autoLoginInOfflineMode,
  validationStateOfflineWallet,
  offlineEmailVerificationValue,
  autoHotelSearch,
  autoHotelSearchFocus,
  autoHotelSearchPlace,
  skipEmailVerification,
  autoHomeSearch,
  autoHomeSearchPlace,
  autoCalendar,
  messageDialogDebug,
  testFlowURL,
  testFlow,
  offlineTimeInSeconds,
  iconsDebugEnabled,
  filtersConfig,
  consoleFilters,
  setDebugOption
}