import React from "react";
import {
  TouchableOpacity,
  View,
  Text,
  Platform,
  Dimensions,
  StyleSheet
} from "react-native";
import WebView from "react-native-webview";

import {
  showBothMapAndListHotelSearch
} from "../../../../config-settings";
import {
  webviewDebugEnabled,
  hotelsSearchMapDebugEnabled
} from "../../../../config-debug";

import SearchBar from "../../../molecules/SearchBar";
import LTLoader from "../../../molecules/LTLoader";
import DateAndGuestPicker from "../../../organisms/DateAndGuestPicker";
import HotelItemView from "../../../organisms/HotelItemView";
import BackButton from "../../../atoms/BackButton";
import MapModeHotelsSearch from "../MapModeHotelsSearch";

import Toast from "react-native-easy-toast"; //eslint-disable-line
import { UltimateListView } from "react-native-ultimate-listview";
import { DotIndicator } from "react-native-indicators";

import {
  DISPLAY_MODE_RESULTS_AS_LIST,
  DISPLAY_MODE_RESULTS_AS_MAP,
  DISPLAY_MODE_HOTEL_DETAILS
} from "../utils";

import lang from "../../../../language";
import { commonText, commonComponents } from "../../../../common.styles";
import styles from "./styles";

import { hasValidCoordinatesForMap } from "../utils";
import LTIcon from "../../../atoms/LTIcon";

const { width, height } = Dimensions.get("window");

export function renderBackButton() {
  return (
    <View
      style={{
        // height: 50,
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        marginVertical: 10,
        marginLeft: 10
      }}
    >
      <BackButton onPress={this.onBackButtonPress} style={{ marginTop: 0 }} />
      <Text style={styles.backText}>{"Back to Explore"}</Text>
    </View>
  );
}

export function renderSearchField() {
  const dynamicStyle = this.isWebviewHotelDetail ? { height: 0 } : null;

  return (
    <View style={[styles.searchAndPickerwarp, dynamicStyle]}>
      <View style={styles.searchAreaView}>
        <SearchBar
          autoCorrect={false}
          value={this.state.search}
          placeholderTextColor="#bdbdbd"
          leftIcon="arrow-back"
          onLeftPress={this.onBackButtonPress}
          editable={false}
        />
      </View>
    </View>
  );
}

export function renderCalendarAndFilters() {
  const {
    startDateText,
    endDateText,
    checkInDateFormated,
    checkOutDateFormated,
    guests,
    children,
    adults
  } = this.props.datesAndGuestsData;
  return (
    <View
      key={"calendarAndFilters"}
      style={[
        this.isWebviewHotelDetail
          ? { height: 0, width: 0 }
          : this.state.isNewSearch
          ? { height: 190, width: "100%" }
          : { height: 70, width: "100%" },
        { borderBottomWidth: 0 }
      ]}
    >
      <DateAndGuestPicker
        checkInDate={startDateText}
        checkOutDate={endDateText}
        checkInDateFormated={checkInDateFormated}
        checkOutDateFormated={checkOutDateFormated}
        adults={adults}
        children={children}
        guests={guests}
        gotoFilter={this.gotoFilter}
        disabled={!this.state.editable}
        showSearchButton={this.state.isNewSearch}
        showCancelButton={this.state.isNewSearch}
        isFilterable={true}
      />
    </View>
  );
}

export function renderHotelDetailsAsWebview() {
  let result = false;

  // console.tron.logImportant(`Webview: ${this.isWebviewHotelDetail}`)
  // log('WEB-VIEW',`Loading: ${this.state.webViewUrl}`, {url:this.state.webViewUrl})

  if (this.isWebviewHotelDetail) {
    result = (
      <View style={{ width: "100%", height: "100%" }}>
        <WebView
          ref={ref => {
            this.webViewRef = ref;
          }}
          onWebviewNavigationStateChange={navState =>
            this.onWebViewNavigationState(navState)
          }
          onLoadStart={() => this.onWebViewLoadStart}
          onLoadEnd={() => this.onWebViewLoadEnd()}
          source={{ uri: this.state.webViewUrl }}
        />
      </View>
    );
  }
  return result;
}

