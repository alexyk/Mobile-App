import requester from "../../initDependencies";
import { processError, ilog, clog, serverLogRequesting } from "../../config-debug";
import { getObjectClassName, isString } from "../../components/screens/utils";

export const SERVER_ERROR = {
  LEVEL_3_DATA_PROCESSING:          "LEVEL_3_DATA_PROCESSING",
  LEVEL_3_IN_REQUEST:               "LEVEL_3_IN_REQUEST",
  LEVEL_3_FROM_SERVER:              "LEVEL_3_FROM_SERVER",
  LEVEL_3_GETTING_SERVER_ERROR:     "LEVEL_3_GETTING_SERVER_ERROR",
  LEVEL_3_BODY_ERROR:               "LEVEL_3_BODY_ERROR",
  LEVEL_3_BODY_AS_ERROR:            "LEVEL_3_BODY_AS_ERROR",
  LEVEL_3_GETTING_BODY_ERROR:       "LEVEL_3_GETTING_BODY_ERROR",
  LEVEL_2:                          "LEVEL_2",
  LEVEL_3_HTML_RESULT_FROM_SERVER:  "LEVEL_3_HTML_RESULT_FROM_SERVER",
  LEVEL_1:                          "LEVEL_1"
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

  if (callFunction == null) {
    if (errorFunction) {
      errorFunction.call(thisObject, new Error(`[serverRequest][${callerName}] The call does not exist in requester`));
    }
    return;
  }

  let requestName = callFunction.name;  
  let errorData, errorCode;

  // prettier-ignore
  if (serverLogRequesting) ilog(`[serverUtils] [${callerName}] Requesting ${requestName}`, {callerName, requestName, callParams});

  callFunction
    .apply(requester, callParams)
    .then(function(res) {
      if (res && res.success && res.body instanceof Promise) {
        res.body
          .then(function(data) {
            try {
              successFunction.call(thisObject, data);
            } catch (error) {
              errorData = { error };
              errorCode = SERVER_ERROR.LEVEL_3_DATA_PROCESSING;
              errorFunction.call(thisObject, errorData, errorCode);
              processError(`[serverUtils] [${callerName}] Error when requesting ${requestName} from server - level 3, data processing: ${error.message}`, errorData, errorCode);
            }
          })
          .catch(function(error) {
            errorData = { error };
            errorCode = SERVER_ERROR.LEVEL_3_IN_REQUEST;
            errorFunction.call(thisObject, errorData, errorCode);
            processError(`[serverUtils] [${callerName}] Error when requesting ${requestName} from server - level 3 - in request: ${error.message}`, errorData, errorCode);
          });
      } else {
        if (res.errors && res.errors instanceof Promise) {
          res.errors
            .then(function(error) {
              errorData = error;
              if (error.jsonError) {
                errorCode = SERVER_ERROR.LEVEL_3_HTML_RESULT_FROM_SERVER;
                errorFunction.call(thisObject, errorData, errorCode);
                processError(`[serverUtils] [${callerName}] Error when requesting ${requestName} from server - level 2 - HTML data`, errorData, errorCode);
              } else {      
                errorCode = SERVER_ERROR.LEVEL_3_FROM_SERVER;
                errorFunction.call(thisObject, errorData, errorCode);
                processError(`[serverUtils] [${callerName}] Error when requesting ${requestName} from server - level 3 - errors from server`, errorData, errorCode);
              }
            })
            .catch(function(error) {
              errorData = { error };
              errorCode = SERVER_ERROR.LEVEL_3_GETTING_SERVER_ERROR;
              errorFunction.call(thisObject, errorData, errorCode);
              processError(`[serverUtils] [${callerName}] Error when requesting ${requestName} from server - level 3 - getting errors from server`, errorData, errorCode);
            });
        } else if (res.body instanceof Promise) {
          if (res.body._55 instanceof Error) {
            errorData = { error:res.body._55 };
            errorCode = SERVER_ERROR.LEVEL_3_BODY_AS_ERROR;
            errorFunction.call(thisObject, errorData, errorCode);
            processError(`[serverUtils] [${callerName}] Error when requesting ${requestName} from server - level 3 - body error`, errorData, errorCode);
          } else {
            res.body
              then(function(errors) {
                errorData = { errors };
                errorCode = SERVER_ERROR.LEVEL_3_BODY_ERROR;
                errorFunction.call(thisObject, errorData, errorCode);
                processError(`[serverUtils] [${callerName}] Error when requesting ${requestName} from server - level 3 - body error`, errorData, errorCode);
              })
              .catch(function(error) {
                errorData = { errors };
                errorCode = SERVER_ERROR.LEVEL_3_GETTING_BODY_ERROR;
                errorFunction.call(thisObject, errorData, errorCode);
                processError(`[serverUtils] [${callerName}] Error when requesting ${requestName} from server - level 2 - getting body error`, errorData, errorCode);
              });
          }
        } else {
          errorData = { res };
          errorCode = SERVER_ERROR.LEVEL_2;
          errorFunction.call(thisObject, errorData, errorCode);
          processError(`[serverUtils] [${callerName}] Error when requesting ${requestName} from server - level 2`, errorData, errorCode);
        }
      }
    }, function(...args) {
      clog('[serverRequest] reject',args)
    })
    .catch(function(error) {
      errorData = { error };
      errorCode = SERVER_ERROR.LEVEL_1;
      errorFunction.call(thisObject, errorData, errorCode);
      processError(`[serverUtils] [${callerName}] Error when requesting ${requestName} from server - level 1: ${error.message}`, errorData, errorCode);
    });
}
