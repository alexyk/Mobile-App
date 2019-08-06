import React from 'react';
import { Text } from 'react-native';

import FontAwesome, { Icons } from 'react-native-fontawesome';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import SimpleIcon from 'react-native-vector-icons/SimpleLineIcons';


export default function LTIcon(props) {
  let { name, style, size, textStyle, color, iconSet, key, isText } = props;
  let isAsText = false;

  /**
   * Inside a <Text> component tag - case 1, when <Text> is in the parent component
   * (where LTIcon is imported) and it is among characters (Example: <Text>USD - <LTIcon isText name={'usd'} /> </Text>)
   */
  if (isText) {
    return <FontAwesome>{Icons[name]}</FontAwesome>
  }


  if (size == null) {
    size = 24;
  }
  if (textStyle != null) {
    isAsText = true;
  }

  let renderedResult = null;
  let renderedIcon = null;

  if (name == null) {
    return null;
  }
  

  /**
   * Inside a <Text> component tag - case 2, when <Text> is created here
   */
  if (isAsText) {
    //TODO: Fix icon as text
    // Example Usage: SearchBar
    if (!Icons[name]) {
      console.warn(`[LTIcon] Icon '${name}' as text not found`, props);
    }
    
    renderedResult = (
      // <Text style={[textStyle, {color}]} key={key}>
      <Text style={textStyle} key={key}>
        <FontAwesome>{Icons[name]}</FontAwesome>
      </Text>
    )
  } else {
    let isDefault = false;
    if (iconSet != null) {
      switch (iconSet) {

        case 'material':
          renderedIcon = <MaterialIcon name={name} style={style} size={size} color={color} />
          break;

        case 'simple':
          renderedIcon = <SimpleIcon name={name} size={size} color={color} />
          break;
    
        default:
          isDefault = true;
          console.warn(`[LTIcon] Icon '${name}' of set '${iconSet}' wanted`, props);
          break;

      }
    } else {
      isDefault = true;
    }
    
    if (isDefault) {
      let extraStyle = {};
      if (size != null) {
        extraStyle.fontSize = size;
      }
      if (color != null) {
        extraStyle.color = color;
      }

      renderedIcon = <FontAwesome style={[style,extraStyle]}>{Icons[name]}</FontAwesome>
    }

    renderedResult = renderedIcon;
  }


  return renderedResult;
}