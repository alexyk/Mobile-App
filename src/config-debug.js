import { Platform } from 'react-native';
import { isObject, isString, getObjectClassName, isSymbol } from './components/screens/utils';
import lodash from 'lodash';
import moment, { isMoment } from 'moment';
import { printAny } from '../test/common-test-utils';


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
export const reactotronLoggingEnabled           = false;
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
  // other
export const webviewDebugEnabled                = false;
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
export const offlineTimeInSeconds = {
  getCountries: 0.1,
  getCurrencyRates: 0.1,
  login: 0.1,
  getUserInfo: 0.1,
  getLocRateByCurrency: 0.1,
  getMyHotelBookings: 0.1,
  getMyConversations: 0.1,
  getWalletFromEtherJS1: 1,
  getWalletFromEtherJS2: 0.2
}
  // automated flows
    // hotels search
export const autoHotelSearch                    = false;
export const autoHotelSearchFocus               = false;
export const autoHotelSearchPlace               = 'sofia'
    // homes search
export const autoHomeSearch                     = false;
export const autoHomeSearchPlace                = 'uk1'
  // calendar
export const autoCalendar                       = false;
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


// ---------------  function definitions  -----------------

const emptyFunc = function() {};
function emptyFuncWithDescr(descr) { if (__MYDEV__ !== undefined && console.warn != null) console.warn(` Call of '${descr}' is disabled - see '__MYDEV__'`) };

function addTime(all) {
  if (consoleShowTimeInLogs) {
    const timeStr = `[${moment().format('HH:mm:ss.SSS')}]`;
    all.unshift(timeStr);
  }
}
export var dlog = dlogFunc;
export function clog(...all) {addTime(all); console.log(...all)};
export function ilog(...all) {addTime(all); console.info(...all)}
export function wlog(...all) {addTime(all); console.warn(...all)}
export function elog(...all) {addTime(all); console.error(...all)}
export var tslog = (consoleTimeCalculations ? console.time : emptyFunc);
export var telog = (consoleTimeCalculations ? console.timeEnd : emptyFunc);


/**
 * Print moment object in a formated way
 */
export var mlog = mlogFunc; // moment logging

function configureConsole() {
  // if testing with jest - return
  if (__MYDEV__ == undefined || __TEST__) {
    return;
  }



  if (!__DEV__ && !__MYDEV__) {
    clog = emptyFunc;
    ilog = emptyFunc;
    dlog = emptyFunc;
    wlog = emptyFunc;
    elog = emptyFunc;
    mlog = emptyFunc;
  } else  if (!__MYDEV__) {
    clog = emptyFuncWithDescr('clog');
    ilog = emptyFuncWithDescr('ilog');
    dlog = emptyFuncWithDescr('dlog');
    wlog = emptyFuncWithDescr('wlog');
    elog = emptyFuncWithDescr('elog');
    mlog = emptyFuncWithDescr('mlog');
  }

  // in both release & debug/dev
  // Check if reactotron enabled - make safe calls
  if (!console.tron) {
    let func;
    console.tron = {};

    if (__DEV__) {
      if (warnOnReactotronDisabledCalls) {
      func = (method) => console.warn(
        '[config-debug] Reactotron is disabled, but still calling it as '+
        `console.tron.${method}`
      )
      } else {
        func = emptyFunc;
      }
    } else if (reactotronLoggingInReleaseForceEnabled) {
        func = (method,...args) => {
          switch (method) {
            case 'display':
              console.log(`[REACTOTRON ][${method}] ${args[0].name}`, args[0])
              break;
          }
        }
    } else {
      func = emptyFunc;
    }
    console.tron = {
        ...console.tron,
        log: (...args) => func('log',...args),
        logImportant: (...args) => func('logImportant',...args),
        debug: (...args) => func('debug',...args),
        display: (...args) => func('display',...args),
        clear: (...args) => func('clear',...args),
        error: (...args) => func('error',...args),
        warn: (...args) => func('clear',...args),
        mylog: (...args) => func('mylog',...args),
        mylogd: (...args) => func('mylogd',...args),
    }
  }  

  // in case any forgotten console calls crash the build
  if (!console.time) {
    console.time = emptyFunc;
    console.timeEnd = emptyFunc;
    tslog = emptyFunc;
    telog = emptyFunc;
    // When console.time is n/a so is console.group etc. (I don't remember the example /Alex K)
    console.group = (console.log ? console.log : emptyFunc);
    console.groupEnd = (console.log ? console.log : emptyFunc);
    console.groupCollapsed = (console.log ? console.log : emptyFunc);
    if (console.warn) console.warn('[config-debug] console.time is not available - disabling console.time(End) and console.group(End|Collapsed) families of calls');
  } else if (!consoleTimeCalculations || !__MYDEV__) {
    console.time = emptyFunc;
    console.timeEnd = emptyFunc;
    tslog = emptyFunc;
    telog = emptyFunc;
    if (__MYDEV__ !== undefined && console.warn != null) console.warn(`[config-debug] Disabling console.time(End) calls - see values of 'consoleTimeCalculations' or '__MYDEV__'`);
  }
}


