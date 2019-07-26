import React from 'react';
import PropTypes from 'prop-types';
import SVGButton from '../SVGButton'

const BackButton = function(props) {
    let image = '';
    if (props.isWhite) {
        image = require('../../../assets/png/arrow-back-white.png');
    } else {
        image = require('../../../assets/png/arrow-back.png');
    }

    return (
        <SVGButton 
            style={props.style}
            imageStyle={props.imageStyle}
            image={image}
            onPress={props.onPress}/>
    );
}

BackButton.propTypes = {
    onPress: PropTypes.func
};

BackButton.defaultProps = {
    onPress: () => {}
};

export default BackButton;
