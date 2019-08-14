import React, { Component } from 'react';
import {
  ScrollView, View, Text, StyleSheet, Platform
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { wlog, clog } from '../../../config-debug';
import Separator from '../../atoms/Separator';
import styles, { orderbyPickerSelectStyles } from './styles'
import { INVALID_CHILD_AGE } from '../../screens/Guests/utils';


export default class ChildrenView extends Component {
  
  constructor(props) {
    super(props);

    // from 0 to 17 years of age
    const ageRange = [...new Array(18).keys()];
    this._ageItems = ageRange.map( item => ({label:`${item}`, value: item}) );
    this._ageItems.unshift({label: 'Select Age', value: INVALID_CHILD_AGE})
  }

  componentDidCatch(error, info) {
    wlog(`[ChildrenView] componentDidCatch`, {error, info});
  }
  

  _renderChildAgeOptions(index) {
    const { onChildChange, childrenAgeValues } = this.props;
    const value = (childrenAgeValues[index] != null ? childrenAgeValues[index] : 0);
    const picker =  (
      <RNPickerSelect
        items={this._ageItems}
        onValueChange={(value) => onChildChange(index, value)}
        value={value}
        style={orderbyPickerSelectStyles}
    />
    )

    if (Platform.OS == 'android') {
      return (
        <View style={styles.androidPickerWrap}>
          { picker }
        </View>
      )
    } else {
      return picker;
    }
  }

  _renderChildren() {
    const { childrenAgeValues } = this.props;
    
    let result;
    
    try {
      result = (
        childrenAgeValues.map((item, index) => {
          return (
            <View key={`${index}_${item}`} style={styles.childOptionsContainer} >
              <Separator isHR height={2} extraStyle={styles.separator} />
              <View style={styles.childOptionsContainer2} >
                <Text style={styles.textChildTitle}>Child {`${index+1}`}</Text>
                <View style={styles.childOptions}>
                  { this._renderChildAgeOptions(index) }
                </View>
              </View>
            </View>
          )
        })
      )
    } catch (error) {
      wlog(`[ChildrenView] Error in _renderChildren`, {error, childrenAgeValues, props: this.props});
    }

    return result;
  }

  render() {
    return (
      <ScrollView>
        { this._renderChildren() }
      </ScrollView>
    )
  }
}