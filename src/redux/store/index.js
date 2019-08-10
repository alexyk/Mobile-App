import { createStore, applyMiddleware, compose } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';
import appReducers from '../reducers';
import { middleware } from '../../routing'
import { logger } from 'redux-logger'
import {
    reduxConsoleLoggingEnabled, reduxConsoleCollapsedLogging, reduxReactotronLoggingEnabled,
    reactotron
} from '../../config-debug'

let middlewares = [thunk, middleware];
if (__DEV__ && reduxConsoleLoggingEnabled) {
    if (reduxConsoleCollapsedLogging) {
        const loggerCollapsed = require('redux-logger').createLogger({
            collapsed: (getState, action, logEntry) => true
        });                
        middlewares.push(loggerCollapsed)
    } else {
        middlewares.push(logger)
    }

}

const enchancer = composeWithDevTools({
    serialize: true,                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
    actionSanitizer: (action) => {
        if (typeof action.type === 'symbol') {
            const actionCopy = { ...action }; // Don't change the original action
            actionCopy.type = action.type.toString(); // DevTools doesn't work with Symbols
            return actionCopy;
        }
        return action;
    }
})(applyMiddleware(...middlewares));

let store;
// if (console.tron.createStore && reduxReactotronLoggingEnabled) {
if (reactotron.createEnchancer && reduxReactotronLoggingEnabled) {
//  store = console.tron.createStore(appReducers, compose(enchancer,console.tron.createEnhancer)); // eslint-disable-line
 store = createStore(appReducers, compose(enchancer, reactotron.createEnchancer)); // eslint-disable-line
} else {
 store = createStore(appReducers, enchancer); // eslint-disable-line
}

console.log(`--------- store created ----------`)
  
// if (module.hot) {
//     // Enable Webpack hot module replacement for reducers
//     const acceptCallback = () => {
//         const nextRootReducer = require('../reducers').default;
//         store.replaceReducer(nextRootReducer);
//     };
//     module.hot.accept('../reducers', acceptCallback);
//     module.hot.acceptCallback = acceptCallback;
// }

export default store;
