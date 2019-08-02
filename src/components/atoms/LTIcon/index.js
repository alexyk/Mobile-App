import React from 'react';
import { Text } from 'react-native';

import FontAwesome, { Icons } from 'react-native-fontawesome';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import SimpleIcon from 'react-native-vector-icons/SimpleLineIcons';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
const faIconsSolid = require('@fortawesome/free-solid-svg-icons');

import { rlog } from '../../../config-debug';


export default function LTIcon(props) {
  rlog(`icon-constructor`, `props`, props);

  let { name, style, size, textStyle, color, iconSet, key } = props;
  let renderAsText = false;

  if (color != null) {
    style = {color};
  }
  if (size == null) {
    size = 24;
  }
  if (textStyle != null) {
    renderAsText = true;
  }

  if (name == null) {
    return null;
  } else if (renderAsText) {
    if (iconSet != null) {
      switch (iconSet) {

        case 'material':
          rlog(`icon`, `icon: ${name}, case 1`);

          return (
            <Text style={styles.leftIconText} key={key}>
              <MaterialIcon name={name} size={size} color={color} />
            </Text>
          )

          case 'solid':
              rlog(`icon`, `icon: ${name}, case 2`);

              return (
                <Text style={styles.leftIconText}>
                  <SimpleIcon name={name} size={size} color={color} />
                </Text>
              )
    
        default:
          console.warn(`[LTIcon] Icon '${name}' of set '${iconSet}' wanted`, props);
          rlog(`icon`, `icon: ${name}, case 3`);

          return (
            <Text style={textStyle}>
                <FontAwesome>{Icons[name]}</FontAwesome>
            </Text>
          )

      }
    } else {
      rlog(`icon`, `icon: ${name}, case 4`, {Icons});

      return (
        <Text style={textStyle}>
            <FontAwesome>{Icons[name]}</FontAwesome>
        </Text>
      )
    }
  } else {
    const faName = 'fa' + name.substr(0,1).toUpperCase() + name.substr(1);
    rlog(`icon`, `icon: ${name}, case 5`, {props, faIconsSolid, FontAwesomeIcon, FontAwesome, faName});
    // rlog(`icon`, `icon: ${name}, case 5`, {props, faIcons, FontAwesomeIcon, FontAwesome});

    return (
      <FontAwesomeIcon icon={faIconsSolid[faName]} style={style} size={size} />
    )  
  }
}