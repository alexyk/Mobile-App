import React, { Component } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import PropTypes from 'prop-types';
import styles from './styles';
import LTIcon from '../../atoms/LTIcon';

class SearchBar extends Component {
    static propTypes = {
        onLeftPress: PropTypes.func,
        leftIcon: PropTypes.string,
        editable: PropTypes.bool
    }
    static defaultProps = {
        onLeftPress: () => {},
        leftIcon: '',
        editable: true,
    }
    constructor() {
        super();
        this.input = {
            focus: () => {}
        };
    }
    focus() {
        this.input.focus();
    }

    renderLeftButton() {
        const { leftIcon, onLeftPress } = this.props;
        let renderButton = null;

        if (leftIcon) {
            renderButton = (
                <View style={styles.leftIconView}>
                    <LTIcon
                        name={leftIcon}
                        size={22}
                        color="#000"
                        textStyle={styles.leftIconText}
                    />
                </View>
            );
        }

        if (leftIcon && onLeftPress) {
            renderButton = (
                <TouchableOpacity onPress={() => onLeftPress()}>{ renderButton }</TouchableOpacity>
            );
        }

        return renderButton;
    }

    render() {
        let {onTextEnter} = this.props;
        if (onTextEnter == null) {
            onTextEnter = () => { if (__DEV__) console.log('[SearchBar] Text Entered')};
        }

        return (
            <View style={[styles.container]}>
                { this.renderLeftButton() }

                <TextInput
                    onSubmitEditing={(event) => onTextEnter(event)}
                    ref={(i) => { this.input = i; }}
                    underlineColorAndroid="#ffffff"
                    style={this.props.editable? styles.input : styles.input_disable}
                    {...this.props}
                />
            </View>
        );
    }
}

export default SearchBar;
