import Reactotron, {openInEditor,trackGlobalErrors} from 'reactotron-react-native'
import { reactotronRedux as reduxPlugin } from 'reactotron-redux'
import {Platform} from 'react-native'

// const r = require('reactotron-react-native')
// const Reactotron = r.default;
// const {openInEditor,trackGlobalErrors} = r;

let r = Reactotron
  .configure({
    name: `Locktrip - Mobile App (${(Platform.OS == 'android' ? 'Android' : 'iOS')})`,
    host: "localhost"
  })
  .useReactNative({
    // asyncStorage: false, // there are more options to the async storage.
    // networking: { // optionally, you can turn it off with false.
    //   ignoreUrls: /symbolicate/
    // },
    // editor: false, // there are more options to editor
    // errors: { veto: (stackFrame) => false }, // or turn it off with false
    // overlay: false, // just turning off overlay
  })
  .use(reduxPlugin())
  .use(openInEditor())
  .use(trackGlobalErrors());

console.tron = Reactotron;
r.connect();
r.clear();
  
console.log(`--------- reactotron created ----------`, Reactotron, r)
export default r;