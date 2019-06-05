import moment from 'moment';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { FlatList, View, Dimensions } from 'react-native';
import { processError } from '../../../config-debug';
import Day from '../../atoms/Day';
import { dayHeight } from '../../atoms/Day/styles';
import Month from '../../molecules/Month';
import { monthTitleHeight } from '../../molecules/Month/styles';
import { listItemKeyGen } from '../../screens/Calendar/utils';
import monthListStyles from './styles';


export default class MonthList extends PureComponent {
    static propTypes = {
        data: PropTypes.array,
        markedDays: PropTypes.any,
        markedMonths: PropTypes.any,
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

        this._itemDayRowId = 0;
        this._isFirst = true;
        this._scrollingAttemtps = 0;
        this._renderedDaysPerMonth = {};

        this._renderMonth = this._renderMonth.bind(this);
        this._keyExtractor = this._keyExtractor.bind(this);
        this._scrollToSelectedMonth = this._scrollToSelectedMonth.bind(this);
        this._getItemLayout = this._getItemLayout.bind(this);
        this._getRenderedMonth = this._getRenderedMonth.bind(this);
        this._setItemLayout = this._setRenderedMonth.bind(this);
    }


    componentDidCatch(error, errorInfo) {
        processError(`[MonthList] Error in component: ${error.message}`, {error,errorInfo});
    }


    _getRenderedMonth(asStr) {
        return this._renderedDaysPerMonth[asStr];
    }


    _setRenderedMonth(asStr, data) {
        this._renderedDaysPerMonth[asStr] = data;
    }


    _keyExtractor(item) {
        return item.id;
    }

    _getItemHeight(data,index,heightCorrection,rowCorrection) {
        const item = data[index];
            
        const titleHeight = monthTitleHeight;
        const rowsCount = ( (item && item.days)
            ? Math.round(item.days.length / 7)
            : 0
        );
        const rowHeight = (dayHeight + rowCorrection);
        const rowsHeight = ( rowsCount * (rowHeight) );
        const itemHeight = rowsHeight + titleHeight + heightCorrection;

        return itemHeight;

    }


    _getItemLayout(data,currentIndex) {
        let offset = 0;
        const extraOffset = 0;
        const heightCorrection = 0;
        const rowCorrection = 4;
        const currentItemHeight = this._getItemHeight(data,currentIndex,heightCorrection,rowCorrection);
        
        for (let index = currentIndex-1; index >= 0; index--) {
            const itemHeight = this._getItemHeight(data,index,heightCorrection,rowCorrection);
            offset += itemHeight;
        }
        offset += (currentIndex > 0 ? extraOffset : 0);

        return {
            offset,
            length: currentItemHeight,
            index: currentIndex
        }
    }
    

    //TODO: fix this
    _scrollToSelectedMonth() {
        // detach from current code execution - for smooth animation
        setTimeout(() => {
            const { startDate, minDate } = this.props;
            const date1 = minDate.clone().startOf('month');
            const date2 = startDate.clone().startOf('month');
            const index = date2.diff(date1, 'months');

            if (this.list && index > -1) {
                // const viewOffset = ;
                // const viewPosition = ;
                this.list.scrollToIndex({ index, animated: true });
            } else {
                const tryAgain = (this._scrollingAttemtps < 3);
                if (tryAgain) {
                    this._scrollingAttemtps++;
                    this._scrollToSelectedMonth();
                }
                processError(`[MonthList] Trying to scroll to index ${index} failed - this.list or item is not defined. Try again: ${tryAgain}`,{hasList:(this.list != null),tryAgain});
            }
        }, 200);
    }


    _renderDay(item, index, markedData) {
        let {id, asStr, date, text} = item;
        let marked = ( (markedData && markedData[asStr]) || {});
        if (marked.isEmpty == null) {
            marked.isEmpty = (date == null);
        }
        if (marked.isValid == null) {
            marked.isValid = (!marked.isEmpty);
        }
        if (id == null) {
            id = listItemKeyGen('DAY_ID', 'day_na_');
        }

        let dayProps = {
            id,
            asStr,
            text,
            date,
            ...marked
        };

        const rendered = (
          <Day
            {...dayProps}
            onChoose={this.props.onChoose}
            key={id}
          />
        );

        return rendered;
    }
    

    _renderDaysRow(days, index, marked, id) {
        const result = (
            <View style={monthListStyles.dayRow} key={id} >
                {days.map(
                    (item,index) => this._renderDay(item, index, marked)
                )}
            </View>
        );

        return result;
    }


    _prepareDaysRendering(data, defaultResult) {
        // console.time('*** Month::prepareDaysRendering')

        const {days} = data;
        
        if (days) {
            const marked = this.props.markedDays;
            let count = (days.length / 7);
            if (count < 1) count = days.length;
            const rowArray = new Array(count).fill('');
            const renderedDays = rowArray.map((item, i) => {
                const startI =( 7*i );
                const endI = ( 7*i + 7 );
                const currentRow = (days.slice(startI, endI));
                const rowId = listItemKeyGen('DAYS_ROW_ID', 'days_row');
                
                return this._renderDaysRow(currentRow, i, marked, rowId)
            })

            return renderedDays;
        }

        return defaultResult;
        // console.timeEnd('*** Month::prepareDaysRendering')
    }



    _renderMonth({item,index}) {
        const {
            markedMonths, color,
        } = this.props;

        const { asStr, id } = item;
        const shouldUpdate = markedMonths[asStr];
        
        let renderedDays = this._getRenderedMonth[asStr];
        
        // Optimization of month rendering)
        // (should update if true)
        if (markedMonths[asStr] == true || renderedDays == null) {
            renderedDays = this._prepareDaysRendering(item, renderedDays);
            this._setRenderedMonth(asStr, renderedDays);
        }
 
        const result = (
            <Month
                data={item}
                renderedDays={renderedDays}
                shouldUpdate={shouldUpdate}
                color={color}
                key={id}
            />
        );

        return result;
    }

    
    render() {
        const { data } = this.props;
        const dataLen = (data ? data.length : -1);

        if (this._isFirst && dataLen > 0) {
            this._isFirst = false;
            this._scrollToSelectedMonth();
        }

        return (
            <View style={{flex:1}}>
            {

                <FlatList
                    ref={(list) => { this.list = list; }}
                    style={{flex: 1}}
                    data={data}
                    style={{paddingHorizontal:10}}
                    keyExtractor={this._keyExtractor}
                    renderItem={this._renderMonth}
                    getItemLayout={this._getItemLayout}
                    // onScrollToIndexFailed={(data)=>{wlog({data})}}
                />

            }
            </View>
        )
    }
}
