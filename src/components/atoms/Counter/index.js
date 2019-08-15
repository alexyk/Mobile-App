import React, { PureComponent } from 'react';
import {
        Text,
        TouchableOpacity,
         View
       } from 'react-native';
import Image from 'react-native-remote-svg';
import PropTypes from 'prop-types';

import styles from './styles';


class Counter extends PureComponent {
    static propTypes = {
        count: PropTypes.number.isRequired,
        max: PropTypes.number,
        min: PropTypes.number
    };
    static defaultProps = {
        min: 0
    };

    constructor(props) {
        super(props);

        this.onMinus = this.onMinus.bind(this);
        this.onPlus = this.onPlus.bind(this);
    }

    isOutOfRange(newValue) {
        const { min, max } = this.props;
        const hasMin = (min != null);
        const hasMax = (max != null);
        
        const result = ( (hasMin && min > newValue) || (hasMax && max < newValue) );

        return result;
    }

    onMinus() {
        const count = (this.props.count - 1);

        if (this.isOutOfRange(count)) {
            return;
        }

        // update value if in range
        if (this.props.onChanged) {
            this.props.onChanged(count);
        }
    }

    onPlus() {
        const count = (this.props.count + 1);

        if (this.isOutOfRange(count)) {
            return;
        }

        // update value if in range
        if (this.props.onChanged) {
            this.props.onChanged(count);
        }
    }

    _renderButton(name, isDisabled, onPress) {
        let image;
        switch (name) {
            case 'plus':
                image = require(`../../../assets/plus.png`);
                break;
            case 'minus':
                image = require(`../../../assets/minus.png`);
                break;
        }

        return (
            isDisabled
                ?   <Image source={image} style={ styles.DisableImage }/>
                :
                    <TouchableOpacity onPress={onPress}>
                        <Image source={image} style={ styles.ButtonImage }/>
                    </TouchableOpacity>
        );
    }

    render() {
        const { min, max, count } = this.props;
        const isMin = (count == min);
        const isMax = (count == max);

        return (
            <View style={styles.container}>

              { this._renderButton('minus', isMin, this.onMinus)}

              <Text style={styles.value}>{count}</Text>

              { this._renderButton('plus', isMax, this.onPlus)}

            </View>
        );
    }
}

export default Counter;
