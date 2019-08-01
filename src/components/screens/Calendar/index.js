import moment from 'moment';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Text, TouchableHighlight, View } from 'react-native';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { setDatesAndGuestsData } from '../../../redux/action/userInterface';
import CloseButton from '../../atoms/CloseButton';
import MonthList from '../../organisms/MonthList';
import styles from './styles';
import { updateMarkedCalendarData, i18n, formatDay } from './utils';
import { tslog, telog } from '../../../config-debug';
import LTLoader from '../../molecules/LTLoader';


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

        tslog('Calendar constructor');
        const {
            today, checkInMoment, checkOutMoment
        } = props.datesAndGuestsData;

        this.checkInMoment = checkInMoment.clone();
        this.checkOutMoment = checkOutMoment.clone();
        this.prevCheckInMoment = null;
        this.prevCheckOutMoment = null;
        this.today = today.clone();
        this.year = this.today.year();
        
        // used for optimised calendar rendering
        // (just refresh changed range of dates)
        this.minUpdate = checkInMoment.clone();
        this.maxUpdate = checkOutMoment.clone();
        
        const subFontColor = { color: props.color.subColor };

        // reload cache from redux & set to state
        this.initialState = {
            ...this.props.datesAndGuestsData,
            isLoading: true,
            weekDays: [7, 1, 2, 3, 4, 5, 6].map(item => <Text style={[styles.weekText, subFontColor]} key={item}>{i18n(this.year, item, 'w')}</Text>)
        };
        this.state = { ... this.initialState }
        
        this.onChoose = this.onChoose.bind(this);
        this.cancel = this.cancel.bind(this);
        this.clear = this.clear.bind(this);
        this.confirm = this.confirm.bind(this);
        telog('Calendar constructor');

        setTimeout( () => this.setState({isLoading: false}), 100)
    }


    setCalendarData(newState=null) {
        tslog('**** setCalendarData 1');
        const { internalFormat, calendarMarkedDays: oldMarkedDays } = this.state;

        let newData = {};
        const checkInMoment = moment(this.checkInMoment);
        const checkOutMoment = moment(this.checkOutMoment);
        const {
            days: calendarMarkedDays,
            months: calendarMarkedMonths
        } = updateMarkedCalendarData(oldMarkedDays,this.minUpdate,this.maxUpdate,checkInMoment,checkOutMoment,this.today,internalFormat);

        newData = {
            ...newState,
            calendarMarkedDays,
            calendarMarkedMonths
        };
        telog('**** setCalendarData 1');

        tslog('**** setCalendarData 2');
        this.setState(newData);
        telog('**** setCalendarData 2');
    }


    cancel() {
        // don't block button animation (if any)
        setTimeout(() => this.props.navigation.goBack());
    }
    
    clear() {
        if (this.checkInMoment
            && this.checkOutMoment
            && this.checkOutMoment > this.checkInMoment
        ) {
            this.prevCheckInMoment = moment(this.checkInMoment);
            this.prevCheckOutMoment = moment(this.checkOutMoment);
        }
        this.checkInMoment = null;
        this.checkOutMoment = null;
        const { calendarMarkedDays:oldMarkedDays, internalFormat } = this.state;
        const {
            days:calendarMarkedDays,months:calendarMarkedMonths
        } = updateMarkedCalendarData(oldMarkedDays,this.minUpdate,this.maxUpdate, null, null, this.today, internalFormat);
        const newState = {
            startDate: null,
            endDate: null,
            startDateText: '',
            startWeekdayText: '',
            endDateText: '',
            endWeekdayText: '',
            calendarMarkedDays,
            calendarMarkedMonths
        }
        this.setState(newState);
    }
    
    confirm() {
        const {
            inputFormat, today, onConfirm, calendarMarkedDays, calendarMarkedMonths
        } = this.state;

        const newState = {
            checkInMoment: this.checkInMoment,
            checkOutMoment: this.checkOutMoment,
            inputFormat, today, calendarMarkedDays, calendarMarkedMonths
        };
        onConfirm(newState);

        // detach from current code execution (smoother animation)
        setTimeout(() => this.props.navigation.goBack());
    }


    onChoose(day) {
        const { inputFormat } = this.state;
        let newData = {};
        let prevCheckInMoment = this.checkInMoment;
        let prevCheckOutMoment = this.checkOutMoment;
        this.prevCheckInMoment = prevCheckInMoment;
        this.prevCheckOutMoment = (
            prevCheckOutMoment
                ? prevCheckOutMoment
                : this.prevCheckOutMoment
        );

        let dayFormatted;

        if ( 
            (prevCheckInMoment && prevCheckOutMoment)
            || (!prevCheckInMoment && !prevCheckOutMoment)
            || (prevCheckInMoment && day < prevCheckInMoment)
        ) {
            this.checkInMoment = day;
            this.checkOutMoment = null;
            dayFormatted = formatDay(this.year, day, inputFormat, true);
            newData = {
                endDate: null,
                endDateText: '',
                endWeekdayText: '',
                ...dayFormatted
            }
            if (this.minUpdate > day) {
                this.minUpdate = day.clone();
            } else if (this.maxUpdate < day) {
                this.maxUpdate = day;
            }
        } else {
            this.checkOutMoment = day;
            dayFormatted = formatDay(this.year, day, inputFormat, false);
            newData = { ...dayFormatted };
            this.minUpdate = this.checkInMoment;
            this.maxUpdate = day.clone();
        }

        this.setCalendarData(newData);
    }

    _renderClearButton(isClearVisible, subFontColor) {
        return (
            isClearVisible
                &&  <TouchableHighlight
                        underlayColor="transparent"
                        activeOpacity={0.8}
                        onPress={this.clear}
                        style={{marginTop: 45, marginRight:18, alignItems:'flex-end', justifyContent:'center'}}
                    >
                        <Text style={[styles.clearText, subFontColor]}>{i18n(this.year, 'clear', 'text')}</Text>
                    </TouchableHighlight>
        )
    }

    _renderStartDateText(subFontColor, primaryFontColor) {
        const { startDateText, startWeekdayText } = this.state;

        return (
            <View style={styles.resultPart}>
                <Text style={[styles.resultText, styles.weekdayText, subFontColor]}>
                    {startWeekdayText || i18n(this.year, 'date', 'text')}
                </Text>
                <Text style={[styles.resultText, styles.dateText, primaryFontColor]}>
                    {startDateText || i18n(this.year, 'start', 'text')}
                </Text>
            </View>
        )
    }
    
    _renderEndDateText(subFontColor, primaryFontColor) {
        const { endDateText, endWeekdayText } = this.state;
        return (
            <View style={styles.resultPart}>
                <Text style={[styles.resultText, styles.weekdayText, subFontColor]}>
                    {endWeekdayText || i18n(this.year, 'date', 'text')}
                </Text>
                <Text style={[styles.resultText, styles.dateText, primaryFontColor]}>
                    {endDateText || i18n(this.year, 'end', 'text')}
                </Text>
            </View>
        )
    }
    

    _renderCalendar(color) {
        const {
            checkInMoment,
            checkOutMoment,
            weekDays,
            inputFormat, internalFormat,
            minDate, maxDate,
            calendarMarkedDays,
            calendarMarkedMonths,
            calendarData
        } = this.state;

        const id = `${checkInMoment}_${checkOutMoment}`;

        return [
            <View style={styles.week} key={`${id}_weekdays`}>
                {weekDays}
            </View>
            ,
            <View style={[styles.scroll]} key={`${id}_calendar`}>
                <MonthList
                    today={this.today}
                    data={calendarData}
                    markedDays={calendarMarkedDays}
                    markedMonths={calendarMarkedMonths}
                    minDate={minDate.clone()}
                    maxDate={maxDate.clone()}
                    startDate={checkInMoment.clone()}
                    endDate={checkOutMoment.clone()}
                    onChoose={this.onChoose}
                    inputFormat={inputFormat}
                    inputFinternalFormatormat={internalFormat}
                    i18n={'en'}
                    color={color}
                />
            </View>
        ]
    }

    _renderDoneButton(isValid, primaryColor) {
        return (
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
                                {i18n(this.year, 'save', 'text')}
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
                                {i18n(this.year, 'save', 'text')}
                            </Text>
                        </View>
                    </View>
                }
            </View>
        )
    }

    render() {
        const { isLoading, startDate, endDate } = this.state;
        if (isLoading) {
            return <LTLoader message={'Loading calendar ...'} />
        }


        tslog('*** render Calendar')


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
                    { this._renderClearButton(isClearVisible, subFontColor) }
                </View>
                
                <View style={styles.result}>
                    { this._renderStartDateText(subFontColor, primaryFontColor) }
                    <View style={[styles.resultSlash, subBack]} />
                    { this._renderEndDateText(subFontColor, primaryFontColor) }
                </View>

                { this._renderCalendar(color) }
                
                { this._renderDoneButton(isValid, primaryColor) }
            </View>
        );

        telog('*** render Calendar')

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