function configureReactotron() {
  // if testing with jest - return
  if (__MYDEV__ == undefined || __TEST__) {
    return;
  }


  // if in dev mode or forceReactotronLogging
  if ((__DEV__ && reactotronLoggingEnabled) || reactotronLoggingInReleaseForceEnabled) {
    // Reactotron config
    try {
      require('./utils/reactotronLogging')
      const r = require('reactotron-react-native')
      const Reactotron = r.default;
      console.tron = Reactotron;
      console.tron.mylog = rlog;
      console.tron.mylogd = rlogd;
      ilog('Reactotron connected');
    } catch (e) {
      if (__MYDEV__ !== undefined && !__TEST__) console.warn('Reactotron could not be enabled - ' + e.message);
    }

  } else {
    if (__MYDEV__ !== undefined && !__TEST__) {
      console.disableYellowBox = true;
      ilog(`Reactotron is disabled - release=${reactotronLoggingInReleaseForceEnabled} dev=${reactotronLoggingEnabled}`);
    }
  }
}


// ---------------     exports     -----------------

/**
 * Logs or throws a captured error
 * @param {String} description Information about the error
 * @param {Object} data Not shown in release
 */
export function processError(description, data) {
  if (!__DEV__) {

    console.warn(description);

  } else {

    switch (errorLevel) {
      case 0:
        console.warn(description, data);
        break;

      case 1:
        console.error(description, data);
        break;

      case 2:
        if (console.tron && console.tron.error) {
          //TODO: Try this - not tested!!!
          console.tron.error(description, data);
        }
        break;

      default:      
        console.error(description, data);

        if (data.error) {
          throw data.error;
        } else {
        throw new Error(description);
    }
    }

  }
}

/**
 * Print object in console log having in mind moment
 * @param {Object} obj
 */
function mlogFunc(momentObj, title=`Moment is`, format=`YYYY-MM-DD HH:mm:ss.SSS [GMT]ZZ [T] ddd,MMM`) {
  if (momentObj == null) momentObj = {format:()=>'moment is null'};
  console.log(`[mlog] ${title} ${momentObj.format(format)}`)
}
function dlogFunc(obj, title=null, isInternal=false, indent=' ') {
  // reverse params if needed
  if (isObject(title) && isString(obj)) {
    let tmp = title;
    title = obj;
    obj = tmp;
  }

  let result = '';
  let isFirst = true;

  for (let i in obj) {
    let item = obj[i];

    if (isMoment(item)) {
      result += indent + `${i}: ${item.format('YYYY-MM-DD HH:mm:ss.SSS GMTZ, ddd, MMM')} (moment)\n`;
    } else if (isObject(item)) {
      result += indent + `${i}: {\n  ${dlog(item,i,true,indent)}${indent}}\n`;
    } else {
      result += indent + `${i}: ${item} (${typeof(item)})\n`;
    }
    if (isFirst) {
      if (isInternal) indent += '  ';
      isFirst = false;
    }
  }

  if (!isObject(obj)) result = `${obj}`;

  if (!isInternal) {
    result = `[dlog]${title ? (' ' + title) : ''}:\n${result}`;
  }
  if (!isInternal) {
    console.log(result);
  } else {
    return result;
  }
}

