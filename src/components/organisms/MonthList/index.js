import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { FlatList, View } from 'react-native';
import moment from 'moment';
import Month from '../../molecules/Month';
import LTLoader from '../../molecules/LTLoader';
import { processError, ilog, dlog, elog, wlog } from '../../../config-debug';
import Day from '../../atoms/Day';
import monthListStyles from './styles';
import { listItemKeyGen } from '../../screens/Calendar/utils';
import { dayHeight } from '../../atoms/Day/styles';
import { monthTitlePaddingBottom, monthTitlePaddingTop, monthTitleHeight } from '../../molecules/Month/styles';

export default class MonthList extends PureComponent {
    static propTypes = {
        data: PropTypes.array,
        markedDays: PropTypes.any,
        monthsToUpdate: PropTypes.any,
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

        this._isLoading = false;

        this._itemDayRowId = 0;
        this._isFirst = true;
        this._renderedItems = [];
        this._scrollingAttemtps = 0;

        this._renderMonth = this._renderMonth.bind(this);
        this._keyExtractor = this._keyExtractor.bind(this);
        this._scrollToSelectedMonth = this._scrollToSelectedMonth.bind(this);

        this._renderedDaysPerMonth = {};
        this._getItemLayout = this._getItemLayout.bind(this);
    }


    componentDidCatch(error, errorInfo) {
        processError(`[MonthList] Error in component: ${error.message}`, {error,errorInfo});
    }


    _keyExtractor(item) {
        return item.id;
    }


    _getItemLayout(data,index) {
        // ilog(`[month::getItemLayout] index:${index}`,{data,index})

        //const titleHeight = monthTitleHeight + monthTitlePaddingTop;
        const titleHeight = monthTitleHeight + monthTitlePaddingBottom;
        const itemHeight = (rowsHeight + titleHeight);
        const rowsCount = ( (data && data.days)
                    ? Math.round(data.days.length / 7)
                    : 0
        );
        const rowsHeight = ( rowsCount * dayHeight );

        return {
            length: itemHeight,
            offset:  itemHeight * index, //(index > 0 ? index+1 : 0),
            index
        }
    }
    

    //TODO: fix this
    _scrollToSelectedMonth() {
        setTimeout(() => {
            const { startDate, minDate } = this.props;
            const date1 = minDate.startOf('month');
            const date2 = startDate.startOf('month');
            const index = date2.diff(date1, 'months');

            ilog(`[MonthList] scrolling to index ${index}`);

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
                processError(`[MonthList] Trying to scroll to index ${index} failed - this.list or item is not defined. Try again: ${tryAgain}`,{hasList:(this.list != null),hasItem: (item!=null),tryAgain});
            }
        }, 200);
    }


    _renderDay(item, index, markedData) {
        let {id, asStr, date, text} = item;
        let marked = ( (markedData && markedData[asStr]) || {});
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
        
        const {data, monthsToUpdate, color} = this.props;
        const { asStr, id } = item;
        const shouldUpdate = monthsToUpdate[asStr];
        
        let renderedDays = this._renderedDaysPerMonth[asStr];
        
        if (monthsToUpdate[asStr] == true) { // should update
            renderedDays = this._prepareDaysRendering(item, renderedDays);
            this._renderedDaysPerMonth[asStr] = renderedDays;
        }
        
        // ilog(`[month ${asStr}]`,{renderedDays, data, item, monthsToUpdate, asStr, id, shouldUpdate})

        const result = (
        <Month
            data={item}
            renderedDays={renderedDays}
            shouldUpdate={shouldUpdate}
            color={color}
            key={id}
        />
        );
        this._renderedItems[index] = result;

        return result;
    }


                        // Virtualised List
                        // updateCellsBatchingPeriod={100}
                        // maxToRenderPerBatch={3}
                        // initialNumToRender={2}
                        // windowSize={10}
                        // other
                        // ListView
                        // legacyImplementation={true}

    render() {
        const { data } = this.props;

        const dataLen = ( data ? data.length : -1 );
        // const renderedLen = ( this._renderedItems ? Object.keys(this._renderedItems).length : -1 );

        const isLoading = ( dataLen == -1 );
        if (this._isFirst && dataLen > 0) {
            this._isFirst = false;
            this._scrollToSelectedMonth();
        }

        //ilog(`[monthlist]  isLoading:${isLoading}  renderedLen: ${renderedLen} dataLen: ${dataLen}`);

        return (
            <View style={{flex:1}}>
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
                <LTLoader message={'Loading ...'} isLoading={isLoading} opacity={'FF'} />
            </View>
        )
    }
}
