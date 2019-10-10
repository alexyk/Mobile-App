import { NavigationActions } from "react-navigation";
import { getObjectFromPath } from "js-tools";
import { tsNullKeyword } from "@babel/types";

// create variables here for easy access and hide from exporting
let _navigator;
let _tabNavigation;
function navigation() {
  return _navigator.currentNavProp;
}

/**
 * Initial motivation for this service was webview (see .../screens/utils::gotoSimpleWebview).
 * Then it is also used in testFlows (see debug-tools in utils/debug).
 * Another case is with CongratsWallet screen - solving the case with going back to first screen,
 * but not resetting to Explore tab (NavigationService::reset and gotoTab).
 * MessageDialog was another case - getting current screen name (NavigationService::getCurrentScreenName).
 * In the end it proves to be a good place to refer to when in need of certain navigation
 * functionality - can be used for debugging navigation and implementing certain flows.
 */
class NavigationService {
  setTopLevelNavigator(navigatorRef) {
    _navigator = navigatorRef;
  }

  setTabNavigation(navigatorRef) {
    _tabNavigation = navigatorRef;
  }

  navigate(routeName, params) {
    navigation().navigate({ routeName, params });
  }

  gotoTab(tabName) {
    if (_tabNavigation) {
      _tabNavigation.navigate(tabName);

    } else {
      throw new Error("[navigationService] Tab navigator is not yet set with 'setTabNavigator'.");
    }
  }

  goBack(params={}) {
    navigation().goBack();
  }

  reset(screenName=null, tabName=null, index=0) {
    if (screenName == null) {
      navigation().popToTop();
    } else {
      navigation().reset(
        [NavigationActions.navigate({routeName: screenName})],
        0
      );
    
      if (tabName) {
        this.gotoTab(tabName);
      }  
    }
  }

  getCurrentScreenName() {
    // const state =  store.getState();
    // return getObjectFromPath(state, 'nav.routes.0.routeName') || '<screen-not-known>';
    const { currentNavProp } = _navigator;
    const routesStack = getObjectFromPath(currentNavProp, 'state.routes');
    const last = routesStack.slice(-1);
    const currentNavName = currentNavProp.key;
    const screenName = getObjectFromPath(last, 'routeName')  || '<screen-not-known>';

    return `${currentNavName}::${screenName}`;
  }
}

const navigationService = new NavigationService();

export default navigationService;