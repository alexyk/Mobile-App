import { gotoWebviewSimple } from "../../../../components/screens/utils";
import { testFlowURL, rlog } from "../../../../config-debug";

// prettier-ignore
export default function webviewHTML() {
  fetch(testFlowURL)
    .then(response => {
      response
        .text()
        .then(data => {
          gotoWebviewSimple({ body: data });
        });
    })
    .catch(error => {
      rlog("ERROR", `Getting recaptcha test ${error.message}`, { error });
    });
}
