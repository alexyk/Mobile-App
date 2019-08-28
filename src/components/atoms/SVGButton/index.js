import React from "react";
import { View, TouchableOpacity } from "react-native";
import PropTypes from "prop-types";
import Image from "react-native-remote-svg";

import styles from "./styles";
import { styleToNumber } from "../../screens/utils";

const SVGButton = props => {
  let extraStyle = styleToNumber(props.style);
  let imageStyle = styleToNumber(props.imageStyle);

  return (
    <TouchableOpacity onPress={props.onPress}>
      <View style={[styles.container, extraStyle]}>
        <Image source={props.image} style={[styles.image, imageStyle]} />
      </View>
    </TouchableOpacity>
  );
};

SVGButton.propTypes = {
  onPress: PropTypes.func,
  style: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  imageStyle: PropTypes.any
};

SVGButton.defaultProps = {
  onPress: () => {}
};

export default SVGButton;
