import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Dimensions, FlatList } from 'react-native';
import moment from 'moment';
import Month from '../../molecules/Month';
import LTLoader from '../../molecules/LTLoader';
import { processError } from '../../../config-debug';

const { width } = Dimensions.get('window');
export default class MonthList extends PureComponent {
    static propTypes = {
        data: PropTypes.array,
        inputFormat: PropTypes.string,
        minDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(moment)]),
        startDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(moment)]),
        endDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(moment)])
    }

    static defaultProps = {
        inputFormat: '',
        minDate: '',
        startDate: '',
        endDate: ''
    }

    constructor(props) {
        super(props);

        this.itemKey = 0;
        this.isFirst = true;
        this._renderedItems = [];

        this._renderMonth = this._renderMonth.bind(this);
        this._keyExtractor = this._keyExtractor.bind(this);
        // this.shouldUpdate = this.shouldUpdate.bind(this);
        this.checkRange = this.checkRange.bind(this);
        this.getWeekNums = this.getWeekNums.bind(this);
        this.scrollToSelectedMonth = this.scrollToSelectedMonth.bind(this);
    }

    _keyExtractor() {
        this.itemKey++;

        if (this.itemKey == Number.MAX_VALUE) {
            this.itemKey = 0;
        }

        return this.itemKey.toString();
    }

    getWeekNums(start, end) {
        const clonedMoment = moment(start, this.props.inputFormat);
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

        console.tron.mylog(`month-list`,`Start: ${start} End: ${end} Total Weeks: ${total}`)

        return total;
    }

    /*shouldUpdate(month, props) {
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
    }*/

    checkRange(date, start, end) {
        if (!date || !start) return false;
        if (!end) return date.year() === start.year() && date.month() === start.month();
        if (date.year() < start.year() || (date.year() === start.year() && date.month() < start.month())) return false;
        if (date.year() > end.year() || (date.year() === end.year() && date.month() > end.month())) return false;
        return true;
    }

    scrollToSelectedMonth() {        
        setTimeout(() => {
            const { startDate, minDate } = this.props;
            const date1 = minDate.startOf('month');
            const date2 = startDate.startOf('month');
            const index = date2.diff(date1, 'months');
    
            console.log(`[MonthList] scrolling to index ${index}`)
                const item = this._renderedItems[index];
            if (this.list && item) {
                this.list.scrollToItem({ item, animated: true });
            } else {
                processError(`[MonthList] Trying to scroll to index ${index} failed - this.list or item is not defined`,{has_list:(this.list != null),has_item: (item!=null)});
            }
        }, 200);
    }


    _renderMonth({item,index}) {
        const result = (
            <Month
                key={`${this.itemId}`}
                data={item}
                color={this.props.color}
                onChoose={this.props.onChoose}
            />
        );
        this._renderedItems[index] = result;

        return result;
    }

    render() {
        const {data} = this.props;

        let result = (
            (!data || data.length == 0) 
                ? <LTLoader message={'Loading ...'} isLoading={true} opacity={'FF'} />
                :
                    <FlatList
                        ref={(list) => { this.list = list; }}
                        style={{flex: 1}}
                        data={data}
                        style={{paddingHorizontal:10}}
                        keyExtractor={this._keyExtractor}
                        renderItem={this._renderMonth}
                    />
        );

        if (this.isFirst && data && data.length > 0) {
            this.isFirst = false;
            this.scrollToSelectedMonth();
        }

        return result;
    }
}
