import React, { Component } from 'react';
import { Text, View } from 'react-native';
import PropTypes from 'prop-types';
import Counter from '../../atoms/Counter'

import styles from './styles';


class GuestRow extends Component {

    static propTypes = {
        title: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        count: PropTypes.number.isRequired,
        isChild: PropTypes.bool,
        childAge: PropTypes.number
    };

    constructor(props) {
        super(props);
        this.onChanged = this.onChanged.bind(this);
    }

    onChanged(value) {
        if (this.props.onChanged) {
          this.props.onChanged(this.props.type, value);
        }
    }

    render() {
        const {
            title, subtitle, count, min, max
        } = this.props;

        return (
            <View style={styles.container}>
                <View style={styles.headStyle}>
                    <Text style={styles.titleStyle}>{title}</Text>
                    {subtitle != "" && (<Text style={styles.subtitleStyle}>{subtitle}</Text>)}
                </View>
                <Counter min={min} max={max} style={styles.countStyle} count={count} onChanged={this.onChanged}/>
            </View>
        );
    }
}

export default GuestRow;
