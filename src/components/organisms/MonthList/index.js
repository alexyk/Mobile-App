import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { FlatList, View, Dimensions } from 'react-native';
import moment from 'moment';
import Month from '../../molecules/Month';
import shortid from 'shortid'
import { log, logd } from '../../../config-debug'

const { width } = Dimensions.get('window');
export default class MonthList extends PureComponent {
    static propTypes = {
        format_input: PropTypes.string,
        minDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(moment)]),
        startDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(moment)]),
        endDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(moment)])
    }

    static defaultProps = {
        format_input: '',
        minDate: '',
        startDate: '',
        endDate: ''
    }

    constructor(props) {
        super(props);

        this.state = {data: this.getMonthList()};
        this.monthList = [];

        this._renderMonth = this._renderMonth.bind(this);
        this.shouldUpdate = this.shouldUpdate.bind(this);
        this.checkRange = this.checkRange.bind(this);
        this.getWeekNums = this.getWeekNums.bind(this);
        this.scrollToSelectedMonth = this.scrollToSelectedMonth.bind(this);
    }

    componentDidMount() {
        if (this.props.startDate) {
            // this.scrollToSelectedMonth();
        }
    }

    getMonthList(props) {
        const minDate = (props || this.props).minDate.clone().date(1);
        const maxDate = (props || this.props).maxDate.clone();
        const monthList = [];
        if (!maxDate || !minDate) return monthList;
        while (maxDate > minDate || (
            maxDate.year() === minDate.year() &&
            maxDate.month() === minDate.month()
        )) {
            const month = {
                date: minDate.clone()
            };
            month.shouldUpdate = this.shouldUpdate(month, props);
            monthList.push(month);
            minDate.add(1, 'month');
        }

        return monthList;
    }

    getWeekNums(start, end) {
        const clonedMoment = moment(start, this.props.format_input);
        let date;
        let day;
        let num;
        let y;
        let m;
        let total = 0;
        while (!clonedMoment.isSame(end, 'months')) {
            y = clonedMoment.year();
            m = clonedMoment.month();
            date = new Date(y, m, 1);
            day = date.getDay();
            num = new Date(y, m + 1, 0).getDate();
            total += Math.ceil((num + day) / 7);
            clonedMoment.add(1, 'months');
        }
        return total;
    }

    shouldUpdate(month, props) {
        if (!props) return false;
        const {
            startDate,
            endDate
        } = props;
        const {
            date
        } = month;
        const next = this.checkRange(date, startDate, endDate);
        const prev = this.checkRange(date, this.props.startDate, this.props.endDate);
        if (prev || next) return true;
        return false;
    }

    checkRange(date, start, end) {
        if (!date || !start) return false;
        if (!end) return date.year() === start.year() && date.month() === start.month();
        if (date.year() < start.year() || (date.year() === start.year() && date.month() < start.month())) return false;
        if (date.year() > end.year() || (date.year() === end.year() && date.month() > end.month())) return false;
        return true;
    }

    scrollToSelectedMonth() {
        const { startDate, minDate } = this.props;
        const monthOffset = ((12 * (startDate.year() - minDate.year())) + startDate.month()) - minDate.month();
        const weekOffset = this.getWeekNums(minDate, startDate);

        setTimeout(() => {
            this.list.scrollToOffset({
                offset: (monthOffset * (24 + 25)) + (monthOffset ? weekOffset * Math.ceil((width / 7) + 10) : 0),
                animated: true
            });
        }, 400);
    }


    _renderMonth({item, index}) {
        let props = { ...this.props };
        const {startDate, endDate} = props;
        
        if (startDate == '') {
            props.startDate = undefined;
        }
        if (endDate == '') {
            props.endDate = undefined;
        }
        
        const month = (item.date || {});
        
        return (
            <Month
                month={month}
                {...props}
            />
        );
    }

    render() {
        const result = (
            <FlatList
                ref={(list) => { this.list = list; }}
                style={{flex: 1}}
                data={this.state.data}
                extractData={this.state.data}
                keyExtractor={item => shortid.generate()}
                renderItem={this._renderMonth}
            />
        );

        return result;
    }
}
