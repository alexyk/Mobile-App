import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import {
    View,
    Text,
    TouchableHighlight
} from 'react-native';
import styles from './styles';
import { tslog, telog } from '../../../config-debug';

export default class Day extends Component {
    static propTypes = {
        onChoose: PropTypes.func,
        isValid: PropTypes.bool,
        date: PropTypes.instanceOf(moment),
        color: PropTypes.shape({
            mainColor: PropTypes.string,
            subColor: PropTypes.string,
            borderColor: PropTypes.string,
            primaryColor: PropTypes.string
        })
    }

    static defaultProps = {
        onChoose: () => {},
        isValid: true,
        date: undefined,
        color: {
            mainColor: '#f0f1f3',
            subColor: '#1f2427',
            borderColor: '#1f2427',
            primaryColor: '#d87a61'
        }
    }

    constructor(props) {
        super(props);
        
        this.chooseDay = this.chooseDay.bind(this);        
    }

    shouldComponentUpdate(nextProps) {
        // const prevStatus = this.isFocus;
        // const { isFocus } = this.props;
        // if (prevStatus || isFocus) return true;

        return false;
    }

    chooseDay() {
        if (this.props.isValid) {
            setTimeout(() => this.props.onChoose(this.props.date));
        }
    }

    render() {
        if (this.props.isEmpty) {
            return <View style={styles.dayContainer} />
        }

        
        const { 
            color, text, isMid, isStartPart, isStart, isEnd, isValid, isFocus, isToday
        } = this.props;

        if (text == '1') tslog('*** rendering days 1-25')

        const mainColor = { color: color.mainColor };
        const subColor = { color: color.subColor };
        const subBack = { backgroundColor: color.primaryColor };

        let stylesCollection = [styles.dayContainer];
        if (isMid) stylesCollection.push(subBack);
        if (isStartPart) stylesCollection.push(styles.startContainer);
        if (isEnd) stylesCollection.push(styles.endContainer);
        if (isStartPart || isEnd) stylesCollection.push(subBack);

        if (text == '25') telog('*** rendering days 1-25')

        return (
            <View
                style={stylesCollection}
            >
                {isValid ?
                    <TouchableHighlight
                        style={[styles.day, isToday && styles.today, isFocus && subBack]}
                        underlayColor="rgba(255, 255, 255, 0.35)"
                        onPress={this.chooseDay}
                    >
                        <Text style={[styles.dayText, subColor, isFocus && mainColor]}>{text}</Text>
                    </TouchableHighlight> :
                    <View style={[styles.day, isToday && styles.today]}>
                        <Text style={styles.dayTextDisabled}>{text}</Text>
                    </View>
                }
            </View>
        );
    }
}
