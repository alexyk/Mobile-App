import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { FlatList } from 'react-native';
import moment from 'moment';
import Month from '../../molecules/Month';
import LTLoader from '../../molecules/LTLoader';
import { processError, rlog, ilog } from '../../../config-debug';

export default class MonthList extends PureComponent {
    static propTypes = {
        data: PropTypes.array,
        markedData: PropTypes.any,
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
        this._scrollingAttemtps = 0;

        this._renderMonth = this._renderMonth.bind(this);
        this._keyExtractor = this._keyExtractor.bind(this);
        // this.shouldUpdate = this.shouldUpdate.bind(this);
        this.checkRange = this.checkRange.bind(this);
        this.getWeekNums = this.getWeekNums.bind(this);
        this._scrollToSelectedMonth = this._scrollToSelectedMonth.bind(this);
    }

    componentDidCatch(error, errorInfo) {
        processError(`[MonthList] Error in component: ${error.message}`, {error,errorInfo});
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

        rlog(`month-list`,`Start: ${start} End: ${end} Total Weeks: ${total}`)

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

    _scrollToSelectedMonth() {
        setTimeout(() => {
            const { startDate, minDate } = this.props;
            const date1 = minDate.startOf('month');
            const date2 = startDate.startOf('month');
            const index = date2.diff(date1, 'months');

            ilog(`[MonthList] scrolling to index ${index}`)
            const item = this._renderedItems[index];
            if (this.list && item) {
                this.list.scrollToItem({ item, animated: true });
            } else {
                const tryAgain = (this._scrollingAttemtps < 3);
                if (tryAgain) {
                    this._scrollingAttemtps++;
                    this._scrollToSelectedMonth();
                }
                processError(`[MonthList] Trying to scroll to index ${index} failed - this.list or item is not defined. Try again: ${tryAgain}`,{hasList:(this.list != null),hasItem: (item!=null),tryAgain});
            }
        }, 200);
    }


    _renderMonth({item,index}) {

        const {markedData, color, onChoose} = this.props;

      //console.log('&&&render',`Result: ${item.days?item.days.length:'n/a'}`,{item,index,props:this.props})
      //clog(`&render `,{item,index,markedData});
    //   clog(`&prender `,{item,index,markedData,props:this.props});

      const result = (
        <Month
            data={item}
            markedData={markedData}
            color={color}
            onChoose={onChoose}
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
                        // Virtualised List
                        // updateCellsBatchingPeriod={100}
                        // maxToRenderPerBatch={3}
                        // initialNumToRender={2}
                        // windowSize={10}
                        // other
                        // ListView
                        // legacyImplementation={true}

                    />
        );

        if (this.isFirst && data && data.length > 0) {
            this.isFirst = false;
            this._scrollToSelectedMonth();
        }

        return result;
    }
}
