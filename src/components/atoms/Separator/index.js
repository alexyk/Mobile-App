import React, { Component } from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';


export default class Separator extends Component {
  static propTypes = {
    height: PropTypes.number.isRequired,
    extraStyle: PropTypes.object
  }
  static defaultProps = {
    extraStyle: {}
}

  render() {
    const { height, extraStyle } = this.props;

    return (
      <View style={{width: "100%", height, ...extraStyle}} />
    )
  }
}