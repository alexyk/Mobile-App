import React, { Component } from "react";
import { View, Text } from "react-native";
import { wlog } from "../../../config-debug";
import Separator from "../../atoms/Separator";
import GuestRow from "../GuestRow";
import styles from "./styles";
import { INVALID_CHILD_AGE } from "../../screens/Guests/utils";
import { HOTEL_ROOM_LIMITS } from "../../../config-settings";
import LTPicker from "../LTPicker";

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
      id: `${index}_${value}`,
      value,
      data: this._ageItems, 
      extraDataOnChange: {roomIndex, childIndex: index},
      placeholder: { label: "", value: null },
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

  _renderChildren(ageValues, roomIndex) {
    const withTitle = false;
    const { cache } = this.props;

    try {
      ageValues.map((item, index) => {
        if (
          this._childrenRenderedItems[index] &&
          cache[roomIndex] &&
          cache[roomIndex][index] != null &&
          cache[roomIndex][index] == item
        ) {
          return this._childrenRenderedItems[index];
        }

        let newItem;

        if (withTitle) {
          newItem = (
            <View key={`${index}_${item}`} style={styles.childOptionsContainer}>
              <Separator isHR height={2} extraStyle={styles.separator} />
              <View style={styles.childOptionsContainer2}>
                <Text style={styles.textChildTitle}>
                  Child {`${index + 1}`}
                </Text>
                <View style={styles.childOptions}>
                  {this._renderChildAgeOptions(index, item, roomIndex)}
                </View>
              </View>
            </View>
          );
        } else {
          newItem = this._renderChildAgeOptions(index, item, roomIndex);
        }

        this._childrenRenderedItems[index] = newItem;

        return newItem;
      });

      return (
        <View
          style={{
            flexDirection: (withTitle ? "column" : "row"),
            justifyContent: (withTitle ? "center" : "flex-end"),
            marginBottom: 10
          }}
        >
          {this._childrenRenderedItems}
        </View>
      );
    } catch (error) {
      wlog(`[ChildrenView] Error in _renderChildren`, {
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
      <View style={{ marginHorizontal: 15 }}>
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

        {this._renderChildren(ageValues, index)}
      </View>
    );
  }
}
