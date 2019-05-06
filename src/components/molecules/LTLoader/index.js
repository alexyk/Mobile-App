import React, {PureComponent} from "react"
import { View, Text } from 'react-native'
import Image from "react-native-remote-svg";
import {commonText} from '../../../common.styles'

export default class LTLoader extends PureComponent {
  constructor(props) {
    super(props);
  }

  renderMessage() {
    const {message} = this.props;
    if (message) {
      return (
        <Text style={{...commonText, position:'absolute', top:"70%", width:"100%", textAlign:'center', fontSize:19}}>
          {message}
        </Text>
      )
    } else {
      return null;
    }
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
        
        backgroundColor: '#FFFFFFF8'
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
	  { this.renderMessage() }
        </View>
      );
    } else {
      return null;
    }
  }
}
