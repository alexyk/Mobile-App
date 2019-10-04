import requesterOriginal from "../../initDependencies";
import DBG from "../../config-debug";
import { processError, ilog } from "../../utils/debug/debug-tools";
import { getObjectClassName, isString, gotoWebviewSimple } from "js-tools";

export const SERVER_ERROR = {
  LEVEL_3_IN_REQUEST:               "LEVEL_3_IN_REQUEST",
  LEVEL_3_FROM_SERVER:              "LEVEL_3_FROM_SERVER",
  LEVEL_3_GETTING_SERVER_ERROR:     "LEVEL_3_GETTING_SERVER_ERROR",
  LEVEL_3_BODY_ERROR:               "LEVEL_3_BODY_ERROR",
  LEVEL_3_BODY_AS_ERROR:            "LEVEL_3_BODY_AS_ERROR",
  LEVEL_3_GETTING_BODY_ERROR:       "LEVEL_3_GETTING_BODY_ERROR",
  LEVEL_3_HTML_RESULT_FROM_SERVER:  "LEVEL_3_HTML_RESULT_FROM_SERVER",
  LEVEL_2:                          "LEVEL_2",
  LEVEL_1_TIMEOUT:                  "LEVEL_1_TIMEOUT",
  LEVEL_1:                          "LEVEL_1",
  SUCCESS_CALLBACK:                 "SUCCESS_CALLBACK",
  ERROR_CALLBACK:                   "ERROR_CALLBACK",
  REQUESTER_CALL:                   "REQUESTER_CALL",
};

/**
 * Handles requester calls in expecting two functions that handle success and error cases
 * @param {Object} thisObject The calling object (where successFunction and errorFunction will be executed)
 * @param {Function} callFunction The requester call to perform
 * @param {Array} callParams Params to pass to callFunction
 * @param {Function} successFunction The function to call with the request data as parameter - wWhen response successfully received and is valid
 * @param {Function} errorFunction The function to call in any case of error - params (errorData, serverErrorCode) where serverErrorCode is one of SERVER_ERROR defined in serverUtils.js
 */