/**
 * Content is updated on demand by listUpdateDataSource() and listStartFetch() in index.js
 * TODO: Investigate refactoring, cleaning and perhaps using a normal FlatList. Consider using test-flows and/or redux sagas.
 */
export function renderResultsAsList() {
  const isMap = this.state.displayMode == DISPLAY_MODE_RESULTS_AS_MAP;
  const isList = this.state.displayMode == DISPLAY_MODE_RESULTS_AS_LIST;
  const scale = isList ? 1.0 : 0.0;
  const height =
    showBothMapAndListHotelSearch && (isMap || isList) ? "50%" : null;
  const transform = [{ scaleX: scale }, { scaleY: scale }];

  return (
    <UltimateListView
      ref={ref => (this.listViewRef = ref)}
      key={"hotelsList"} // this is important to distinguish different FlatList, default is numColumns
      onFetch={this.onFetchNewListViewData}
      keyExtractor={(item, index) => `${index} - ${item}`}
      refreshable={false}
      numColumns={1} // to use grid layout, simply set gridColumn > 1
      item={this.renderListItem} // this takes three params (item, index, separator)
      paginationFetchingView={this.renderPaginationFetchingView}
      paginationWaitingView={this.renderPaginationWaitingView}
      paginationAllLoadedView={this.renderPaginationAllLoadedView}
      style={{ transform, height }}
    />
  );
}

export function renderListItem(item, index) {
  this.renderItemTimes++;

  return (
    <HotelItemView
      item={item}
      gotoHotelDetailsPage={this.gotoHotelDetailsFromItemClick}
      daysDifference={this.state.daysDifference}
      isDoneSocket={this.state.isDoneSocket}
      parent={this}
    />
  );
}

function line(width = null) {
  return (
    <View
      style={{
        borderBottomWidth: 3,
        width: "100%",
        borderBottomColor: "black"
      }}
    />
  );
}

export function renderPaginationFetchingView() {
  if (this.isAllHotelsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        {/* {line()} */}
        <Text style={{ ...commonText }}>{`List End`}</Text>
        {/* {line()} */}
      </View>
    );
  } else {
    return null;
    //return <DotIndicator color="#d97b61" count={3} size={9} animationDuration={777} />;
  }
}

export function renderPaginationWaitingView() {
  if (this.isAllHotelsLoaded) {
    return null;
  } else {
    return (
      <DotIndicator
        color="#d97b61"
        count={3}
        size={9}
        animationDuration={1200}
      />
    );
  }
}

export function renderPaginationAllLoadedView() {
  return null;
}

export function renderResultsAsMap() {
  let result = null;

  const data = this.state.hotelsInfoForMap;
  //console.log('HOTELS-MAP',`Render map with ${data ? data.length : 'n/a'} hotels`, {data,display:this.state.displayMode});

  const isMap = this.state.displayMode == DISPLAY_MODE_RESULTS_AS_MAP;
  const isList = this.state.displayMode == DISPLAY_MODE_RESULTS_AS_LIST;
  let height = isMap ? "100%" : "0%";
  if (showBothMapAndListHotelSearch && (isMap || isList)) {
    height = "50%";
  }
  let style;

  // TODO: Quick fix for Android - reach a better solution and remove it
  if (Platform.OS == "android") {
    style = { height };
  }
  if (Platform.OS == "ios") {
    style = { height };
  }

  if (hasValidCoordinatesForMap(this.state, true)) {
    result = (
      <MapModeHotelsSearch
        key={"resultsAsMap"}
        ref={ref => {
          if (!!ref) {
            this.mapView = ref.getWrappedInstance();
          }
        }}
        isMap={isMap}
        optimiseMarkers={this.state.optimiseMapMarkers}
        isFilterResult={this.state.isFilterResult}
        initialLat={this.state.initialLat}
        initialLon={this.state.initialLon}
        daysDifference={this.state.daysDifference}
        hotelsInfo={data}
        gotoHotelDetailsPage={this.gotoHotelDetailsFromItemClick}
        isVisible={isMap}
        parentProps={{ props: this.props, state: this.state }}
        updateCoords={this.updateCoords}
        // style={{ height, borderRadius: 10, marginHorizontal: 5, borderColor: '#FFF3', borderWidth: 3 }}
        style={style}
      />
    );
  } else {
    // log('map', `NO VALID COORDS`)
  }

  return result;
}

