import React, { PureComponent } from "react";
import { TouchableOpacity, Text, View } from "react-native";
import PropTypes from "prop-types";

import styles from "./styles";
import productVersion, { debugVersion } from "../../../version";


class VersionText extends PureComponent {
  static propTypes = {
    color: PropTypes.string,
    size: PropTypes.number,
    style: PropTypes.object,
    textStyle: PropTypes.object,
    debug: PropTypes.bool
  };
  static defaultProps = {
    color: "white",
    size: 10,
    style: {},
    textStyle: {},
    debug: false
  };

  constructor(props) {
    super(props);

    this.state = {
      version: [productVersion],
      prefix: "v",
      style: [
        styles.container,
        this.props.style,
        props.debug ? { backgroundColor: "#D00" } : {}
      ],
      textStyle: [
        styles.textStyle,
        {
          color: this.props.color,
          fontSize: this.props.size
        },
        this.props.textStyle,
        props.debug ? { backgroundColor: "#0B0" } : {}
      ]
    };

    this.onVersionStringTapped = this.onVersionStringTapped.bind(this);

    this.tapsCount = 0;
    this.lastTimeout = 0;
    this.checkTapsCount = this.checkTapsCount.bind(this);
  }

  checkTapsCount() {
    if (this.tapsCount >= 5) {
      let tmp = debugVersion.split("\n");
      let asArr = [];
      tmp.forEach(item => {
          asArr.push(item);
          asArr.push("\n");
      })


      this.tapsCount = -1; // stop showing this
      this.setState({
        version: asArr,
        prefix: ""
      });
    }
  }


  onVersionStringTapped(event) {
    if (this.tapsCount != -1) {
      this.tapsCount++;
      const func = this.checkTapsCount;
      if (this.lastTimeout) {
        clearTimeout(this.lastTimeout);
      }

      this.lastTimeout = setTimeout(func, 200);
    }
  }


  _renderText(value) {
    let result = (
      <Text style={this.state.textStyle}>{value.map(item => item)}</Text>
    );

    return result;
  }

  render() {
    return (
      <View style={this.state.style}>
        <TouchableOpacity onPress={this.onVersionStringTapped}>
          {this._renderText(this.state.version)}
        </TouchableOpacity>
      </View>
    );
  }
}

export default VersionText;
