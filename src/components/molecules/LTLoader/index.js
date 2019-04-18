import React, {PureComponent} from "react"
import { View } from 'react-native'
import Image from "react-native-remote-svg";

export default class LTLoader extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
      const style = (
        this.props.style
          ? {
              display: (this.props.isLoading ? "flex" : 'none'),
              ...this.props.style
            }
          : {
            position:'absolute', width: "100%", height: "100%",
            justifyContent: 'center', alignItems: 'center',
            display: (this.props.isLoading ? "flex" : 'none'),
            backgroundColor: '#FFFA'
          }
      )
      
      return (
        <View style={style}>
          <Image
            style={{ width: 50, height: 50 }}
            source={require("../../../assets/loader.gif")}
          />
        </View>
      );
  }
}