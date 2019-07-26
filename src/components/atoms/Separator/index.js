import React, { Component } from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';


export default class Separator extends Component {
  static propTypes = {
    height: PropTypes.number.isRequired,
    extraStyle: PropTypes.object,
    isHR: PropTypes.bool
  }
  static defaultProps = {
    extraStyle: {}
}

  render() {
    const { height, extraStyle, isHR } = this.props;
    const horizontalRuleStyle = (isHR ? {backgroundColor: '#000'} : {})

    return (
      <View style={{width: "100%", height, ...horizontalRuleStyle, ...extraStyle}} />
    )
  }
}