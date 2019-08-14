import React, { Component } from 'react';
import {
        Text,
        TouchableOpacity,
         View
       } from 'react-native';
import Image from 'react-native-remote-svg';
import PropTypes from 'prop-types';

import styles from './styles';
import { clog } from '../../../config-debug';

class Counter extends Component {
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
        this.state = {
          count:0
        };
        this.state.count = this.props.count;
        this.onMinus = this.onMinus.bind(this);
        this.onPlus = this.onPlus.bind(this);
    }

    isOutOfRange(newValue) {
        const { min, max } = this.props;
        const hasMin = (min != null);
        const hasMax = (max != null);
        
        const result = ( (hasMin && min > newValue) || (hasMax && max < newValue) );
        

        //@@@debu
        clog(`isOutOfRange:`, {hasMin, hasMax, min, max, newValue, result});

        return result;
    }

    onMinus() {
        const count = (this.state.count - 1);

        if (this.isOutOfRange(count)) {
            return;
        }

        // update value if in range
        this.setState({ count});
        if (this.props.onChanged) {
            this.props.onChanged(count);
        }
    }

    onPlus() {
        const count = (this.state.count + 1);

        if (this.isOutOfRange(count)) {
            return;
        }

        // update value if in range
        this.setState({ count });
        if (this.props.onChanged) {
            this.props.onChanged(count);
        }
    }

    render() {
        return (
            <View style={styles.container}>
              <TouchableOpacity onPress={this.onMinus}>
                  <Image source={require('../../../assets/minus.png')} style={ this.state.count > 0 ? styles.ButtonImage : styles.DisableImage }/>
              </TouchableOpacity>
              <Text style={styles.value}>{this.state.count > 0 ? this.state.count : "0+"}</Text>
              <TouchableOpacity onPress={this.onPlus}>
                  <Image source={require('../../../assets/plus.png')} style={styles.ButtonImage}/>
              </TouchableOpacity>
            </View>
        );
    }
}

export default Counter;
