import React, { Component } from "react";
import { View, Text, Dimensions, Image } from "react-native";
import SideSwipe from "react-native-sideswipe";
import { getSafeTopOffset } from "../../../utils/designUtils";

export default class ImageSlides extends Component {
  constructor(props) {
    super(props);
    this.state = { currentIndex: 0 };
  }

  _renderImageSlides(images, logoWidth, logoHeight) {
    const contentOffset = 0;

    return (
      <SideSwipe
        index={this.state.currentIndex}
        itemWidth={logoWidth}
        style={{ width: logoWidth, marginTop: 70 }}
        data={images}
        contentOffset={contentOffset}
        onIndexChange={index => this.setState(() => ({ currentIndex: index }))}
        renderItem={data => this._renderImage(data, logoWidth, logoHeight)}
      />
    );
  }

  _renderSlideNumber(current, total) {
    return (
      <View
        style={{
          position: "absolute",
          bottom: 40,
          right: 30,
          backgroundColor: "#abc9",
          padding: 5,
          borderRadius: 10
        }}
      >
        <Text>{`${current} / ${total}`}</Text>
      </View>
    );
  }

  _renderImage(
    { itemIndex, currentIndex, item, animatedValue },
    width,
    height
  ) {
    return (
      <Image style={{ width, height }} source={item} resizeMode="stretch" />
    );
  }

  render() {
    const { height, data, style } = this.props;
    const { currentIndex } = this.state;

    const { width: windowWidth, height: windowHeight } = Dimensions.get(
      "window"
    );
    const logoWidth = windowWidth;
    const logoHeight =
      height != null ? height : windowHeight * 0.3 + getSafeTopOffset();

    const hasItems = data != null && data.length > 0;

    return (
      <View style={style}>
        {this._renderImageSlides(data, logoWidth, logoHeight)}
        {this._renderSlideNumber(currentIndex + 1, hasItems ? data.length : 0)}
      </View>
    );
  }
}
