import React from 'react';
import { Text } from 'react-native';

import FontAwesome, { Icons } from 'react-native-fontawesome';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import SimpleIcon from 'react-native-vector-icons/SimpleLineIcons';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { createStyleFromObject } from '../../../utils/designUtils';
const faIconsSolid = require('@fortawesome/free-solid-svg-icons');


export default function LTIcon(props) {
  let { name, style, size, textStyle, color, iconSet, key, isText } = props;
  let isAsText = false;

  /**
   * Inside a <Text> component tag - case 1, when <Text> is in the parent component
   * (where LTIcon is imported) and it is among characters (Exmple: <Text>USD - <LTIcon isText name={'usd'} /> </Text>)
   */
  if (isText) {
    return <FontAwesome>{Icons[name]}</FontAwesome>
  }


  if (color != null) {
    style = {color};
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
    if (iconSet != null) {
      switch (iconSet) {

        case 'material':
          renderedIcon = <FontAwesomeIcon icon={faIconsSolid[faName]} style={style} size={size} color={color} />
          break;

        case 'simple':
          renderedIcon = <SimpleIcon name={name} size={size} color={color} />
          break;
    
        default:
          console.warn(`[LTIcon] Icon '${name}' of set '${iconSet}' wanted`, props);
          renderedIcon = <FontAwesome>{Icons[name]}</FontAwesome>
          break;

      }
    } else {
      const faName = 'fa' + name.substr(0,1).toUpperCase() + name.substr(1);
      renderedIcon = ( <FontAwesomeIcon icon={faIconsSolid[faName]} style={style} size={size} /> );
    }
  
    renderedResult = renderedIcon;
  }


  return renderedResult;
}