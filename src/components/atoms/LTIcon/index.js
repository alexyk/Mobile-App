import React from 'react';
import { Text } from 'react-native';

import FontAwesome, { Icons } from 'react-native-fontawesome';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import SimpleIcon from 'react-native-vector-icons/SimpleLineIcons';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { createStyleFromObject } from '../../../utils/designUtils';
const faIconsSolid = require('@fortawesome/free-solid-svg-icons');


export default function LTIcon(props) {
  let { name, style, size, textStyle, color, iconSet, key } = props;
  let isAsText = false;

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
  

  if (isAsText) {
    //TODO: Fix icon as text
    // Example Usage: SearchBar
    if (!Icons[name]) {
      console.warn(`[LTIcon] Icon '${name}' as text not found`, props);
    }
    renderedResult = (
      <Text style={[textStyle, {color}]} key={key}>
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