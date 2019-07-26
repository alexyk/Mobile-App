// import Reactotron, {openInEditor,trackGlobalErrors} from 'reactotron-react-native'
import {Platform} from 'react-native'
import { rlog,rlogd } from '../config-debug'

const r = require('reactotron-react-native')
const Reactotron = r.default;
const {openInEditor,trackGlobalErrors} = r;

Reactotron
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
  .use(openInEditor())
  .use(trackGlobalErrors())
  .connect()
  .clear();

  console.tron = Reactotron;
  console.tron.mylog = rlog;
  console.tron.mylogd = rlogd;