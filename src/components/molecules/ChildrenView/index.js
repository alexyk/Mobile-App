import React, { Component } from "react";
import { View, Text } from "react-native";
import Separator from "../../atoms/Separator";
import GuestRow from "../GuestRow";
import styles from "./styles";
import { INVALID_CHILD_AGE } from "../../screens/Guests/utils";
import { HOTEL_ROOM_LIMITS } from "../../../config-settings";
import LTPicker from "../LTPicker";
import { wlog } from "../../../utils/debug/debug-tools";

export default class ChildrenView extends Component {
  constructor(props) {
    super(props);

    this._childrenRenderedItems = [];

    // from 0 to 17 years of age
    const ageRange = [...new Array(18).keys()];
    this._ageItems = ageRange.map(item => ({ label: `${item}`, value: item }));
    this._ageItems.unshift({ label: "Select Age", value: INVALID_CHILD_AGE });
  }

  componentDidCatch(error, info) {
    wlog(`[ChildrenView] componentDidCatch`, { error, info });
  }

  _renderChildAgeOptions(index, value, roomIndex) {
    const { onChildeAgeChange } = this.props;

    const props = {
      key: `${index}_${value}`,
      value,
      data: this._ageItems, 
      extraDataOnChange: {roomIndex, childIndex: index},
      placeholder: { label: "", value: null },
      containerStyle: {paddingHorizontal: 10},
      onValueChange: onChildeAgeChange,
      // styles: {container:{height: 40, backgroundColor: 'pink'}, picker: {height: 40, } },
    };

    return (
      <LTPicker {...props} />
    )
  }

  _renderTitle(index) {
    return <Text style={styles.textTitle}>{`Room ${index + 1}`}</Text>;
  }

  _renderInput(count, index, onCountChange, withTitle = true) {
    if (withTitle) {
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
      );
    } else {
      return (
        <GuestRow
          type={"children"}
          min={HOTEL_ROOM_LIMITS.MIN.CHILDREN_PER_ROOM}
          max={HOTEL_ROOM_LIMITS.MAX.CHILDREN_PER_ROOM}
          count={count}
          index={index}
          containerStyle={{ width: "auto" }}
          onChanged={onCountChange}
        />
      );
    }
  }

  _renderChildAgeSelectors(ageValues, roomIndex) {
    const withTitle = false;
    const { cache } = this.props;

    try {
      ageValues.map((childAge, index) => {
        if (
          this._childrenRenderedItems[index] &&
          cache[roomIndex] &&
          cache[roomIndex][index] != null &&
          cache[roomIndex][index] == childAge
        ) {
          return this._childrenRenderedItems[index];
        }

        let newItem;

        if (withTitle) {
          newItem = (
            <View key={`${index}_${childAge}`} style={styles.childOptionsContainer}>
              <Separator isHR height={2} extraStyle={styles.separator} />
              <View style={styles.childOptionsContainer2}>
                <Text style={styles.textChildTitle}>
                  Child {`${index + 1}`}
                </Text>
                <View style={styles.childOptionsVertical}>
                  {this._renderChildAgeOptions(index, childAge, roomIndex)}
                </View>
              </View>
            </View>
          );
        } else {
          newItem = (
            <View style={styles.childOptionsHorizontal}>
              { this._renderChildAgeOptions(index, childAge, roomIndex) }
            </View>
          )
        }

        this._childrenRenderedItems[index] = newItem;

        return newItem;
      });

      return (
        <View
          style={{
            flexDirection: (withTitle ? "column" : "row"),
            justifyContent: (withTitle ? "center" : "flex-end"),
            marginTop: 5,
            marginBottom: 15,
            marginRight: 15,
          }}
        >
          {this._childrenRenderedItems}
        </View>
      );
    } catch (error) {
      wlog(`[ChildrenView] Error in _renderChildAgeSelectors`, {
        error,
        ageValues,
        props: this.props
      });
    }

    return result;
  }

  render() {
    const { index, ageValues, onCountChange } = this.props;
    const count = ageValues ? ageValues.length : 0;

    return (
      <View style={{ marginLeft: 20 }}>
        <View
          style={{
            marginLeft: 10,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          {this._renderTitle(index)}
          {this._renderInput(count, index, onCountChange, false)}
        </View>

        {this._renderChildAgeSelectors(ageValues, index)}
      </View>
    );
  }
}
