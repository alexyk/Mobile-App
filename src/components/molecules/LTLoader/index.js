import React, {PureComponent} from "react"
import Image from "react-native-remote-svg";

export default class LTLoader extends PureComponent {
  render() {
      return (
        <Image
          style={{ width: 50, height: 50 }}
          source={require("../../../assets/loader.gif")}
        />
      );
  }
}