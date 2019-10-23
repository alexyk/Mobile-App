import { Platform } from 'react-native';

// TODO: Check if there is a better way to know if the code is in testing mode (jest etc.)
// Currently using Platform.Version and (__MYDEV__ === undefined || __TEST__) to know that it is testing (functions loose their context scope)
// Example usage emptyFuncWithDescr, 
// 

var DBG = {};
DBG = {
  /** 
   * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
   * FORCE modes - possible in RELEASE                               *
   * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
   * ALL MUST BE FALSE!!!      (unless you know what you are doing)  *
   * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
   */
  __MYDEV__                               : (__DEV__ && true),
  __TEST__                                : (Platform.Version == undefined),
  reactotronLoggingInReleaseForceEnabled  : false,
  forceOffline                            : false,


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
  errorLevel: 0,

    // reactotron
  reactotronLoggingEnabled           : true,
  logConverterErrorToReactotron      : false,
  showTypesInReactotronLog           : false,
  warnOnReactotronDisabledCalls      : false,
    // redux
  reduxConsoleLoggingEnabled         : false,
  reduxConsoleCollapsedLogging       : true,
  reduxReactotronLoggingEnabled      : false,
    // console
  raiseConverterExceptions           : false,
  logConverterError                  : false,
  consoleTimeCalculations            : false,    // enable/disable "console.time" & "console.timeEnd" calls
  consoleShowTimeInLogs              : true,     // prepend with time
  consoleClearAtStart                : true,
  consoleFilter                      : 'custom',
  serverLogRequesting                : true,
  serverExpandErrors                 : false,
    // other
  webviewDebugEnabled                : true,
  hotelsSearchMapDebugEnabled        : false,
  hotelsSearchSocketDebug            : false,
  checkHotelsDataWithTemplates       : 'static,static-patched,static-parsed,socket,socket-parsed,filter,filter-parsed', // 2 values - (1) string in the form "typeOfCheck1,typeOfCheck2" ... or (2) boolean - check all
    // offline mode
    // Enabled if: (__DEV__ == true) and (isOffline == true)

  autoLoginInOfflineMode             : true,
  validationStateOfflineWallet       : -1,  // -1: none, 0: invalid, 1: valid
  walletFlowDebug                    : false,
  offlineEmailVerificationValue      : true,
    // automated flows
      // hotels search
  autoHotelSearch                    : false,
  autoHotelSearchFocus               : false,
  autoHotelSearchPlace               : 'araraquara',
  skipEmailVerification              : false,
      // homes search
  autoHomeSearch                     : false,
  autoHomeSearchPlace                : 'uk1',
    // calendar
  autoCalendar                       : false,
    // message dialog
  messageDialogDebug                 : false,
  debugSettingsOption                : false,
    // test flows
  testFlowURL                        : "http://beta.locktrip.com/api/hotels/searh?query=london",
  testFlow                           : "",

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
  iconsDebugEnabled                  : false
}

DBG.offlineTimeInSeconds = {
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

DBG.isOffline = false
if (!__DEV__) DBG.isOffline = false;  // automatic false value for release
(DBG.forceOffline) && (DBG.isOffline = DBG.forceOffline);   // force release value with forceOffline
DBG.isOnline = (!DBG.isOffline);


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
DBG.filtersConfig = {
  includeNonMatching: true,
  leaveOnFirstMatch: true,
  matchCase: true,
  mode: 'and',
  empty: [],
  0: [],
  default: ['!\`scale', '!Require cycle', "!Async Storage ", "!SocketRocket", '!Disabling console.time', '!deprecated', "!RCTSplashScreen", "!using weak randomBytes", "!Running application", "!serverUtils"],
}
const filtersConfig = DBG.filtersConfig;
filtersConfig.default2 = [].concat(filtersConfig.default, ['!<object>'])
filtersConfig.default3 = ['mode:liM'].concat(filtersConfig.default2, [])
filtersConfig.default4 = [`mode:liM`].concat(filtersConfig.default2, [])
filtersConfig.fav1 = ['serverUtil'].concat(filtersConfig.default4, [])
filtersConfig.fav2 = ['MessageDialog', 'includeNonMatching: false']
filtersConfig.safari = [].concat(filtersConfig.default2)
filtersConfig.vscode = [].concat(filtersConfig.default4, ['MessageDialog', 'serverUtil'])
filtersConfig.vscode2 = [].concat(filtersConfig.vscode, ['action'])
filtersConfig.testFlow = [].concat(filtersConfig.default, ['includeNonMatching: true'])
filtersConfig.simple = [].concat(filtersConfig.default4, ['includeNonMatching: false', 'serverUtil'])
filtersConfig.server = ['includeNonMatching: false', 'serverUtil', ]
filtersConfig.redux = ["mode: liM"].concat(filtersConfig.default2, ['serverUtil', 'action', "Flow", 'redux', "!next state", "!prev state"])
filtersConfig.debug1 = ["mode: LiM", "error", 'serverUtils'].concat(filtersConfig.default2)
filtersConfig.flows = ["mode: Lim", /^search flow step/]

filtersConfig.custom = ["mode:Limc", 'MessageDialog', 'error','server']

DBG.consoleFilters = ( DBG.consoleFilter ? filtersConfig[DBG.consoleFilter] : null );
DBG.setDebugOption = setDebugOption;


function setDebugOption(name, value) {
  switch (name) {
    case 'reduxLog':             DBG.reduxConsoleLoggingEnabled = value;   break;
    case 'dialogDebug':          DBG.messageDialogDebug = value;           break;
    case 'reactotron':           DBG.reactotronLoggingEnabled = value;     break;
    case 'skipEmailVerify':      DBG.skipEmailVerification = value;        break;
    case 'testFlow':             DBG.testFlow = value;                     break;
    case 'isOffline':            
    case 'isOnline':
      DBG.isOnline = value;
      DBG.isOffline = !value;
      break;

    case 'consoleFilter':
      DBG.consoleFilter = value;
      DBG.consoleFilters = DBG.filtersConfig[value]
      break;
    
    case 'customFilter':
      DBG.filtersConfig.custom = value;
      DBG.consoleFilters = value;
      break;
    default:                     DBG[name] = value;                        break;
  }
}

export {
  setDebugOption
}

export default DBG;