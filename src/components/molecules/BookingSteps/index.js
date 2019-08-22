import React, { Component } from "react";
import HTMLView from "react-native-htmlview";
import styles, { htmlViewStyleSheet } from "./styles";

export default class BookingSteps extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { items, selectedIndex } = this.props;
    const count = items.length;
    let htmlContent = "<body>";

    items.forEach((text, index) => {
      const separator = index < count - 1 ? " <grey>></grey> " : "";
      if (index == selectedIndex) {
        htmlContent += `<b>${text}</b>`;
      } else {
        htmlContent += `${text}`;
      }
      htmlContent += separator;
    });
    htmlContent += "</body>";

    return (
      <HTMLView
        value={htmlContent}
        stylesheet={htmlViewStyleSheet}
        style={styles.main}
      />
    );
  }
}
