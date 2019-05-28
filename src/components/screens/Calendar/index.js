import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { setDatesAndGuestsData } from '../../../redux/action/userInterface'

import {
    View,
    Text,
    TouchableHighlight
} from 'react-native';

import moment from 'moment';
import styles from './styles';
import MonthList from '../../organisms/MonthList';
import { I18N_MAP } from './i18n';
import CloseButton from '../../atoms/CloseButton';
import { logd, log } from '../../../config-debug';

const useRedux = true;

class Calendar extends Component {
    static propTypes = {
        color: PropTypes.shape({
            mainColor: PropTypes.string,
            subColor: PropTypes.string,
            borderColor: PropTypes.string,
            primaryColor: PropTypes.string
        }),
    }
    static defaultProps = {
        color: {
            mainColor: '#f0f1f3',
            subColor: '#000',
            borderColor: '#1f2427',
            primaryColor: '#d87a61'
        },
    }

    constructor(props) {
        super(props);

        const {today, startDate, endDate} = this.props.datesAndGuestsData;
        this.startDate = startDate;
        this.endDate = endDate;
        this.today = today;
        this.year = this.today.year();

        this.weekRendered = null;
        
        const subFontColor = { color: props.color.subColor };
        this.state = {
            ...this.props.datesAndGuestsData,
            today: today.clone(),
            weekDays: [7, 1, 2, 3, 4, 5, 6].map(item => <Text style={[styles.weekText, subFontColor]} key={item}>{this.i18n(item, 'w')}</Text>)
        };
        this.initialState = this.state;
        if (useRedux) {
            props.setDatesAndGuestsData(this.state);
            this.state = {};
        }
        
        this.i18n = this.i18n.bind(this);
        this.onChoose = this.onChoose.bind(this);
        this.resetCalendar = this.resetCalendar.bind(this);
        this.cancel = this.cancel.bind(this);
        this.clear = this.clear.bind(this);
        this.confirm = this.confirm.bind(this);
    }

    
    componentDidMount() {
        this.resetCalendar();
        setTimeout(() => this.setCalendarData());
    }


    generateCalendarData(extraData=null) {
        let monthList = [];
        let {minDate: minDateSrc, maxDate: maxDateSrc} = this.props.datesAndGuestsData;
        let minDate = (minDateSrc && minDateSrc.clone().date(1));
        let maxDate = (maxDateSrc && maxDateSrc.clone());
        let current = minDate;
        while ( current.isSameOrBefore(maxDate) ) {
            const dateClone = current.clone();
            let month = {
                dayRows: this.generateDaysForMonth(dateClone,extraData),
                date: dateClone
            };
            //month.shouldUpdate = this.shouldUpdate(month, props);
            monthList.push(month);
            current.add(1, 'month');
        }

        return monthList;
    }

    generateDaysForMonth(date,extraData=null) {
        // const now = Date.now()
        // console.time(`*** Calendar::generateDaysForMonth ${now}`);

        
        let { inputFormat } = (useRedux ? this.props.datesAndGuestsData : this.state);
        let checkInDateMoment = moment(this.startDate, inputFormat);
        let checkOutDateMoment = moment(this.endDate, inputFormat);
        const month = date.month();
        let weekday = date.isoWeekday();
        let dayList;

        //console.debug(`[calc] generateDaysForMonth: ${month+1}`, {checkInDateMoment, checkOutDateMoment})

        if (weekday === 7) {
            dayList = [];
        } else {
            dayList = new Array(weekday).fill({
                isEmpty: true
            });
        }
        while (date.month() === month) {
            const isStart = date.isSame(checkInDateMoment);
            const isMid = date.isAfter(checkInDateMoment) && date.isBefore(checkOutDateMoment);// || (!date && empty >= checkInDateMoment && empty <= checkOutDateMoment),
            const isEnd = date.isSame(checkOutDateMoment);
            const isFocus = (isMid || isStart || isEnd);
            const isStartPart = (isStart && (checkOutDateMoment != null));
            const text = date.date().toString();
            const newDay = {
                // date: date.format(internalFormat),
                text,
                date: date.clone(),
                isToday: date.isSame(this.today),
                isStart, isMid, isEnd, isFocus, isStartPart,
                isValid: (date.isSameOrAfter(this.today)),
            };

            /* 
            // debug
            if (isStart || isMid || isStartPart || isEnd || isFocus) {
                //console.log('day-data-match', `${text}-${(date.month()+1).toString()} -> ${isStart?'S,':'s,'}${isMid?'M,':'m,'}${isEnd?'E,':'e,'}${isStartPart?'SP,':'sp,'}${isFocus?'F,':'f,'}`,{isStart,isMid,isStartPart,isEnd,isFocus,text,newDay,checkInDateMoment,checkOutDateMoment})
            } else {
                //console.info('day-data-debug',`${text}-${(date.month()+1).toString()}, ${date.toString()}(${typeof(date)}) => ${checkInDateMoment}***${checkOutDateMoment}(${typeof(checkInDateMoment)}**${typeof(checkOutDateMoment)})`,{newDay})
            } */

            dayList.push(newDay);
            date.add(1, 'days');
        }
        date.subtract(1, 'days');
        weekday = date.isoWeekday();
        if (weekday === 7) {
            return dayList.concat(new Array(6).fill({
                isEmpty: true,
            }));
        }

        dayList = dayList.concat(new Array(Math.abs(weekday - 6)).fill({
            isEmpty: true
        }));

        // console.timeEnd(`*** Calendar::generateDaysForMonth ${now}`);

        return dayList;
    }

