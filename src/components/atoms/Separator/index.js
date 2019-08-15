import React, { Component } from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';


export default class Separator extends Component {
  static propTypes = {
    height: PropTypes.number.isRequired,
    isHR: PropTypes.bool,
    margin: PropTypes.number,
    extraStyle: PropTypes.object
  }
  static defaultProps = {
    extraStyle: {}
}

  render() {
    let { height, extraStyle, isHR, margin } = this.props;
    let horizontalRuleStyle;

    if (isHR) {
      horizontalRuleStyle = {backgroundColor: '#CCC'};

      if (height == null) {
        height = 1;
      }

      if (margin != null) {
        horizontalRuleStyle = {
          ...horizontalRuleStyle,
          marginVertical: margin
        }
      }
    }

    return (
      <View style={{width: "100%", height, ...horizontalRuleStyle, ...extraStyle}} />
    )  
  }
}