import { NavigationActions } from "react-navigation";

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

// add other navigation functions that you need and export them
export default {
  goBack,
  navigate,
  setTopLevelNavigator
};