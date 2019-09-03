import React, { Component } from "react";
import { ScrollView, View, Text } from "react-native";
import ChildrenView from "../ChildrenView";

export default class ChildrenRooms extends Component {
  constructor(props) {
    super(props);
  }

  _renderContent() {
    const { data, cache, onChildeAgeChange, onCountChange } = this.props;
    const { rooms, childrenAgeValues, children } = data;

    let items = childrenAgeValues.map((item, index) => {
      return (
        <ChildrenView
          key={`${index}_${item.join("_")}`}
          index={index}
          ageValues={item}
          onChildeAgeChange={onChildeAgeChange}
          onCountChange={onCountChange}
          cache={cache}
        />
      );
    });

    return <ScrollView>{items}</ScrollView>;
  }

  render() {
    const { hasChildren } = this.props;

    return hasChildren ? this._renderContent() : null;
  }
}
