import { gotoWebviewSimple } from "../../../../components/screens/utils";
import { testFlowURL } from "../../../../config-debug";

// prettier-ignore
export default function webview() { 
  gotoWebviewSimple({
    url: testFlowURL,
    message: `Loading webview test ...\n\nFor details - see testFlowURL\nin config-debug.js`,
    injectJS: `
      window.ReactNativeWebView.postMessage("Hello Inject!");
      true;
    `,
    injectedJS: `
                  window.document.addEventListener('click', function (event) {
                    console.log(event);
                    console.info(event.target);
                    window.ReactNativeWebView.postMessage("history++")
                  }, false);
                  window.ReactNativeWebView.postMessage("Hello Injected! (1 time)")
                  true;
              `
  });
}

