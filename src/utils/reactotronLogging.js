import Reactotron, {openInEditor,trackGlobalErrors} from 'reactotron-react-native'

Reactotron
  .configure({
    name: "Locktrip - Mobile App",
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