    setCalendarData(extraData=null) {
        // console.time('**** setCalendarData 1');

        const calendarData = this.generateCalendarData(extraData);

        const newData = {
            ...extraData,
            calendarData
        };

        // console.timeEnd('**** setCalendarData 1');

        console.time('**** setCalendarData 2');

        if (useRedux) {
            this.props.setDatesAndGuestsData(newData);
        } else {
            this.props.setDatesAndGuestsData(newData);
            this.setState(newData);
        }

        console.timeEnd('**** setCalendarData 2');
    }

    resetCalendar() {
        const {inputFormat, minDate, maxDate} = (useRedux ? this.props.datesAndGuestsData : this.state);
        const startDate = this.startDate;
        const endDate = this.endDate;
        
        const start = moment(startDate, inputFormat);
        const end = moment(endDate, inputFormat);
        const isStartValid = start.isValid() && start >= minDate && start <= maxDate;
        const isEndValid = end.isValid() && end >= minDate && end <= maxDate;

        const newState = {
            startDate: isStartValid ? start : null,
            startDateText: isStartValid ? this.i18n(start, 'date') : '',
            startWeekdayText: isStartValid ? this.i18n(start.isoWeekday(), 'w') : '',
            endDate: isEndValid ? end : null,
            endDateText: isEndValid ? this.i18n(end, 'date') : '',
            endWeekdayText: isEndValid ? this.i18n(end.isoWeekday(), 'w') : ''
        };
        if (useRedux) {
            this.props.setDatesAndGuestsData(newState);
        } else {
            this.setState(newState);
        }
    }

    i18n(data, type) {
        const i18n = 'en';
        const customI18n = {}
        if (~['w', 'weekday', 'text'].indexOf(type)) { // eslint-disable-line
            return (customI18n[type] || {})[data] || I18N_MAP[i18n][type][data];
        }
        if (type === 'date') {
            let result = data.format(customI18n[type] || I18N_MAP[i18n][type]);
            const year = data.year();
            // if date is next year
            if (this.year < year) {
                result += `, ${year}`
            }

            return result;
        }
        return {};
    }

    cancel() {
        if (useRedux) {
            this.props.setDatesAndGuestsData(this.initialState)
        } else {
            this.setState(this.initialState)
        }
        this.props.navigation.goBack();
        // this.resetCalendar();
    }
    
    clear() {
        this.setState({
            startDate: null,
            endDate: null,
            startDateText: '',
            startWeekdayText: '',
            endDateText: '',
            endWeekdayText: ''
        });
    }
    
    confirm() {
        
        const newState = (useRedux ? this.props.datesAndGuestsData : this.state);
        const { onConfirm } = this.props.datesAndGuestsData;
        onConfirm(newState);

        this.props.navigation.goBack();
    }


    onChoose(day) {
        // const { startDate, endDate } = (useRedux ? this.props.datesAndGuestsData : this.state);
        let newData = {};
        let startDate = this.startDate;
        let endDate = this.endDate;
        const dayAsI18Str = this.i18n(day, 'date');
        const dayAsI18WeekDayStr = this.i18n(day.isoWeekday(), 'w');
        
        if ((!startDate && !endDate) || day < startDate || (startDate && endDate)) {
            startDate = day;
            endDate = null;
            this.startDate = startDate;
            this.endDate = endDate;
            newData = {
                startDate, endDate,
                startDateText: dayAsI18Str,
                startWeekdayText: dayAsI18WeekDayStr,
                endDateText: '',
                endWeekdayText: ''
            }
            //console.info(`[CALC] case 1: ${day.toString()}`,{day,newData})
        } else if (startDate && !endDate && day > startDate) {
            endDate = day;
            this.endDate = endDate;
            newData = {
                endDate,
                endDateText: dayAsI18Str,
                endWeekdayText: dayAsI18WeekDayStr,
            };
            //console.info(`[CALC] case 2: ${day.toString()}`,{day,newData})
        }

        this.setCalendarData(newData);
    }

