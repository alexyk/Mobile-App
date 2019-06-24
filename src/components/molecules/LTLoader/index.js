import React, {PureComponent} from "react"
import { View, Text } from 'react-native'
import Image from "react-native-remote-svg";
import {commonText} from '../../../common.styles'
import { BarIndicator } from "react-native-indicators";
import PropTypes from 'prop-types';


export default class LTLoader extends PureComponent {
  static propTypes = {
    isLockTripIcon: PropTypes.bool,
    isLoading: PropTypes.bool,
    message: PropTypes.string,
    opacity: PropTypes.string,
    style: PropTypes.object,
  };

  static defaultProps = {
    isLoading: true,
    isLockTripIcon: false,
    message: null,
    opacity: null,
    style: null,
  }

  constructor(props) {
    super(props);
  }

  renderMessage() {
    const {message} = this.props;
    if (message) {
      return (
        <Text style={{...commonText, position:'absolute', top:"60%", width:"100%", textAlign:'center', fontSize:19}}>
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
          { this.renderAnimation() }
	        { this.renderMessage() }
        </View>
      );
    } else {
      return null;
    }
  }

  renderAnimation() {
    const { isLockTripIcon } = this.props;

    if (isLockTripIcon) {
      return (
        <Image
          style={{ width: 35, height: 35 }}
          source={require("../../../assets/loader.gif")}
        />
      )
    } else {
      return (
        <BarIndicator
          color="#d97b61"
          count={3}
          size={50}
          animationDuration={2107}
        />
      )
    }
  }
}
