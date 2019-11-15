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
import { processError } from '../../../config-debug';
import { updateMarkedCalendarData, generateInitialCalendarData } from './utils';

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

        this.isFirst = true;
        
        const subFontColor = { color: props.color.subColor };
        this.state = {
            ...this.props.datesAndGuestsData,
            today: today.clone(),
            weekDays: [7, 1, 2, 3, 4, 5, 6].map(item => <Text style={[styles.weekText, subFontColor]} key={item}>{this.i18n(item, 'w')}</Text>)
        };
        this.initialState = this.state;
        if (useRedux) {
            if (props.datesAndGuestsData.calendarData.length == 0) {
                props.setDatesAndGuestsData(this.state);
            }
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

    setCalendarData(extraData=null) {
        // console.time('**** setCalendarData 1');
        const {
            internalFormat, inputFormat, minDate: minDateSrc, maxDate: maxDateSrc,
            calendarMarkedDays: oldMarked
        } = this.props.datesAndGuestsData;
        let newData = {};
        const checkInDateMoment = moment(this.startDate, inputFormat);
        const checkOutDateMoment = moment(this.endDate, inputFormat);
        const minDate = (minDateSrc && minDateSrc.clone());
        const maxDate = (maxDateSrc && maxDateSrc.clone());
        this.minDate = minDate.clone();
        this.maxDate = maxDate.clone();

        try {
            if (this.isFirst) {
                const {calendarData, calendarMarkedDays} = generateInitialCalendarData(checkInDateMoment,checkOutDateMoment,this.today,minDate,maxDate,internalFormat,extraData);
                newData = {
                    ...extraData,
                    calendarData,
                    calendarMarkedDays
                };
                this.isFirst = false;
            } else {
                const calendarMarkedDays = updateMarkedCalendarData(oldMarked, minDate,checkInDateMoment,checkOutDateMoment,this.today,internalFormat);
                newData = {
                    ...extraData,
                    calendarMarkedDays
                };    
            }
        } catch (error) {
            processError(`[Calendar::setCalendarData] Error generating calendar data: ${error.message}`,{error});
        }

        // console.timeEnd('**** setCalendarData 1');

        console.time('**** setCalendarData 2');

        this.props.setDatesAndGuestsData(newData);

        if (!useRedux) {
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
	const { internalFormat } = this.props.datesAndGuestsData;
	const { calendarMarkedDays:oldMarked } = ( useRedux ? this.props.datesAndGuestsData : this.state );
        const calendarMarkedDays = updateMarkedCalendarData(oldMarked,this.minDate, null, null, this.today, this.props.datesAndGuestsData.internalFormat);
        const newState = {
            startDate: null,
            endDate: null,
            startDateText: '',
            startWeekdayText: '',
            endDateText: '',
            endWeekdayText: '',
            calendarMarkedDays
        }
        if (useRedux) {
            this.props.setDatesAndGuestsData(newState);
        } else {
            this.setState(newState);
        }
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
            inputFormat, internalFormat,
            minDate, maxDate,
            calendarData,
            calendarMarkedDays,
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
        const isValid = (startDate != null &&  endDate != null);
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
                        markedData={calendarMarkedDays}
                        minDate={minDate}
                        maxDate={maxDate}
                        startDate={checkInDateMoment}
                        endDate={checkOutDateMoment}
                        onChoose={this.onChoose}
                        inputFormat={inputFormat}
                        inputFinternalFormatormat={internalFormat}
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
