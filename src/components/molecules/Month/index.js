import React, { Component } from 'react';
import { View, Text } from 'react-native';

import PropTypes from 'prop-types';
import styles from './styles';
import { I18N_MAP } from './i18n';
import { ilog } from '../../../config-debug';

export default class Month extends Component {
    static propTypes = {
        i18n: PropTypes.string,
        color: PropTypes.shape({
            mainColor: PropTypes.string,
            subColor: PropTypes.string
        })
    }

    static defaultProps = {
        i18n: 'en',
        color: {
            mainColor: '',
            subColor: ''
        }
    }


    constructor(props) {
        super(props);
        this._getMonthText = this._getMonthText.bind(this);
    }

    shouldComponentUpdate(nextProps) {
        return (nextProps.shouldUpdate == true);
    }


    _getMonthText() {
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

    render() {
        const { color, data } = this.props;
        // const { asStr } = data;
        const subColor = { color: color.subColor };
        const titleText = this._getMonthText();

        //ilog(`[month ${asStr}]`,{days:this.props.renderedDays, props: this.props})

        return (
            <View style={styles.month}>
                <View style={styles.monthTitle}>
                    <Text style={[styles.monthTitleText, subColor]}>{titleText}</Text>
                </View>
                <View style={styles.days}>
                    { this.props.renderedDays }
                </View>
            </View>
        );
    }
}