/**
 * Reactotron logging - for temporary debug
 * @param {String} tag 
 * @param {String} description 
 * @param {any} data 
 * @param {Boolean} isImportant 
 */
export function rlogd(tag, description, data, isImportant = false) {
  // if testing in jest etc.
  if (__MYDEV__ == undefined || __TEST__) {
    console.log('[rlog]',tag, description, data);
    return;
  }

  if (__DEV__) {
    rlog('dev-debug', `[${tag}] `+description, data, isImportant);
  }
}


/**
 * Reactotron custom logging using Reactotron.display
 * @param {String/Object} tag Tag as in ERROR, API, DEBUG etc. / Can be just an object to trace
 * @param {String/Object} description A short description or preview of data / Or just data to trace
 * @param {any} data Any object data that need to be visible
 * @param {Boolean} isImportant A highlight of tag (as in ERROR)
 */
export function rlog(tag, description, data, isImportant = false) {
  // if testing in jest etc.
  if (__MYDEV__ == undefined || __TEST__) {
    console.log(`[rlog] ${tag}`, printAny(data ? {[description]:data} : description));
    return;
  }

  let params = {}
  let doParsing = true
  
  if (typeof(tag) == 'object') {
    if (!tag.name && !tag.preview) {
      const isArray = (tag.length != null);
      params.important = true;
      params.name = (isArray ? `array: ${tag.length}` : 'object')
      if (isArray) {
        params.value = {Array:tag, length: tag.length};
      } else {
        let keys = ''
        for (let prop in tag) keys += `${prop}, `
        keys = keys.substr(0, keys.length-2)
        params.preview = `Object keys: ${keys.substr(0,90)} ...`
        params.value = {Object:tag, keys};
      }
    } else {
      params = tag;
    }
    doParsing = false;
  } else if (tag.length >= 25 || (tag && !description)) {
    params.name = 'LOG'
    params.preview = tag;
    doParsing = false
  } 
  if (typeof(description) == 'object') {
    const obj = description;
    params.value = obj;
    description = (obj.length != null ? `array: ${obj.length}` : 'object')
  }

  if (doParsing) {
    if (tag)          params.name       = tag;
    if (description)  params.preview    = description;
    if (data)         params.value      = data;
    if (isImportant)  params.important  = true;
  }

  if (params['value'] == null) {
    params['value'] = {}
  }

  params.value['_preview'] = params.preview;
  
  // types parsing
  if (params.value && showTypesInReactotronLog && (__DEV__ && __MYDEV__)) {
    let parseObjTypes;

    parseObjTypes = function(o) {
      let result = {};
      for (let prop in o) {
        let item = o[prop];
        let className = getObjectClassName(result);
        if (isObject(item)) {
          if (isSymbol(item, className) || (prop[0] == '_')) {
            result[`${prop}:${className}`] = `[instance of ${className}]`;
          } else {
            lodash.merge(result,{[`${prop}:${className}`]:parseObjTypes(item)});
          }
        } else {
          try {
            result[prop] = `${item} (${className})`
          } catch (error) {
            processError(`[config-debug::rlog::parseObjTypes] Error while setting result['${prop}']: ${error.message}`,{error,item,result})
          }
        }
      }

      return result;
    }
    params.value._valueWithTypes = parseObjTypes(params.value);
  }

  console.tron.display(params)
}


export function configureDebug() {
  configureReactotron();
  configureConsole();
  
  // axios debug
  //try { require('locktrip-svc-layer').setServiceDebug(false); } catch (error) {console.error('Error while setting debug to axios-requester',{error})}
}