export function renderMapButton() {
  const hasValidCoordinates = hasValidCoordinatesForMap(this.state, true);
  const isLoading = this.state.isLoading;

  //log('render-button',`isLoading:${isLoading}  hasValidCoordinates:${hasValidCoordinates}`,{state:this.state,})
  if (hasValidCoordinates && !isLoading) {
    const isMap = this.state.displayMode == DISPLAY_MODE_RESULTS_AS_MAP;
    const isList = this.state.displayMode == DISPLAY_MODE_RESULTS_AS_LIST;
    const isDetails = this.state.displayMode == DISPLAY_MODE_HOTEL_DETAILS;
    const isShowingResults = isMap || isList;

    // console.log(`---- coordinates: ${hasValidCoordinates}, ${this.state.initialLat}/${this.state.initialLon}`);

    if ((isShowingResults || hasValidCoordinates) && !isDetails && !isLoading) {
      return (
        <TouchableOpacity
          key={"mapButton"}
          onPress={this.onToggleMapOrListResultsView}
          style={styles.switchButton}
        >
          <LTIcon
            style={styles.icon}
            name={isMap && !isList ? "listUl" : "mapMarker"}
          />
        </TouchableOpacity>
      );
    }
  } else {
    //console.warn (`No valid coordinates to render map`, {hasValidCoordinates,initialLat: this.state.initialLat, initialLon: this.state.initialLon})
    return null;
  }
}

export function renderFooter() {
  if (this.isWebviewHotelDetail) return null;

  const { isApplyingFilter } = this.props;
  const { hideFooter, error } = this.state;

  // format hotels count information
  const hotelsLoadedCount = `${
        this.isMinimumResultLoaded && !this.isAllHotelsLoaded
          ? this.state.pricesFromSocketValid
          : this.state.totalHotels
      }`;

  // common text
  const fontSize = 13;
  let simpleText;


  //const isRed = (isSocketRedColor || this.state.isStaticTimeout);
  const textContent = error
    ? error
    : isApplyingFilter && !this.isAllHotelsLoaded
      ? lang.TEXT.SEARCH_HOTEL_RESULTS_APPLYING_FILTER
      : hotelsLoadedCount == 0
        ? lang.TEXT.SEARCH_HOTEL_RESULTS_FIRST_FILTER_IN_PROGRESS
        : this.isAllHotelsLoaded
          ? lang.TEXT.SEARCH_HOTEL_RESULTS_FILTERED.replace("%1", hotelsLoadedCount)
          : lang.TEXT.SEARCH_HOTEL_RESULTS_LOADING.replace("%1", hotelsLoadedCount);

  simpleText = (
    <Text
      style={{
        ...commonText,
        fontSize,
        fontWeight: "normal",
        textAlign: "center",
        color: "black",
        paddingLeft: 5,
        width: "100%"
      }}
    >
      {textContent}
    </Text>
  );


  if (!hideFooter) {
    return (
      <View
        style={{
          height: 30,
          flexDirection: "row",
          justifyContent: "space-evenly",
          alignItems: "flex-end",
          borderBottomWidth: 0.5,
          borderColor: "#777",
          paddingBottom: 5,
          paddingHorizontal: 5,
          borderRadius: 10,
          marginTop: 10,
          marginHorizontal: 0
        }}
      >
        {simpleText}
      </View>
    );
  } else {
    return null;
  }
}

