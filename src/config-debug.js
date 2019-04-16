const forceReactotronLogging = false;
const enableReduxLogging     = false;

// if in dev mode or forceReactotronLogging
if (__DEV__ || forceReactotronLogging) {
  // Reactotron config
  try {
    import('./utils/reactotronLogging').then(() => console.log('Reactotron connected'));
  } catch (e) {
    console.warn('Reactotron could not be enabled');
  }

}

// in both release & debug/dev
  // Check if reactotron enabled - make safe calls
if (!console.tron) {
  let func = (method) => console.warn(
      '[config-debug] Reactotron is disabled, but still calling it as '+
      `console.tron.${method}`
  )
  console.tron = {
      log: () => func('log'),
      debug: () => func('debug'),
      display: () => func('display')
  }
}

export default {
  forceReactotronLogging,
  enableReduxLogging
}