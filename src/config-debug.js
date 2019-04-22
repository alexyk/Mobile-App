
  // features
export const reactotronLoggingInReleaseForceEnabled  = false;
export const reactotronReduxLoggingEnabled           = false;
export const reduxConsoleLoggingEnabled              = true;
export const raiseConverterExceptions                = false;
export const logConverterError                       = false;
export const logConverterErrorToReactrotron          = false;
  // options
export const reduxConsoleCollapsedLogging            = true;

  // other
// Offline mode
// Enabled if: (__DEV__ == true) and (isOffline == true)
                                      let isOffline  = false;
if (!__DEV__) isOffline = false;
export const isOnline = (!isOffline);
export const autoHotelSearch                         = true;


// code
export function configureDebug() {
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
    } else {
      func = ()=>{}
    }
    console.tron = {
        ...console.tron,
        log: () => func('log'),
        logImportant: () => func('logImportant'),
        debug: () => func('debug'),
        display: () => func('display'),
        clear: () => func('clear'),
        error: () => func('clear'),
        warn: () => func('clear'),
    }
  }  
}