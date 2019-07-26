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

    this._preRenderBackButton(props); // optimise back button rendering
  }

  _preRenderBackButton(props) {
    const { onBackPress, backStyle } = props;
    this._backButtonRendered = <BackButton onPress={onBackPress} style={{margin: 5, ...backStyle}} imageStyle={styles.backButtonImage} />
  }


  _renderBack(text, style) {
    return (
      <View style={styles.containerBack}>
        { this._backButtonRendered }
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
      backText, 
      onRightPress, rightText, rightStyle,
      extraItems
    } = this.props;

    return (
      <View style={styles.container}>
        { this._renderBack(backText)      }
        { this._renderAdditionalItems(extraItems)                 }
        { this._renderRight(onRightPress, rightText, rightStyle)  }
      </View>
    )
  }

}