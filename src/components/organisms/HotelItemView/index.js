import React, { Component } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { connect } from "react-redux";
import Image from "react-native-remote-svg";
import CardView from "react-native-cardview";
import PropTypes from "prop-types";
import { imgHost } from "../../../config";
import {
  DEFAULT_HOTEL_PNG,
  showNumberOnHotelItem,
  hotelSearchIsNative
} from "../../../config-settings";
import _ from "lodash";
import FastImage from "react-native-fast-image";
import { RoomsXMLCurrency } from "../../../services/utilities/roomsXMLCurrency";
import { CurrencyConverter } from "../../../services/utilities/currencyConverter";
import LocPrice from "../../atoms/LocPrice";

import styles, { imageHeight } from "./styles";
import lang from "../../../language";
import LTIcon from "../../atoms/LTIcon";
import { SCREEN_SIZE } from "../../../utils/designUtils";

class HotelItemView extends Component {
  static propTypes = {
    item: PropTypes.object,
    gotoHotelDetailsPage: PropTypes.func.isRequired,
    daysDifference: PropTypes.number,
    isDoneSocket: PropTypes.bool.isRequired
  };

  static defaultProps = {
    item: {},
    daysDifference: 1,
    isDoneSocket: false
  };

  constructor(props) {
    super(props);
    //console.log('item props',props)
    this.onPress = this.onPress.bind(this);
  }

  componentDidCatch(error, errorInfo) {
    processError(`[HotelItemView] Error in component: ${error.message}`, {
      error,
      errorInfo
    });
  }

  shouldComponentUpdate(newProps, newState, newContext) {
    const { item } = newProps;
    const oldItem = this.props.item;
    const oldIsDoneSocket = this.props.isDoneSocket;

    return (
      oldItem.price != item.price || oldIsDoneSocket != newProps.isDoneSocket
    );
  }

  onPress = event => {
    const item = this.props.item;

    // console.log("[HotelItemView] On Press", item);
    // log('hotel-item', `On Press: image:${item.hotelPhoto.url} thumb:${item.thumbnail.url}`, {item})

    if (hotelSearchIsNative.step2HotelDetails) {
      // native
      this.props.gotoHotelDetailsPage(item);
    } else {
      const { props, state } = this.props.parent;
      const extraParams = {
        currency: this.props.currency,
        baseUrl: `mobile/hotels/listings/${item.id}?`,
        token: props.navigation.state.params.token,
        email: props.navigation.state.params.email,
        propertyName: item.name,
        title: lang.TEXT.SEARCH_HOTEL_DETAILS_TILE,
        isHotel: true
      };
      // gotoWebview(state, props.navigation, extraParams);
      this.props.gotoHotelDetailsPage(item, state, extraParams);
    }
  };

  renderStars = stars => {
    if (stars == null) return null;

    const count = stars;
    const indents = [];
    for (let i = 0; i < count; i++) {
      indents.push(
        <LTIcon
          key={`star_${i}_${stars}`}
          textStyle={{ color: "#a3c5c0" }}
          name={"star"}
        />
      );
    }
    for (let i = count; i < 5; i++) {
      indents.push(
        <LTIcon
          key={`star_${i}_${stars}`}
          textStyle={{ color: "#dddddd" }}
          name={"star"}
        />
      );
    }
    return indents;
  };

  renderPrice() {
    const { exchangeRates, currency, item, currencySign } = this.props;

    let price = item.price;
    let isPriceReady = price != null;
    let fiatPrice = 0;
    let priceToFixed2 = 0;

    const rates = exchangeRates.currencyExchangeRates;
    const roomCurrency = RoomsXMLCurrency.get();
    const days = this.props.daysDifference;

    let content = null;

    const converted = CurrencyConverter.convert(
      rates,
      roomCurrency,
      currency,
      price
    );
    if (converted != null) {
      price = (converted / days).toFixed(2);
    } else {
      isPriceReady = false;
    }

    if (isPriceReady) {
      fiatPrice = (price / days).toFixed(0);
      priceToFixed2 = parseFloat(price).toFixed(2);

      //const { props, state, isAllHotelsLoaded } = this.props.parent;
      //log('@@hotel-item', `Item price, fiatPrice:${fiatPrice}, days:${days}, priceToFixed2:${priceToFixed2}, price-ready:${isPriceReady}`, {props,state,item,currencySign,converted,days,price,fiatPrice,days,priceToFixed2})

      content = (
        <View style={styles.costView}>
          <Text style={styles.cost} numberOfLines={1} ellipsizeMode="tail">
            {currencySign}
            {priceToFixed2}
            {"  "}
          </Text>
          {/* <Text style={styles.costLoc} numberOfLines={1} ellipsizeMode="tail"> (LOC {parseFloat(price/locRate).toFixed(2)}) </Text> */}
          <LocPrice
            style={styles.costLoc}
            fiat={fiatPrice}
            fromParentType={0}
          />
          <Text style={styles.perNight}>{" / night"}</Text>
        </View>
      );
    } else {
      content = (
        <View style={styles.costView}>
          <Text style={styles.cost} numberOfLines={1} ellipsizeMode="tail">
            {this.props.isDoneSocket
              ? lang.TEXT.SEARCH_HOTEL_ITEM_PRICE_NA
              : lang.TEXT.SEARCH_HOTEL_ITEM_PRICE_LOADING}
          </Text>
        </View>
      );
    }

    return content;
  }

