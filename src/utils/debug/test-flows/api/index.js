import { serverRequest } from "../../../../services/utilities/serverUtils";
import requester from "../../../../initDependencies";

function onSuccess(data) {

}

function onFail(errorData, errorCode) {

}

function testCall() {
  /**
   * caseNo extra values, except for defined in serverUtils.js
   *    0    reject promise at level 0
   *    1    resolve and then resolve again (no return)
   *    -1   forces throwing an error in then
   *    -2   forces throwing an error in catch (first throwing in then in order to go to catch)
   *    -3   forces throwing an error in catch (first throwing in then in order to go to catch)
   */
  const caseNo = 1;
  serverRequest(null, requester.testCall, [caseNo], onSuccess, onFail);
}

export default {
  testCall
};