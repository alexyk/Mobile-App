import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import {
    View,
    Text,
    TouchableHighlight
} from 'react-native';
import styles from './styles';
import { log } from '../../../config-debug';

export default class Day extends PureComponent {
    static propTypes = {
        onChoose: PropTypes.func,
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
        this.statusCheck = this.statusCheck.bind(this);
        
        //console.log('props of day',{props})

        const { date,color } = props;
        const text = date ? date.date() : '';
        const mainColor = { color: color.mainColor };
        const subColor = { color: color.subColor };
        const subBack = { backgroundColor: color.primaryColor };
        
        /* const statusResult = {
            isToday:false,
            isStart:false,
            isStartPart:false,
            isEnd:false,
            isFocus:false,
            isValid:true
        } */
        const statusResult = this.statusCheck(props, false);
        this.state = {text, mainColor, subColor, subBack, ...statusResult};
    }

    /*shouldComponentUpdate(nextProps) {
        const prevStatus = this.isFocus;
        const { isFocus } = this.statusCheck(nextProps, false);
        if (prevStatus || isFocus) return true;

        return false;
    }*/

    statusCheck(props, useSetState=true) {
        //const now = Date.now()
        //console.time(`*** Day::statusCheck ${now}`);

        const { 
            startDate, endDate, today, date = null,
            minDate, maxDate, empty
        } = props || this.props;

        const isToday = today.isSame(date, 'd');
        const isValid = (
            date
            && (date >= minDate || date.isSame(minDate, 'd'))
            && (date <= maxDate || date.isSame(maxDate, 'd'))
        );

        const isMid = (
            ((date > startDate) && (date < endDate))
            || (!date && empty >= startDate && empty <= endDate)
        );
        const isStart = (date && date.isSame(startDate, 'd'));
        const isStartPart = (isStart && endDate);
        const isEnd = (date && date.isSame(endDate, 'd'));
        const isFocus = (isMid || isStart || isEnd);

        const state = {isToday, isStart, isStartPart, isEnd, isFocus, isValid};

        if (useSetState) {
            this.setState({isToday, isStart, isStartPart, isEnd, isFocus, isValid})
        }

        //console.timeEnd(`*** Day::statusCheck ${now}`);

        return state;
    }

    chooseDay() {
        this.props.onChoose(this.props.date);
    }

    render() {
        const { text, mainColor, subColor, subBack, 
            isMid, isStartPart, isEnd, isValid, isFocus, isToday
        } = this.state;

        return (
            <View
                style={[
                    styles.dayContainer,
                    isMid && subBack,
                    isStartPart && styles.startContainer,
                    isEnd && styles.endContainer,
                    (isStartPart || isEnd) && subBack
                ]}
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
