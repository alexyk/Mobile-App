import React, { Component } from 'react';
import { View, Text, Platform } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { wlog } from '../../../config-debug';
import Separator from '../../atoms/Separator';
import styles, { orderbyPickerSelectStyles } from './styles'
import { INVALID_CHILD_AGE } from '../../screens/Guests/utils';
import GuestRow from '../GuestRow';
import { HOTEL_ROOM_LIMITS } from '../../../config-settings';


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
  

  _renderChildAgeOptions(index, childrenAgeValues) {
    const { onChildChange } = this.props;
    const value = (childrenAgeValues[index] != null ? childrenAgeValues[index] : 0);

    const picker =  (
      <RNPickerSelect
        key={`${index}_${value}`}
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


  _renderTitle(index) {
    return (
      <Text style={styles.textTitle}>{`Room ${index+1}`}</Text>
    )
  }


  _renderInput(count, index, onCountChange) {
    return (
      <GuestRow
        type={"children"}
        title={"Children"} 
        subtitle={"Age 0-17"}
        min={HOTEL_ROOM_LIMITS.MIN.CHILDREN_PER_ROOM}
        max={HOTEL_ROOM_LIMITS.MAX.CHILDREN_PER_ROOM}
        count={count}
        index={index}
        onChanged={onCountChange}
      />
    )

  }


  _renderChildren(ageValues, roomIndex) {
    let result;
    
    try {
      result = (
        ageValues.map((item, index) => {
          return (
            <View key={`${index}_${item}`} style={styles.childOptionsContainer} >
              <Separator isHR height={2} extraStyle={styles.separator} />
              <View style={styles.childOptionsContainer2} >
                <Text style={styles.textChildTitle}>Child {`${index+1}`}</Text>
                <View style={styles.childOptions}>
                  { this._renderChildAgeOptions(index, item, roomIndex) }
                </View>
              </View>
            </View>
          )
        })
      )
    } catch (error) {
      wlog(`[ChildrenView] Error in _renderChildren`, {error, ageValues, props: this.props});
    }

    return result;
  }


  render() {
    const { index, ageValues, onCountChange } = this.props;
    const count = (ageValues ? ageValues.length : 0);

    return (
      <View style={{marginHorizontal: 15}}>

        { this._renderTitle(index) }

        <View style={{marginHorizontal: 10}}>

          { this._renderInput(count, index, onCountChange) }
          { this._renderChildren(ageValues, index) }

        </View>
      </View>
    )
  }
}