import { gotoWebviewSimple } from "../../../../components/screens/utils";
import DBG from "../../../../config-debug";
import { rlog } from "../../../../utils/debug/debug-tools";

export default function webviewHTML() {
  fetch(DBG.testFlowURL)
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
