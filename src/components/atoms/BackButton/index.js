import React from 'react';
import PropTypes from 'prop-types';
import SVGButton from '../SVGButton'
import styles from './styles';

const BackButton = function(props) {
    if (props.isWhite) {
        return (
            <SVGButton style={styles.BackButton} image={require('../../../assets/png/arrow-back-white.png')} onPress={props.onPress}/>
        );
    } else {
        return (
            <SVGButton style={styles.BackButton} image={require('../../../assets/png/arrow-back.png')} onPress={props.onPress}/>
        );
    }
}

BackButton.propTypes = {
    onPress: PropTypes.func
};

BackButton.defaultProps = {
    onPress: () => {}
};

export default BackButton;
