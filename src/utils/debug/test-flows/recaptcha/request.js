import { serverRequest } from "../../../../services/utilities/serverUtils";
import requester from "../../../../initDependencies";
import { rlog } from "../../../../utils/debug/debug-tools";


const tester = {
  constructor: { name: 'RecaptchaTester' },
  onSuccess: (data) => {
    rlog('TESTER-SUCCESS', `Data received on success`, {data})
  },
  onFail: (errorData, errorCode) => {
    rlog('TESTER-fail', `Data received on error`, {errorData, errorCode})
  },
}

// prettier-ignore
export default function request() {
  serverRequest(
    tester,
    requester.mobileLogin,
    [{ hello: "there", email: "nobody@else.net" }],
    tester.onSuccess,
    tester.onFail
  );
}

 