  renderThumbnail(urlThumbnail) {
    if (urlThumbnail != null && urlThumbnail != "") {
      return (
        <FastImage
          style={{ flex: 1, borderRadius: 5 }}
          source={{
            uri: urlThumbnail,
            priority: FastImage.priority.high
          }}
          resizeMode={FastImage.resizeMode.cover}
        />
      );
    } else {
      return null;
    }
  }

  renderIndex(isEnabled) {
    const { no, id } = this.props.item;

    // log('renderIndex',`id: ${id} no: ${no}`,{item:this.props.item});

    const result = (
      <View style={styles.index}>
        <Text style={styles.indexText}>{no}</Text>
      </View>
    );

    if (isEnabled) {
      return result;
    } else {
      return null;
    }
  }

  renderHeart(isEnabled) {
    const result = (
      <TouchableOpacity style={styles.favoritesButton}>
        <Image
          source={require("../../../assets/png/heart.png")}
          style={styles.favoriteIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>
    );

    if (isEnabled) {
      return result;
    } else {
      return null;
    }
  }

  renderSelectionStyling(selectedStyle) {
    const mainStyle = {
      position: "absolute",
      borderRadius: 5,
      height: imageHeight,
      width: SCREEN_SIZE.W - 30,
      marginTop: 7.5,
      marginLeft: 15,
      marginBottom: 7.5,
      paddingRight: 10
    }
    return (
      <View style={[mainStyle, selectedStyle]} />
    )
  }

  render() {
    const item = this.props.item;

    //TODO: @@debug remove
    // console.log(`[HotelItemView] hotel item ${item.id}`, item, this.props)
    // console.log(`[HotelItemView] id:${item.id} isDone:${this.props.isDoneSocket} index:${item.index} price:${item.price} name:${item.name}`)
    const photo = item.hotelPhoto;
    const thumb = item.thumbnail;
    let urlThumbnail =
      photo != null
        ? _.isString(photo)
          ? photo
          : photo.url != ""
          ? photo.url
          : thumb != null && thumb != ""
          ? _.isString(thumb)
            ? thumb
            : thumb.url && thumb.url != ""
            ? thumb.url
            : ""
          : ""
        : "";
    if (urlThumbnail == "") {
      urlThumbnail = DEFAULT_HOTEL_PNG;
    }
    urlThumbnail = imgHost + urlThumbnail;

    const { name, stars, isSelected } = item;
    const selectedStyle = (isSelected ? {borderColor: "#D87A61AA", borderWidth: 3} : null);

    return (
      <TouchableOpacity onPress={this.onPress} >
        <CardView
          style={styles.card}
          cardElevation={0.5}
          cardMaxElevation={0.5}
          cornerRadius={0}
        >
          <View style={styles.popularHotelsImage}>
            {this.renderThumbnail(urlThumbnail)}
            {this.renderHeart(false)}
          </View>

          <View style={styles.cardContent}>
            <Text
              style={styles.placeName}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {name}
            </Text>

            <View style={styles.aboutPlaceView}>
              <View style={styles.ratingIconsWrapper}>
                {this.renderStars(stars)}
              </View>
              {/* <Text style={styles.totalReviews}> 73 Reviews </Text> */}
            </View>

            {this.renderPrice()}
            {this.renderIndex(showNumberOnHotelItem)}
          </View>

        </CardView>
        {this.renderSelectionStyling(selectedStyle)}
      </TouchableOpacity>
    );
  }
}

let mapStateToProps = state => {
  return {
    currency: state.currency.currency,
    currencySign: state.currency.currencySign,
    // locAmounts: state.locAmounts,
    exchangeRates: state.exchangeRates
    // allState: state
  };
};
export default connect(
  mapStateToProps,
  null
)(HotelItemView);
