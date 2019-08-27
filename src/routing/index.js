import React, { PureComponent } from "react";
import { connect } from "react-redux";
import {
  createStackNavigator,
  createBottomTabNavigator,
  NavigationActions
} from "react-navigation";

import {
  createReduxContainer,
  createReactNavigationReduxMiddleware
} from "react-navigation-redux-helpers";
import { BackHandler, View } from "react-native";

import ExitConfirmDialog from "../components/molecules/ExitConfirmDialog";

import AppLoading from "../components/app/AppLoading";

import Welcome from "../components/screens/Welcome";
import Login from "../components/screens/Account/Login";
import CreateAccount from "../components/screens/Account/CreateAccount";
import CreatePassword from "../components/screens/Account/CreatePassword";
import Terms from "../components/screens/Account/Terms";
import CongratulationRegister from "../components/screens/Account/CongratulationRegister";

import CreateWallet from "../components/screens/Wallet/CreateWallet";
import WalletRecoveryKeywords from "../components/screens/Wallet/WalletRecoveryKeywords";
import WalletKeywordValidation from "../components/screens/Wallet/WalletKeywordValidation";
import CongratsWallet from "../components/screens/Wallet/CongratsWallet";

import Explore from "../components/screens/Explore";
import Profile from "../components/screens/Profile";

import NavTabBar from "../components/organisms/NavTabBar";
import Inbox from "../components/screens/Message/Inbox";
import Chat from "../components/screens/Message/Chat";

import MyTrips from "../components/screens/MyTrips";
import UserMyTrips from "../components/screens/MyTrips/UserMyTrips";
import Favourites from "../components/screens/Favorites";

import Notifications from "../components/screens/Notifications";

import CreditCard from "../components/screens/CreditCard";
import CreditCardFilled from "../components/screens/CreditCard";

import PaymentMethods from "../components/screens/PaymentMethods";

import AddPaymentMethod from "../components/screens/AddPaymentMethod";

import Guests from "../components/screens/Guests";

import WebviewScreen from "../components/screens/Webview";
import Filters from "../components/screens/Filters";
import AvailableRoomsView from "../components/molecules/AvailableRoomsView";
import SimpleUserProfile from "../components/screens/SimpleUserProfile";
import EditUserProfile from "../components/screens/EditUserProfile";
import SendToken from "../components/screens/SendToken";
import CongratsCreditCard from "../components/screens/CongratsCreditCard";

import SingleWishlist from "../components/screens/Favorites/SingleWishlist";
import Calendar from "../components/screens/Calendar";

import HotelsSearchScreen from "../components/screens/HotelsSearch/HotelsSearchScreen";
import HotelFilters from "../components/screens/HotelsSearch/HotelFilters";
import HotelDetails from "../components/screens/HotelsSearch/HotelDetails";
import GuestInfoForm from "../components/screens/HotelsSearch/GuestInfoForm";
import RoomDetailsReview from "../components/screens/HotelsSearch/RoomDetailsReview";

import HomesSearchScreen from "../components/screens/HomeSearch/HomesSearchScreen";
import HomeFilters from "../components/screens/HomeSearch/HomeFilters";
import HomeDetails from "../components/screens/HomeSearch/HomeDetails";
import HomeReview from "../components/screens/HomeSearch/HomeReview";
import HomeRequestConfirm from "../components/screens/HomeSearch/HomeRequestConfirm";

import MapFullScreen from "../components/screens/MapFullScreen";
import navigationService from "../services/navigationService";

export const MyTripNavigator = createStackNavigator(
  {
    WELCOME_TRIPS: { screen: MyTrips },
    UserMyTrips: { screen: UserMyTrips }
  },
  {
    initialRouteName: "WELCOME_TRIPS",
    headerMode: "none"
  }
);

const MainNavigator = createBottomTabNavigator(
  {
    PROFILE: { screen: Profile },
    MESSAGES: { screen: Inbox },
    MY_TRIPS: { screen: MyTripNavigator },
    FAVORITES: { screen: Favourites },
    EXPLORE: { screen: Explore }
  },
  {
    initialRouteName: "EXPLORE",
    tabBarComponent: NavTabBar,
    tabBarPosition: "bottom"
  }
);

