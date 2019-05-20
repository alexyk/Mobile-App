
// FORCE modes - possible in RELEASE
// 
// ALL MUST BE FALSE!!!      (unless you know what you are doing)
export const reactotronLoggingInReleaseForceEnabled  = false;
export const forceOffline                            = false;
  // reactotron
export const reactotronReduxLoggingEnabled      = false;
export const logConverterErrorToReactrotron     = false;
  // console
export const reduxConsoleLoggingEnabled         = false;
export const reduxConsoleCollapsedLogging       = true;
export const raiseConverterExceptions           = false;
export const logConverterError                  = false;
export const consoleTimeCalculations            = false;
  // other
export const webviewDebugEnabled                = false;
export const hotelsSearchMapDebugEnabled        = false;
export const checkHotelsDataWithTemplates       = 'filter-parsed,socket-parsed'; // typeOfCheck:string or boolean (for all)
  // other
// Offline mode
// Enabled if: (__DEV__ == true) and (isOffline == true)
                                let isOffline   = false;
                    if (forceOffline) isOffline = forceOffline;
if (!__DEV__) isOffline = false;
export const isOnline = (!isOffline);
export const autoHotelSearch                    = false;
export const autoHotelSearchFocus               = false;
export const autoHotelSearchPlace               = 'london'
export const autoHomeSearch                     = true;
export const autoHomeSearchPlace                = 'uk1'


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

  console.tron.display(params)
}

export function configureDebug() {
  configureReactotron()
  configureConsole()
}