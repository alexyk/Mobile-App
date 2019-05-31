import React, { Component } from 'react';
import { View, Text } from 'react-native';

import PropTypes from 'prop-types';
import moment from 'moment';

import styles from './styles';
import Day from '../../atoms/Day';
import { I18N_MAP } from './i18n';
import { rlog, tslog, telog } from '../../../config-debug';
import { getObjectKeysCount } from '../../screens/utils';


export default class Month extends Component {
/*     static propTypes = {
        startDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(moment)]),
        endDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(moment)]),
        month: PropTypes.instanceOf(moment),
        today: PropTypes.instanceOf(moment),
        i18n: PropTypes.string,
        data: PropTypes.array,
        markedData: PropTypes.object,
        color: PropTypes.shape({
            mainColor: PropTypes.string,
            subColor: PropTypes.string
        })
    }
 */
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
        this._isFirst = true;
        this._internalDateFormat = 0;

        this._renderDayRow = this._renderDayRow.bind(this);
        this.getMonthText = this.getMonthText.bind(this);
    }

    componentDidMount() {
        this.prepareDaysRendering();
    }

    shouldComponentUpdate(nextProps, nextState, unknownObject) {

        if (__DEV__) {
            //TODO: Remove this debug (@@@@@debug)
            const {props,state} = this;
            const {markedData: oldMarked, data: oldData} = props;
            const {markedData: newMarked, data: newData} = nextProps;
            const {days: oldDays, date: oldDate} = oldData;
            const {days: newDays} = newData;
            const {renderedDays: oldRenderedDays} = state;
            const {renderedDays: newRenderedDays} = nextState;
            const objFormat = (label, obj1, obj2) => {
                const areEqual = (obj1 === obj2);
                if (areEqual) {
                    return '';
                } else {
                    return `[${label}] ${getObjectKeysCount(obj1)}${areEqual ? ' === ' : ' !== '}${getObjectKeysCount(obj2)}  `;
                }
            }
            let summary = objFormat('days', oldDays, newDays);
            summary += objFormat('days', oldMarked, newMarked);
            summary += objFormat('renderedDays', oldRenderedDays, newRenderedDays);

            //rlog('month-should-update',`${oldDate.format('YYYY-MMM')}    Month::shouldUpdate - ${summary}`,{nextProps, nextState, unknownObject, state, props, oldData, newData});
        }

        const result = (this._isFirst)// || this.props.markedData !== newProps.markedData);
        this._isFirst = false;

        return result;
    }

    getMonthText() {
        const { data, i18n } = this.props;
        const month = data.date;

        const y = month.year();
        const m = month.month();
        if (i18n === 'en') {
            return `${I18N_MAP[i18n][m]}, ${y}`;
        } else {
            return month.format('YYYY年M月');
        }
    }

    prepareDaysRendering() {
        // console.time('*** Month::prepareDaysRendering')

        const {days,date} = this.props.data;
        const marked = this.props.markedData;
        
        if (days) {
          let count = (days.length / 7);
          if (count < 1) count = days.length;
        //   clog(`&&&[${date.format('YYYY-MM-DD')}] count: ${days.length} -> ${count}`,{days,data:this.props.data})
          const rowArray = new Array(count).fill('');
          const renderedDays = rowArray.map((item, i) => {
            const startI =( 7*i );
            const endI = ( 7*i + 7 );
            const currentRow = (days.slice(startI, endI));
            
            // clog(`&&&current row ${date.format('YYYY-MM-DD')}`, {currentRow})

            return this._renderDayRow(currentRow, i, marked)
          })
  
          this.setState({renderedDays})
        }

        // console.timeEnd('*** Month::prepareDaysRendering')
    }

    _renderDay(item, index, id, markedData) {
        id++;
        if (id == Number.MAX_VALUE-1) id = 0;

        const {asStr, date, text} = item;
        let marked = ( (markedData && markedData[asStr]) || {}) ;
        let dayProps = { asStr, text, date, ...marked };

        const rendered = (
          <Day
            {...dayProps}
            onChoose={this.props.onChoose}
            key={`day_${id}`}
          />
        );

        return {rendered,id}
    }
    
    _renderDayRow(days, index, marked) {
        let id = this.itemId;

        const result = (
            <View style={styles.dayRow} key={`row_${id}`}>
                {days.map((item,index) => {
                    const {rendered,id:newId} = this._renderDay(item,index,id, marked)
                    id = newId;
                    return rendered;
                })}
            </View>
        );
        this.itemId = (id+1);

        return result;
    }

    render() {
        // if (__DEV__) {
        //     const d = this.props.data.date;
        //     const m = d.format('YYYY-MM');
        //     rlog('render-month', m)
        // }

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
