// enable features
export const reactotronLoggingInReleaseForceEnabled  = false;
export const reactotronReduxLoggingEnabled           = false;
export const reduxConsoleLoggingEnabled              = false;
export const raiseConverterExceptions                = false;
export const logConverterError                       = false;
export const logConverterErrorToReactrotron          = false;
// options
export const reduxConsoleCollapsedLogging            = true;


// code
export function configureDebug() {
  // if in dev mode or forceReactotronLogging
  if (__DEV__ || forceReactotronLoggingInRelease) {
    // Reactotron config
    try {
      require('./utils/reactotronLogging') //.then(() => console.log('Reactotron connected'));
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