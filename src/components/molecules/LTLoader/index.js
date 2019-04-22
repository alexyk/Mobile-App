import React, {PureComponent} from "react"
import { View } from 'react-native'
import Image from "react-native-remote-svg";

export default class LTLoader extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    if (this.props.isLoading) {
      const defaultStyle = {
        position:'absolute',
        width: "100%",
        height: "100%",
        
        justifyContent: 'center', 
        alignItems: 'center',
        
        display: (this.props.isLoading ? "flex" : 'none'),
        
        backgroundColor: '#FFFD'
      }

      const style = (
        this.props.style
          ? {
              ...defaultStyle,
              ...this.props.style
            }
          : defaultStyle
      )
      
      return (
        <View style={style}>
          <Image
            style={{ width: 50, height: 50 }}
            source={require("../../../assets/loader.gif")}
          />
        </View>
      );
    } else {
      return null;
    }
  }
}