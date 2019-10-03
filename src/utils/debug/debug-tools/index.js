import { isObject, isString, getObjectClassName, isSymbol, logError } from "js-tools";
import lodash from 'lodash';
import moment, { isMoment } from 'moment';
const { __MYDEV__, __TEST__,
  consoleTimeCalculations, reactotronLoggingInReleaseForceEnabled, reactotronLoggingEnabled, consoleShowTimeInLogs,
  errorLevel, serverExpandErrors, showTypesInReactotronLog, testFlow, warnOnReactotronDisabledCalls, consoleFilters, testFlowURL, consoleClearAtStart, filtersConfig,
} = require('../../../config-debug').default;


// ---------------  function definitions  -----------------

const emptyFunc = function() {};
function emptyFuncWithDescr(descr) {
  return () => { if (__MYDEV__ !== undefined && console.warn != null) console.warn(` Call of '${descr}' is disabled - see '__MYDEV__'`) };
}

function addTime(all) {
  if (consoleShowTimeInLogs) {
    const timeStr = `[${moment().format("HH:mm:ss.SSS")}]`;
    all.unshift(timeStr);
  }
}

function configureConsole() {
  // if testing with jest - return
  if (__MYDEV__ == undefined || __TEST__) {
    return;
  }


  if (__DEV__ && consoleClearAtStart) {
    console.clear();
    console.log(' ------  Clearing at start -----   (consoleClearAtStart)');
  }

  if (!__DEV__ && !__MYDEV__) {
    clog = emptyFunc;
    ilog = emptyFunc;
    dlog = emptyFunc;
    wlog = emptyFunc;
    elog = emptyFunc;
    mlog = emptyFunc;
  } else  if (!__MYDEV__) {
    clog = emptyFuncWithDescr("clog");
    ilog = emptyFuncWithDescr("ilog");
    dlog = emptyFuncWithDescr("dlog");
    wlog = emptyFuncWithDescr("wlog");
    elog = emptyFuncWithDescr("elog");
    mlog = emptyFuncWithDescr("mlog");
  } else if (__DEV__ && consoleFilters && consoleFilters.length > 0) {
    const origLog = console.log;
    const origWarn = console.warn;
    const origInfo = console.info;
    const origGroup = console.group;
    const origGroupCollapsed = console.groupCollapsed;
    const origTime = console.time;
    const origTimeEnd = console.timeEnd;
    

    const funcLog = (type) => (...args) => {
      let isFiltered = applyConsoleFilters(args, consoleFilters);

      const hasTime = /\d{2}:\d{2}:\d{2}/.test(args[0]);
      const hasColor = (/%c/.test(args[0]));
      const isReduxAction = (/%c action/.test(args[0]));
      const isTimeCalc = type.includes('time');
      if (consoleShowTimeInLogs && !hasTime && !hasColor && !isTimeCalc) {
        const timeStr = `[${moment().format("HH:mm:ss.SSS")}]`;
        args.unshift(timeStr);
      }
      if (isReduxAction) {
        args.splice(1,10);
        args[0].replace('%c', '');
        return;
      }
    

      if (isFiltered) {
        switch (type) {
          case 'warn':
          case 'wlog':
            origWarn(...args);
            break;

          case 'info':
          case 'wlog':
            origInfo(...args);
            break;

          case 'time':
            origTime(...args);
            break;

          case 'timeEnd':
            origTimeEnd(...args);
            break;
        
          default:
            origLog(...args);
            break;
        }
      }
    }
    console.log = funcLog('log');
    console.info = funcLog('info');
    console.error = funcLog('error');
    console.warn = funcLog('warn');
    console.group = funcLog('group')
    console.groupCollapsed = funcLog('groupCollapsed')
    console.groupEnd = (emptyFunc);
    console.time = funcLog('time');
    console.timeEnd = funcLog('timeEnd');
    tslog = funcLog('time');
    telog = funcLog('timeEnd');
    ilog = funcLog('ilog');
    clog = funcLog('clog');
    wlog = funcLog('wlog');
  }

  // in both release & debug/dev
  // Check if reactotron enabled - make safe calls
  if (!console.tron) {
    let func;
    console.tron = {};

    if (__DEV__) {
      if (warnOnReactotronDisabledCalls) {
      func = (method) => console.warn(
        '[debug-tools] Reactotron is disabled, but still calling it as '+
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
      log: (...args) => func("log", ...args),
      logImportant: (...args) => func("logImportant", ...args),
      debug: (...args) => func("debug", ...args),
      display: (...args) => func("display", ...args),
      clear: (...args) => func("clear", ...args),
      error: (...args) => func("error", ...args),
      warn: (...args) => func("clear", ...args),
      mylog: (...args) => func("mylog", ...args),
      mylogd: (...args) => func("mylogd", ...args)
    };
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
    wlog('[debug-tools] console.time is not available - disabling console.time(End) and console.group(End|Collapsed) families of calls');
  } else if (!consoleTimeCalculations || !__MYDEV__) {
    console.time = emptyFunc;
    console.timeEnd = emptyFunc;
    tslog = emptyFunc;
    telog = emptyFunc;
    if (__MYDEV__ !== undefined && console.warn != null) {
      console.warn(`[debug-tools] Disabling console.time(End) calls - see values of 'consoleTimeCalculations' or '__MYDEV__'`);
    }
  }
}

export function evalFilterConfig(filter) {
  // prettier-ignore
  const asArr = filter.split(/[:=]/);
  const isMode = (asArr[0].trim() == 'mode');
  const value = asArr[1].trim();

  if (isMode) {
    switch (value) {
      case 'or':    
      case 'and':
        return value;
    
      default:
        if (value.toLowerCase() != 'lim') {
          throw new Error(`[debug-tools] evalFilterConfig() - unexpected mode value - "${value}"`);
        }
        return {
          lOFM: value[0] == 'L',
          iNM: value[1] == 'I',
          m: value[2] == 'm' ? 'or' : 'and'
        }
    }
  }
  
  return eval(value);
}

function applyConsoleFiltersFunc(consoleArgs, filtersOrig) {
  let result = true;
  let filters = filtersOrig.concat(); // work with a copy

  let isMatching = false;
  let { includeNonMatching, leaveOnFirstMatch, mode } = filtersConfig;
  let results = [];
  
  let filter;
  for (filter of filters) {
    if (!filter) { // happens if forgotten a comma at the end or empty string etc.
      continue;
    }
    let isRegEx = (filter instanceof RegExp);
    let isType = false;
    let isExclusive = false;
    let includeInLog = false;

    if (!isRegEx) {
      // overriding config
      if (filter.includes('includeNonMatching')) {
        includeNonMatching = evalFilterConfig(filter);
        continue;
      }
      if (filter.includes('leaveOnFirstMatch')) {
        leaveOnFirstMatch = evalFilterConfig(filter);
        continue;
      }
      if (filter.includes('mode')) {
        const res = evalFilterConfig(filter);
        if (isObject(res)) {
          const { m, lOFM, iNM } = res;
          leaveOnFirstMatch = lOFM;
          includeNonMatching = iNM;
          mode = m;
        } else {
          mode = res;
        }
        continue;
      }

      // exclusive filter
      if (filter.charAt(0) == '!') {
        isExclusive = true;
        includeInLog = true;
        filter = filter.substr(1);
      }

      isType = (filter.charAt(0) == '(');
    }

    let argIndex = 0;
    for (let arg of consoleArgs) {
      if (isType) {
        filter = filter.replace(/[\(\)]/g,"");
        isMatching = (typeof(arg) == filter);
        if (isMatching) {
          if (isExclusive) {
            if (consoleArgs.length > 1) {
              consoleArgs.splice(argIndex, 1)
              isMatching = false;
            } else {
              includeInLog = false;
              break;
            }
          } else {
            includeInLog = true;
            break;
          }
        }
      } else if (isString(arg)) {
        if (isRegEx) {
          isMatching = filter.test(arg);
          if (isMatching) {
            includeInLog = true;
            break;
          }
        } else {
          if (isExclusive) {
            isMatching = arg.includes(filter);
            if (isMatching) {
              includeInLog = false;
              break;
            }
          } else {
            isMatching = arg.includes(filter);
            if (isMatching) {
              includeInLog = true;
              break;
            }
          }
        }
      }
      argIndex++;
    }

    if (isMatching) results.push(includeInLog);

    if (isMatching && leaveOnFirstMatch) {
      result = includeInLog;
      break;
    }
  }

  if (leaveOnFirstMatch) {
    result = (isMatching ? result : includeNonMatching);
  } else if (mode == 'and') {
    results.forEach(item => result = result && item);
  } else {
    results.forEach(item => result = result || item);
  }

  return result;
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
      require('../../reactotronLogging')
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


function processErrorFunc(description, errorData, errorCode = null) {
  if (!__DEV__) {

    console.warn(description);

  } else {

    switch (errorLevel) {
      case 0:
        if (serverExpandErrors) {
          console.warn.apply(null, [description, ...Object.values(errorData), `, code ${errorCode}`]);
        } else {
          console.warn(`${description}, error code ${errorCode}`, errorData);
        }
        break;

      case 1:
        console.error(description, errorData, errorCode);
        break;

      case 2:
        if (console.tron && console.tron.error) {
          //TODO: Try this - not tested!!!
          console.tron.error(description, errorData);
        }
        break;

      default:      
        console.error(description, errorData, errorCode);

        if (errorData.error) {
          throw errorData.error;
        } else {
        throw new Error(description);
    }
    }

  }
}

/**
 * Print object in console log having in mind moment
 */
function mlogFunc(momentObj, title=`Moment is`, format=`YYYY-MM-DD HH:mm:ss.SSS [GMT]ZZ [T] ddd,MMM`) {
  if (momentObj == null) momentObj = {format:()=>'moment is null'};
  console.log(`[mlog] ${title} ${momentObj.format(format)}`)
}
function dlogFunc(objOrTitle, titleOrObject=null, isInternal=false, indent=' ') {
  // reverse params if needed
  if (isObject(titleOrObject) && isString(objOrTitle)) {
    let tmp = titleOrObject;
    titleOrObject = objOrTitle;
    objOrTitle = tmp;
  }

  let result = "";
  let isFirst = true;

  for (let i in objOrTitle) {
    let item = objOrTitle[i];

    if (isMoment(item)) {
      result += indent + `${i}: ${item.format('YYYY-MM-DD HH:mm:ss.SSS GMTZ, ddd, MMM')} (moment)\n`;
    } else if (isObject(item)) {
      result += indent + `${i}: {\n  ${dlog(item,i,true,indent)}${indent}}\n`;
    } else {
      result += indent + `${i}: ${item} (${typeof(item)})\n`;
    }
    if (isFirst) {
      if (isInternal) indent += "  ";
      isFirst = false;
    }
  }

  if (!isObject(objOrTitle)) result = `${objOrTitle}`;

  if (!isInternal) {
    result = `[dlog]${titleOrObject ? " " + titleOrObject : ""}:\n${result}`;
  }
  if (!isInternal) {
    console.log(result);
  } else {
    return result;
  }
}

function rlogdFunc(tag, description, data, isImportant = false) {
  // if testing in jest etc.
  if (__MYDEV__ == undefined || __TEST__) {
    console.log("[rlog]", tag, description, data);
    return;
  }

  if (__DEV__) {
    rlog("dev-debug", `[${tag}] ` + description, data, isImportant);
  }
}


function rlogFunc(tag, description, data, isImportant = false) {
  // if testing in jest etc.
  if (__MYDEV__ == undefined || __TEST__) {
    return;
  }

  let params = {};
  let doParsing = true;
  
  if (typeof tag == "object") {
    if (!tag.name && !tag.preview) {
      const isArray = tag.length != null;
      params.important = true;
      params.name = isArray ? `array: ${tag.length}` : "object";
      if (isArray) {
        params.value = {Array:tag, length: tag.length};
      } else {
        let keys = "";
        for (let prop in tag) keys += `${prop}, `;
        keys = keys.substr(0, keys.length - 2);
        params.preview = `Object keys: ${keys.substr(0, 90)} ...`;
        params.value = {Object:tag, keys};
      }
    } else {
      params = tag;
    }
    doParsing = false;
  } else if (tag.length >= 25 || (tag && !description)) {
    params.name = "LOG";
    params.preview = tag;
    doParsing = false;
  } 
  if (typeof description == "object") {
    const obj = description;
    params.value = obj;
    description = obj.length != null ? `array: ${obj.length}` : "object";
  }

  if (doParsing) {
    if (tag)          params.name       = tag;
    if (description)  params.preview    = description;
    if (data)         params.value      = data;
    if (isImportant)  params.important  = true;
  }

  if (params["value"] == null) {
    params["value"] = {};
  }

  params.value["_preview"] = params.preview;
  
  // types parsing
  if (params.value && showTypesInReactotronLog && (__DEV__ && __MYDEV__)) {
    let parseObjTypes;

    parseObjTypes = function(o) {
      let result = {};
      for (let prop in o) {
        let item = o[prop];
        let className = getObjectClassName(result);
        if (isObject(item)) {
          if (isSymbol(item, className) || prop[0] == "_") {
            result[`${prop}:${className}`] = `[instance of ${className}]`;
          } else {
            lodash.merge(result,{[`${prop}:${className}`]:parseObjTypes(item)});
          }
        } else {
          try {
            result[prop] = `${item} (${className})`;
          } catch (error) {
            processError(`[debug-tools::rlog::parseObjTypes] Error while setting result['${prop}']: ${error.message}`,{error,item,result})
          }
        }
      }

      return result;
    };
    params.value._valueWithTypes = parseObjTypes(params.value);
  }

  console.tron.display(params);
}


function configureDebug() {
  configureReactotron();
  configureConsole();
  
  // axios debug
  // const requester = require("../../../initDependencies");
  //try { require('locktrip-svc-layer').setServiceDebug(false); } catch (error) {console.error('Error while setting debug to axios-requester',{error})}
}

export function testFlowExec(type, extraConfig={}) {
  try {
    testFlowExecSafe(type, extraConfig);
  } catch (error) {
    logError(`${type}] [testFlowExec()`, null, error, `- could not execute test-flow`);
  }
}
function testFlowExecSafe(type, extraConfig={}) {
  if (type == null) {
    type = testFlow;
  }
  const requester = require("../../../initDependencies").default;
  const reduxStore = require("../../../redux/store").default;
  const navigationService = require('../../../services/navigationService').default;
  const serverRequest = require('../../../services/utilities/serverUtils').serverRequest;

  let lib, flow, jsonData, getParams;

  try {
    lib = require("test-flows");
    lib = lib.default;
    setImmediate(() => lib.setConfig({ getObjectClassName, serverRequest, requester, navigationService, reduxStore, getParams, ...extraConfig }));
  } catch (error) { wlog('[debug] Could not get test-flows lib')}

  try {
      // prettier-ignore
    switch (type) {

      case 'hotelDetails':
        getParams = (flow) => function (name) {
          switch (name) {
            case 'redux-action-type':     return "SET_SEARCH_STRING";
            case 'redux-action-payload':  return "?region=1937&currency=EUR&startDate=27/09/2019&endDate=28/09/2019&rooms=%5B%7B%22adults%22:1,%22children%22:%5B%5D%7D%5D&nat=-1";
            case 'redux1':                return "hotels.searchString";
            case 'nav-params':            return require('../../debug/test-flows/data/hotelDetails.json');
            case 'nav-screen':            return 'HotelDetails';
            default:                      return ["none"];
          }
        }

        lib.flows
          .sampleFlow([6,9,11,12])
          .exec()
        break;

      case 'guestInfo':
        getParams = (flow) => function (name) {
          switch (name) {
            case 'hotels-search':       return ["?region=1937&currency=EUR&startDate=27/09/2019&endDate=28/09/2019&rooms=%5B%7B%22adults%22:1,%22children%22:%5B%5D%7D%5D&nat=-1" +
                                                `&uuid=${flow.read('uuid')}amp;97892170124`];
            case 'nav-params':          return require('../../debug/test-flows/data/guest-info-3a-4ch.json');
            case 'redux1':              return ['userInterface.datesAndGuestsData.roomsData'];
            case 'redux-exec-payload':
              let roomsData = [
                {adults: 2, children: [2,3,8]},
                {adults: 1, children: [0]},
                {adults: 1, children: [8,17]}
              ];
              return [{roomsData, rooms: 3}];
            case 'nav-screen':            return 'GuestInfoForm';
            case 'redux2':                return ['userInterface.walletData'];
            case 'redux-action-type':     return 'SET_WALLET_DATA';
            case 'redux-action-payload':  return {reduxTest: 'hello there I am redux test in a test-flow'};
          }
        }

        lib.flows
          .sampleFlow()
          .exec();
        break;

      case 'terms':
        getParams = (flow) => function (name) {
          switch (name) {
            case 'nav-params':   return require('../../debug/test-flows/data/terms.json');
            case 'nav-screen':   return 'Terms';
          }
        }

        setTimeout(() =>
          lib.flows
            .sampleFlow([11,12])
            .exec(),
            500
        );
        break;

      case 'editProfile':
        let screens = ['EditUserProfile']
        getParams = (flow) => function (name) {
          switch (name) {
            case 'nav-params':   return {};
            case 'nav-screen':   return screens.shift();
          }
        }

        const nav = [11,12];
        const delays = [9,10,9,10,9,10];
        // const items = nav.concat(delays, nav);
        const items = nav;
        setTimeout(() =>
          lib.flows
            .sampleFlow(items)
            .exec(),
            500
        );
        break;
    
      default:
        // data
        const data = {
          url: testFlowURL,
          screen: "WebviewScreen"
        }
        data.navParams = () => ({simpleParams: {url: testFlowURL}});

        if (isString(testFlow)) {
          flow = lib.flows;
          testFlow
            .split(".")
            .forEach(item => (flow = flow[item]));
          if (typeof(flow) == 'function') {
            flow = flow(data);
          }        
        } else {
          flow = testFlow(data);
        }
        
        if (flow != null && flow.exec != null) {
          setTimeout(flow.exec, 500);
        }
        break;
    }
  } catch (error) {
    wlog('                                                                                                              ');
    wlog('                                                                                                              ');
    wlog(`[Error] [debug-tools::testFlowExec] Couldn't execute flow '${type}'`, {error,lib})
    wlog('                                                                                                              ');
    wlog('                                                                                                              ');
  }
}



//      -----------------                                  ----------------------
//      -----------------              Exports             ----------------------
//      -----------------                                  ----------------------



/**
 * Print moment object in a formated way
 */
export function mlog(...args) { mlogFunc(...args) }
/**
 * Log an object when debugging
 * @param {Object|String} objOrTitle String or Object
 * @param {String|Object} titleOrObject Default is null
 * @param {Boolean} isInternal Default is false
 * @param {String} indent Default is double space ("  ")
 */
export function dlog(...args) { dlogFunc(...args) }
/**
 * console function wrappers
 */
export function clog(...all) {addTime(all); console.log(...all)};
export function ilog(...all) {addTime(all); console.info(...all)}
export function wlog(...all) {addTime(all); console.warn(...all)}
export function elog(...all) {addTime(all); console.error(...all)}
/**
 * console.time and console.timeEnd functions
 */
export function tslog(...args) { consoleTimeCalculations ? console.time(...args) : emptyFunc(...args) }
export function telog(...args) { consoleTimeCalculations ? console.timeEnd(...args) : emptyFunc(...args) }
/**
 * Reactotron logging - for temporary debug
 * @param {String} tag 
 * @param {String} description 
 * @param {any} data 
 * @param {Boolean} isImportant 
 */
export function rlogd(...args) { rlogdFunc(...args) }
/**
 * Reactotron custom logging using Reactotron.display
 * @param {String/Object} tag Tag as in ERROR, API, DEBUG etc. / Can be just an object to trace
 * @param {String/Object} description A short description or preview of data / Or just data to trace
 * @param {any} data Any object data that need to be visible
 * @param {Boolean} isImportant A highlight of tag (as in ERROR)
 */
export function rlog(tag, description, data, isImportant = false) { rlogFunc(tag, description, data, isImportant) }

/**
 * Exported only for testing
 * @param {Array} consoleArgs List of console arguments (as in console.log(...args))
 * @param {Array} filters Filters to apply
 */
export function applyConsoleFilters(...args) { return applyConsoleFiltersFunc(...args); }
/**
 * Logs or throws a captured error
 * @param {String} description Information about the error
 * @param {Object} errorData Not shown in release
 * @param {Number} errorCode Default is null (usually passed from serverUtils only)
 */
export function processError(...args) { processErrorFunc(...args) }

// apply settings
configureDebug();