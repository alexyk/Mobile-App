import React, {PureComponent} from "react"
import { View, Text } from 'react-native'
import Image from "react-native-remote-svg";
import {commonText} from '../../../common.styles'
import { BarIndicator } from "react-native-indicators";
import { getFontSize } from "../../../utils/designUtils";
export default class LTLoader extends PureComponent {
  constructor(props) {
    super(props);
  }

  renderMessage() {
    const {message} = this.props;
    if (message) {
      return (
        <Text style={{...commonText, position:'absolute', top:"60%", width:"100%", textAlign:'center', fontSize: getFontSize(19)}}>
          {message}
        </Text>
      )
    } else {
      return null;
    }
  }

  render() {
    if (this.props.isLoading) {
      const opacity = (this.props.opacity != null ? this.props.opacity : 'F8')
      const defaultStyle = {
        position:'absolute',
        width: "100%",
        height: "100%",
        
        flexDirection: 'column',
        justifyContent: 'space-between', 
        alignItems: 'center',
        
        display: (this.props.isLoading ? "flex" : 'none'),
        
        backgroundColor: `#FFFFFF${opacity}`
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
          { this.renderAnimation(true) }
	        { this.renderMessage() }
        </View>
      );
    } else {
      return null;
    }
  }

  renderAnimation(isIndicator) {
    if (isIndicator) {
      return (
        <BarIndicator
          color="#d97b61"
          count={3}
          size={50}
          animationDuration={2107}
        />
      )
    } else {
      return (
        <Image
          style={{ width: 50, height: 50 }}
          source={require("../../../assets/loader.gif")}
        />
      )
    }
  }
}