export function renderPreloader() {
  const { displayMode, isLoading, isFilterResult } = this.state;
  const { isApplyingFilter } = this.props;
  const isHotelDetails = displayMode == DISPLAY_MODE_HOTEL_DETAILS;
  const isMap = displayMode == DISPLAY_MODE_RESULTS_AS_MAP;
  const isList = displayMode == DISPLAY_MODE_RESULTS_AS_LIST;
  const isFiltering = isApplyingFilter;
  const isServerFilter = isFilterResult;
  const isFilteringFromServer = isFiltering && isServerFilter;
  const isFilteringFromUI = this.isFilterFromUI;
  const isFirstFilter = this.isFirstFilter;
  const opacity = null; //(isFilteringFromServer ? '77' : null);

  //log('filterUI',`${isFirstFilter ? 'first+' : 'first-'} ${isFilteringFromUI ? 'ui+' : 'ui-'} ${isFilteringFromServer ? 'srv+' : "srv-"} ${isServerFilter ? 'respSrv+' : 'respSrv-'}`)

  const totalText =
    ""; /*(
    this.state.totalHotels > 0
      ? `of maximum ${this.state.totalHotels}`
      : ''
  )*/
  const propertiesText =
    /* this.state.pricesFromSocketValid > 0
      ? `\n\n${this.state.pricesFromSocketValid} found ${totalText}`
      : */ "";
  const message =
    isList || isMap
      ? isFiltering
        ? isFilteringFromUI && !isFirstFilter
          ? ""
          : lang.TEXT.SEARCH_HOTEL_FILTERED_MSG
        : `Loading matches for your search ...${propertiesText}`
      : isHotelDetails
      ? `Loading hotel details ...`
      : "";

  return (
    <LTLoader
      isLoading={isLoading || (isFiltering && !isFirstFilter)}
      message={message}
      opacity={opacity}
    />
  );
  // return <LTLoader isLoading={false} message={message} />
}

export function renderToast() {
  return (
    <Toast
      ref="toast"
      style={{ backgroundColor: "#DA7B61" }}
      position="bottom"
      positionValue={350}
      fadeInDuration={500}
      fadeOutDuration={500}
      opacity={0.9}
      textStyle={{ color: "white", fontFamily: "FuturaStd-Light" }}
    />
  );
}

export function renderDebugWebview() {
  if (!__DEV__ || !webviewDebugEnabled) {
    // webview debug is disabled in these cases
    return null;
  }

  if (this.webViewRef == null) {
    // console.warn('[WebView::renderDebug] this.webViewRef.ref is not set - not showing debug button')
    return null;
  }

  const onPress = () => {
    this.webViewRef.reload();
  };

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={{ left: 20, top: 3, backgroundColor: "#777A", width: 130 }}>
        <Text style={{ textAlign: "center" }}>{"RELOAD WEBVIEW"}</Text>
      </View>
    </TouchableOpacity>
  );
}

export function renderDebugMap() {
  if (!__DEV__ || !hotelsSearchMapDebugEnabled) {
    return null;
  }

  const onPress = () => {
    this.setState(prev => ({ optimiseMapMarkers: !prev.optimiseMapMarkers }));
  };

  return (
    <TouchableOpacity onPress={onPress}>
      <View
        style={{
          left: 200,
          bottom: 5,
          backgroundColor: "#777A",
          width: 100,
          borderRadius: 5,
          padding: 2
        }}
      >
        <Text style={{ textAlign: "center", fontSize: 11 }}>
          {this.state.optimiseMapMarkers ? "OPTIMISED" : "ALL MARKERS"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ------ NOT USED ------

export function renderContentMessage(text) {
  return (
    <View
      key={"contentMessage"}
      style={{
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <Text
        style={{
          ...commonText,
          textAlign: "center",
          fontSize: 20
        }}
      >
        {text}
      </Text>
    </View>
  );
}
