import React from 'react';
import { View,   ActivityIndicator }  from 'react-native';


export default function LTSmallLoader(props) {
  let { color, size, style } = props;
  if (size == null) {
    size = 'small';
  }
  if (color == null) {
    color = '#FA9';
  }

  return (
    <View style={style}>
      <ActivityIndicator size={size} color={color} />
    </View>
  )
}



