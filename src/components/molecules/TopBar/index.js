import React, { Component } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import BackButton from '../../atoms/BackButton';
import PropTypes from 'prop-types';
import styles from './styles.js'


export default class TopBar extends Component {
  
  static propTypes = {
    onBackPress: PropTypes.func,
    backText: PropTypes.string,
    backStyle: PropTypes.object,

    onRightPress: PropTypes.func,
    rightText: PropTypes.string,
    rightStyle: PropTypes.object,

    extraItems: PropTypes.array
  }


  constructor(props) {
    super(props);
  }


  _renderBack(onPress, text, style) {
    const buttonStyle = StyleSheet.create({margin: 5,...style});
    return (
      <View style={styles.containerBack}>
        <BackButton onPress={onPress} style={buttonStyle} imageStyle={styles.backButtonImage} />
        <Text style={styles.text}>{text != null ? text : ''}</Text>
      </View>
    )
  }


  _renderAdditionalItems(items) {
    return ( 
      (items != null)
      &&  items.map( item => item)
    )
  }


  _renderRight(onPress, text, style) {
    return (
      (onPress != null && text)
      &&  <TouchableOpacity onPress={onPress} style={{ paddingRight: 10 }}>
              <Text style={styles.text}>{text != null ? text : ''}</Text>
          </TouchableOpacity>
    )
  }


  render() {
    const {
      onBackPress, backText, backStyle, 
      onRightPress, rightText, rightStyle,
      extraItems
    } = this.props;

    return (
      <View style={styles.container}>
        { this._renderBack(onBackPress, backText, backStyle)      }
        { this._renderAdditionalItems(extraItems)                 }
        { this._renderRight(onRightPress, rightText, rightStyle)  }
      </View>
    )
  }

}