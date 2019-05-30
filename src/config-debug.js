import { isObject, isString } from './components/screens/utils';
import lodash from 'lodash';
import { isMoment } from 'moment';

// FORCE modes - possible in RELEASE
// 
// ALL MUST BE FALSE!!!      (unless you know what you are doing)
export const reactotronLoggingInReleaseForceEnabled  = true;
export const forceOffline                            = false;

  // error handling
/*  !__DEV__ console.warn (short version - message only)
    0 console.warn (message & data)
    1   console.error
    2   reactotron.error
    else:
           throw Error                                            */
export const errorLevel = 1;

  // reactotron
export const reactotronLoggingEnabled           = false;
export const logConverterErrorToReactrotron     = false;
export const showTypesInReactotronLog           = true;
  // redux
  export const reduxConsoleLoggingEnabled         = true;
  export const reduxConsoleCollapsedLogging       = true;
  export const reduxReactotronLoggingEnabled      = false;
  // console
export const raiseConverterExceptions           = false;
export const logConverterError                  = false;
export const consoleTimeCalculations            = true;    // enable/disable "console.time" & "console.timeEnd" calls
  // other
export const webviewDebugEnabled                = false;
export const hotelsSearchMapDebugEnabled        = false;
export const checkHotelsDataWithTemplates       = 'filter-parsed,socket-parsed'; // typeOfCheck:string or boolean (for all)
  // offline mode
  // Enabled if: (__DEV__ == true) and (isOffline == true)
                                let isOffline   = false;
  if (forceOffline) isOffline = forceOffline;
  if (!__DEV__) isOffline = false;
export const isOnline = (!isOffline);
export const autoLoginInOfflineMode             = true;
  // automated flows
export const autoHotelSearch                    = false;
export const autoHotelSearchFocus               = false;
export const autoHotelSearchPlace               = 'london'
export const autoHomeSearch                     = true;
export const autoHomeSearchPlace                = 'uk1'
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

function configureConsole() {
  // in both release & debug/dev
  // Check if reactotron enabled - make safe calls
  if (!console.tron) {
    let func;
    console.tron = {};

    if (__DEV__) {
      func = (method) => console.warn(
        '[config-debug] Reactotron is disabled, but still calling it as '+
        `console.tron.${method}`
      )
    } else if (reactotronLoggingInReleaseForceEnabled) {
        func = (method,...args) => {
          switch (method) {
            case 'display':
              console.log(`[REACTOTRON ][${method}] ${args[0].name}`, args[0])
              break;
          }
        }
    } else {
      func = ()=>{}
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
    console.time = function() {}
    console.timeEnd = function() {}
    console.group = function() {}
    console.groupEnd = function() {}
    console.groupCollapsed = function() {}
  } else {
    if (!consoleTimeCalculations) {
      console.time = function() {}
      console.timeEnd = function() {}  
    }
  }
}


function configureReactotron() {
  // if in dev mode or forceReactotronLogging
  if (__DEV__ || reactotronLoggingInReleaseForceEnabled) {
    // Reactotron config
    try {
      require('./utils/reactotronLogging')
      console.log('Reactotron connected');
    } catch (e) {
      console.warn('Reactotron could not be enabled');
    }

  }
}


// ---------------     exports     -----------------

// TODO: Implement error handling - logging or throw
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
        throw new Error(description);
    }

  }
}

/**
 * Print object in console log having in mind moment
 * @param {Object} obj
 */
function dlogFunc(obj, title=null, isInternal=false, indent=' ') {
  let result = '';
  let isFirst = true;

  for (let i in obj) {
    let item = obj[i];

    if (isMoment(item)) {
      result += indent + `${i}: ${item.format('YYYY-MM-DD HH:mm:ss.SSS ZZ, ddd, MMM')} (moment)\n`;
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
export const dlog = dlogFunc;


export function logd(tag, description, data, isImportant = false) {
  if (__DEV__) {
    log('dev-debug', `[${tag}] `+description, data, isImportant);
  }
}

export const clog = console.log;


/**
 * Logs using Reactotron.display
 * @param {String/Object} tag Tag as in ERROR, API, DEBUG etc. / Can be just an object to trace
 * @param {String/Object} description A short description or preview of data / Or just data to trace
 * @param {any} data Any object data that need to be visible
 * @param {Boolean} isImportant A highlight of tag (as in ERROR)
 */
export function log(tag, description, data, isImportant = false) {
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
  if (params.value && showTypesInReactotronLog) {
    let parseObjTypes;

    parseObjTypes = function(o) {
      let result = {};
      for (let prop in o) {
        let item = o[prop];
        if (isObject(item)) {
          let className = '';
          try {
            className = result.constructor.name;
            if (!className) className = result.prototype.constructor.name;
            if (className) className = ":" + className;
          } catch (e) {}          
          lodash.merge(result,{[`${prop}${className}`]:parseObjTypes(item)});
        } else {
          try {
            result[prop] = `${item} (${typeof(item)})`
          } catch (error) {
            processError(`[config-debug::log::parseObjTypes] Error while setting result['${prop}']: ${error.message}`,{error,item,result})
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
  configureReactotron()
  configureConsole()

}
