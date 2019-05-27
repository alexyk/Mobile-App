import React, { PureComponent } from 'react';
import { View, Text } from 'react-native';

import PropTypes from 'prop-types';
import moment from 'moment';

import styles from './styles';
import Day from '../../atoms/Day';
import { I18N_MAP } from './i18n';


export default class Month extends PureComponent {
    static propTypes = {
        startDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(moment)]),
        endDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(moment)]),
        month: PropTypes.instanceOf(moment),
        today: PropTypes.instanceOf(moment),
        i18n: PropTypes.string,
        color: PropTypes.shape({
            mainColor: PropTypes.string,
            subColor: PropTypes.string
        })
    }

    static defaultProps = {
        startDate: undefined,
        endDate: undefined,
        month: undefined,
        today: undefined,
        i18n: 'en',
        color: {
            mainColor: '',
            subColor: ''
        }
    }


    constructor(props) {
        super(props);

        this.state = {
            renderedDays: []
        }

        this.itemId = 0;
        this.getDayList = this.getDayList.bind(this);
        this.renderDayRow = this.renderDayRow.bind(this);
        this.getMonthText = this.getMonthText.bind(this);
    }

    componentDidMount() {
        this.prepareDaysRendering();
    }

    getMonthText() {
        const { month, i18n } = this.props;

        const y = month.year();
        const m = month.month();
        if (i18n === 'en') {
            return `${I18N_MAP[i18n][m]}, ${y}`;
        } else {
            return month.format('YYYY年M月');
        }
    }


    getDayList(date) {
        // const now = Date.now()
        // console.time(`*** Month::getDayList ${now}`);

        let dayList;
        const month = date.month();
        let weekday = date.isoWeekday();
        if (weekday === 7) {
            dayList = [];
        } else {
            dayList = new Array(weekday).fill({
                empty: date.clone().subtract(1, 'h')
            });
        }
        while (date.month() === month) {
            dayList.push({
                date: date.clone()
            });
            date.add(1, 'days');
        }
        date.subtract(1, 'days');
        weekday = date.isoWeekday();
        if (weekday === 7) {
            return dayList.concat(new Array(6).fill({
                empty: date.clone().hour(1)
            }));
        }

        const result = dayList.concat(new Array(Math.abs(weekday - 6)).fill({
            empty: date.clone().hour(1)
        }));

        // console.timeEnd(`*** Month::getDayList ${now}`);

        return result;
    }

    prepareDaysRendering() {
        // console.time('*** Month::prepareDaysRendering')

        const dayList = this.getDayList(this.props.month.clone());
        const rowArray = new Array(dayList.length / 7).fill('');
        const renderedDays = rowArray.map((item, i) => {
            return this.renderDayRow(dayList.slice(i * 7, (i * 7) + 7), i)
        })

        this.setState({renderedDays})

        // console.timeEnd('*** Month::prepareDaysRendering')
    }
    
    renderDayRow(dayList, index) {
        let id = this.itemId;

        const result = (
            <View style={styles.dayRow} key={`row_${id}`}>
                {dayList.map(item =>
                    {
                      id++;
                      if (id == Number.MAX_VALUE-1) id = 0;
                      
                      return <Day
                        date={item.date}
                        empty={item.empty}
                        {...this.props}
                        key={`day_${id}`}
                      />
                    })}
            </View>
        );
        this.itemId = (id+1);

        return result;
    }

    render() {
        const { color } = this.props;
        const subColor = { color: color.subColor };
        const titleText = this.getMonthText();

        return (
            <View style={styles.month}>
                <View style={styles.monthTitle}>
                    <Text style={[styles.monthTitleText, subColor]}>{titleText}</Text>
                </View>
                <View style={styles.days}>
                    { this.state.renderedDays }
                </View>
            </View>
        );
    }
}