const RootNavigator = createStackNavigator(
  {
    AppLoading,
    Welcome: { screen: Welcome },
    Login: { screen: Login },
    CreateAccount: { screen: CreateAccount },
    CreatePassword: { screen: CreatePassword },
    Terms: { screen: Terms },
    CreateWallet: { screen: CreateWallet },
    WalletRecoveryKeywords: { screen: WalletRecoveryKeywords },
    WalletKeywordValidation: { screen: WalletKeywordValidation },

    CongratsWallet: { screen: CongratsWallet },
    CongratulationRegister: { screen: CongratulationRegister },
    MainScreen: { screen: MainNavigator },
    GuestsScreen: { screen: Guests },
    CalendarScreen: { screen: Calendar },
    RoomDetailsReview: { screen: RoomDetailsReview },
    GuestInfoForm: { screen: GuestInfoForm },
    WebviewScreen: { screen: WebviewScreen },
    HotelDetails: { screen: HotelDetails },
    FilterScreen: { screen: Filters },
    AvailableRoomsView: { screen: AvailableRoomsView },
    Notifications: { screen: Notifications },
    CreditCard: { screen: CreditCard },
    CreditCardFilled: { screen: CreditCardFilled },
    CongratsCreditCard: { screen: CongratsCreditCard },
    PaymentMethods: { screen: PaymentMethods },
    AddPaymentMethod: { screen: AddPaymentMethod },
    EditUserProfile: { screen: EditUserProfile },
    SimpleUserProfile: { screen: SimpleUserProfile },
    SendToken: { screen: SendToken },
    SingleWishlist: { screen: SingleWishlist },
    Chat: { screen: Chat },

    HotelsSearchScreen: { screen: HotelsSearchScreen },
    HotelFilterScreen: { screen: HotelFilters },
    HomesSearchScreen: { screen: HomesSearchScreen },
    HomeFilterScreen: { screen: HomeFilters },
    HomeDetailsScreen: { screen: HomeDetails },
    HomeReviewScreen: { screen: HomeReview },
    HomeRequestConfirm: { screen: HomeRequestConfirm },
    MapFullScreen: { screen: MapFullScreen }
  },
  {
    initialRouteName: "AppLoading",
    headerMode: "none"
  }
);

const middleware = createReactNavigationReduxMiddleware(state => state.nav);
const AppWithNavigationState = createReduxContainer(RootNavigator);

// create nav component
class ReduxNavigation extends PureComponent {
  state = {
    visibleConfirmDialog: false
  };

  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.onBackPress);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.onBackPress);
  }

  onBackPress = () => {
    const { dispatch, state } = this.props;
    if (state.index === 0) {
      this.setState({ visibleConfirmDialog: true });
      return true;
    }

    dispatch(NavigationActions.back());
    return true;
  };

  onConfirmOk = () => {
    //console.log("onConfirmOk ---");
    this.setState({ visibleConfirmDialog: false }, () => {
      //console.log("onConfirmOk ---123123123");
      BackHandler.exitApp();
      // const { dispatch } = this.props;
      // dispatch(NavigationActions.back());
    });
  };

  onConfirmCancel = () => {
    this.setState({ visibleConfirmDialog: false });
  };

  render() {
    const { dispatch, state } = this.props;
    const { visibleConfirmDialog } = this.state;
    return (
      <View style={{ flex: 1 }}>
        <AppWithNavigationState
          ref={navigatorRef => {
            navigationService.setTopLevelNavigator(navigatorRef);
          }}
          dispatch={dispatch}
          state={state}
        />
        <ExitConfirmDialog
          title={"Confirm"}
          visible={visibleConfirmDialog}
          onCancel={this.onConfirmCancel}
          onOk={this.onConfirmOk}
        />
      </View>
    );
  }
}

const mapNavStateProps = state => ({
  state: state.nav
});

const AppNavigator = connect(mapNavStateProps)(ReduxNavigation);

export { RootNavigator, AppNavigator, middleware };
