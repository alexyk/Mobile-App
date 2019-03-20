import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import Image from 'react-native-remote-svg';

import styles from './styles';

const SVGButton = (props) => {
    return (
        <TouchableOpacity onPress={props.onPress}>
            <View style={[styles.container, props.style]}>
                <Image source={props.image} style={[styles.image,props.imageStyle]}/>
            </View>
        </TouchableOpacity>
    );
}

SVGButton.propTypes = {
    onPress: PropTypes.func,
    style: PropTypes.number,
    imageStyle: PropTypes.number
};

SVGButton.defaultProps = {
    onPress: () => {}
};

export default SVGButton;
