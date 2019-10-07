import { NavigationActions } from "react-navigation";
import store from "../redux/store";
import { getObjectFromPath } from "js-tools";

let _navigator;

function setTopLevelNavigator(navigatorRef) {
  _navigator = navigatorRef;
}

function navigate(routeName, params) {
  _navigator.props.dispatch(
    NavigationActions.navigate({
      routeName,
      params
    })
  );
}

function goBack(params={}) {
  _navigator.props.dispatch(NavigationActions.back(params));
}

function getCurrentScreenName() {
  const state =  store.getState();
  return getObjectFromPath(state, 'nav.routes.0.routeName') || '<screen-not-known>';
}

// add other navigation functions that you need and export them
export default {
  goBack,
  navigate,
  setTopLevelNavigator,
  getCurrentScreenName
};