// prettier-ignore
export function serverRequest(
  thisObject,
  callFunction,
  callParams,
  successFunction,
  errorFunction = () => {}
) {
  let callerName;
  if (isString(thisObject)) {
    callerName = thisObject;
  } else {
    const callerMethodName = serverRequest.caller.name;
    const callerClassName = getObjectClassName(thisObject);
    callerName = `${callerClassName}::${callerMethodName}`;
  }

  const errorFunctionWrapped = function(thisObject, errorData, errorCode, message) {
    let hasError = false;
    try {
      if (DBG.serverLogRequesting) ilog(`[serverUtils] [${callerName}] Response-Error ${requestName}`, {callerName, requestName, callParams, errorData, errorCode, message});
      errorFunction.call(thisObject, errorData, errorCode);
    } 
    catch (error) {
      hasError = true;
      errorData = { errorDataOrig: errorData, error }
    }
    finally {
      if (hasError) {
        errorCode = SERVER_ERROR.ERROR_CALLBACK;
        processError(`[serverUtils] [${callerName}] Error processing request ${requestName} - thrown in error callback: ${errorData.error.message}`, errorData, errorCode);  
      } else {
        processError(`[serverUtils] [${callerName}] ${message}`, errorData, errorCode);
      }
    }
  }

  let errorData, errorCode;

  if (callFunction == null) {
    if (errorFunction) {
      errorData = { error: new Error(`[serverRequest][${callerName}] The call does not exist in requester`) };
      errorCode = SERVER_ERROR.REQUESTER_CALL;
      errorFunctionWrapped(thisObject, errorData, errorCode);
    }
    return;
  }

  let requestName = callFunction.name;

  // prettier-ignore
  if (DBG.serverLogRequesting) ilog(`[serverUtils] [${callerName}] Requesting ${requestName}`, {callerName, requestName, callParams});

  let serverCall = callFunction;
  let requester = requesterOriginal;

  if (__DEV__) {
    let requesterObject = require('../../initDependencies').refreshRequester();
    requester = requesterObject;
    serverCall = requester[callFunction.name];
  }

  serverCall
    .apply(requester, callParams)
    .then(function(res) {
      if (res && res.success && res.body instanceof Promise) {
        res.body
          .then(function(data) {
            try {
              if (DBG.serverLogRequesting) ilog(`[serverUtils] [${callerName}] Response ${requestName}`, {callerName, requestName, callParams, data});
              successFunction.call(thisObject, data);
            } catch (error) {
              errorData = { error };
              errorCode = SERVER_ERROR.SUCCESS_CALLBACK;
              errorFunctionWrapped(thisObject, errorData, errorCode,`Error processing request ${requestName} - error in success callback: ${error.message}`);
            }
          })
          .catch(function(error) {
            errorData = { error };
            errorCode = SERVER_ERROR.LEVEL_3_IN_REQUEST;
            errorFunctionWrapped(thisObject, errorData, errorCode, `Error when requesting ${requestName} from server - level 3 - in request: ${error.message}`);
          });
      } else {
        if (res.errors && res.errors instanceof Promise) {
          res.errors
            .then(function(error) {
              const { dataAsRawText, jsonError } = error;
              errorData = error;
              if (jsonError) {
                errorCode = SERVER_ERROR.LEVEL_3_HTML_RESULT_FROM_SERVER;
                gotoWebviewSimple({body: dataAsRawText});
                errorFunctionWrapped(thisObject, errorData, errorCode, `Error when requesting ${requestName} from server - level 2 - HTML data`);
              } else {      
                errorCode = SERVER_ERROR.LEVEL_3_FROM_SERVER;
                errorFunctionWrapped(thisObject, errorData, errorCode, `Error when requesting ${requestName} from server - level 3 - errors from server`);
              }
            })
            .catch(function(error) {
              errorData = { error };
              errorCode = SERVER_ERROR.LEVEL_3_GETTING_SERVER_ERROR;
              errorFunctionWrapped(thisObject, errorData, errorCode, `Error when requesting ${requestName} from server - level 3 - getting errors from server`);
            });
        } else if (res.body instanceof Promise) {
          if (res.body._55 instanceof Error) {
            errorData = { error:res.body._55 };
            errorCode = SERVER_ERROR.LEVEL_3_BODY_AS_ERROR;
            errorFunctionWrapped(thisObject, errorData, errorCode, `Error when requesting ${requestName} from server - level 3 - body error`);
          } else {
            res.body
              then(function(errors) {
                errorData = { errors };
                errorCode = SERVER_ERROR.LEVEL_3_BODY_ERROR;
                errorFunctionWrapped(thisObject, errorData, errorCode, `Error when requesting ${requestName} from server - level 3 - body error`);
              })
              .catch(function(error) {
                errorData = { errors };
                errorCode = SERVER_ERROR.LEVEL_3_GETTING_BODY_ERROR;
                errorFunctionWrapped(thisObject, errorData, errorCode, `Error when requesting ${requestName} from server - level 2 - getting body error`);
              });
          }
        } else {
          errorData = { res };
          errorCode = SERVER_ERROR.LEVEL_2;
          errorFunctionWrapped(thisObject, errorData, errorCode, `Error when requesting ${requestName} from server - level 2`);
        }
      }
    })
    .catch(function(error) {
      errorData = { error };
      if (error.message == "timeout") {
        errorCode = SERVER_ERROR.LEVEL_1_TIMEOUT;
        errorFunctionWrapped(thisObject, errorData, errorCode, `Error when requesting ${requestName} from server - level 1 - network timeout: ${error.message}`);        
      } else {
        errorCode = SERVER_ERROR.LEVEL_1;
        errorFunctionWrapped(thisObject, errorData, errorCode, `Error when requesting ${requestName} from server - level 1: ${error.message}`);
      }
    });
}
