import React, { Component } from 'react';
import { View } from 'react-native';

var customDefaultProps;

class InvisibleComponent extends Component {
  render() {
    if (customDefaultProps != null) {
      return <View {...customDefaultProps} />
    } else {
      return null;
    }
  }
}

export default (props) => {
  customDefaultProps = props;
  return InvisibleComponent;
}