    render() {
        // console.time('*** render Calendar')

        const {
            startDate,
            endDate,
            checkInDateMoment,
            checkOutDateMoment,
            startDateText,
            startWeekdayText,
            endDateText,
            endWeekdayText,
            weekDays,
            inputFormat,
            minDate, maxDate,
            calendarData
        } = this.props.datesAndGuestsData;
        const {color} = this.props;

        const {
            mainColor,
            subColor,
            borderColor,
            primaryColor
        } = color;
        const mainBack = { backgroundColor: mainColor };
        const subBack = { backgroundColor: subColor };
        const subFontColor = { color: subColor };
        const primaryFontColor = { color: primaryColor };
        const isValid = !startDate || endDate;
        const isClearVisible = startDate || endDate;

        const result = (
            <View style={[styles.container, mainBack]}>
                <View style={{justifyContent: 'space-between', flexDirection: 'row',}}>
                    <CloseButton onPress={this.cancel} />
                    {
                        isClearVisible &&
                        <TouchableHighlight
                            underlayColor="transparent"
                            activeOpacity={0.8}
                            onPress={this.clear}
                            style={{marginTop: 45, marginRight:18, alignItems:'flex-end', justifyContent:'center'}}
                        >
                            <Text style={[styles.clearText, subFontColor]}>{this.i18n('clear', 'text')}</Text>
                        </TouchableHighlight>
                    }
                </View>
                
                <View style={styles.result}>
                    <View style={styles.resultPart}>
                        <Text style={[styles.resultText, styles.weekdayText, subFontColor]}>
                            {startWeekdayText || this.i18n('date', 'text')}
                        </Text>
                        <Text style={[styles.resultText, styles.dateText, primaryFontColor]}>
                            {startDateText || this.i18n('start', 'text')}
                        </Text>
                    </View>
                    <View style={[styles.resultSlash, subBack]} />
                    <View style={styles.resultPart}>
                        <Text style={[styles.resultText, styles.weekdayText, subFontColor]}>
                            {endWeekdayText || this.i18n('date', 'text')}
                        </Text>
                        <Text style={[styles.resultText, styles.dateText, primaryFontColor]}>
                            {endDateText || this.i18n('end', 'text')}
                        </Text>
                    </View>
                </View>
                <View style={styles.week}>
                    {weekDays}
                </View>
                <View style={[styles.scroll]}>
                    <MonthList
                        today={this.today}
                        data={calendarData}
                        minDate={minDate}
                        maxDate={maxDate}
                        startDate={checkInDateMoment}
                        endDate={checkOutDateMoment}
                        onChoose={this.onChoose}
                        inputFormat={inputFormat}
                        i18n={'en'}
                        color={color}
                    />
                </View>
                <View style={styles.btn}>
                    {isValid ?
                        <TouchableHighlight
                            underlayColor={primaryColor}
                            style={styles.confirmContainer}
                            onPress={this.confirm}
                        >
                            <View style={styles.confirmBtn}>
                                <Text
                                    ellipsisMode="tail"
                                    numberOfLines={1}
                                    style={[styles.confirmText]}
                                >
                                    {this.i18n('save', 'text')}
                                </Text>
                            </View>
                        </TouchableHighlight> :
                        <View style={[styles.confirmContainer, styles.confirmContainerDisabled]}>
                            <View style={styles.confirmBtn}>
                                <Text
                                    ellipsisMode="tail"
                                    numberOfLines={1}
                                    style={[styles.confirmText, styles.confirmTextDisabled]}
                                >
                                    {this.i18n('save', 'text')}
                                </Text>
                            </View>
                        </View>
                    }
                </View>
            </View>
        );

        // console.timeEnd('*** render Calendar')

        return result;
    }
}


let mapStateToProps = (state) => {
    return {
        datesAndGuestsData: state.userInterface.datesAndGuestsData,
    };
}

const mapDispatchToProps = dispatch => ({
    setDatesAndGuestsData: bindActionCreators(setDatesAndGuestsData, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(Calendar);