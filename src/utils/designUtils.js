import { Platform, Dimensions, PixelRatio, StyleSheet } from 'react-native'
import { rlogd } from '../config-debug';
import { isFontScalingEnabled } from '../config-settings';

// See https://mydevice.io/devices/ for device dimensions
const X_WIDTH = 375;
const X_HEIGHT = 812;
const XSMAX_WIDTH = 414;
const XSMAX_HEIGHT = 896;
const PAD_WIDTH = 768;
const PAD_HEIGHT = 1024;

const { height: D_HEIGHT, width: D_WIDTH } = Dimensions.get('window');

export const pixelRatio = PixelRatio.getPixelSizeForLayoutSize(100)/100;

export const isIPhoneX = (
  Platform.OS === 'ios'
  && (
    ((D_HEIGHT === X_HEIGHT && D_WIDTH === X_WIDTH) ||
      (D_HEIGHT === X_WIDTH && D_WIDTH === X_HEIGHT)) ||
    ((D_HEIGHT === XSMAX_HEIGHT && D_WIDTH === XSMAX_WIDTH) ||
        (D_HEIGHT === XSMAX_WIDTH && D_WIDTH === XSMAX_HEIGHT))
  )
)

export function getSafeTopOffset() {
  if (isIPhoneX) {
    return 44;
  } else {
    return 24;
  }
}


export function getSafeBottomOffset() {
  if (isIPhoneX) {
    return 34;
  } else {
    return 0;
  }
}


export function getFontSizeByFontScale(value) {
  const fontScale = PixelRatio.getFontScale();
  let result = PixelRatio.roundToNearestPixel(fontScale * value)

  return result;
}

//TODO: Finish this implementation
//TODO: Maybe a good idea to use this as a general font import
// including what's in common.style.js
export function getFontSize(value,caller='') {
  if (!isFontScalingEnabled) {
    return value;
  }

  // Small emulator ->    RN:320x568    real: 480x800     hdpi  (240dpi)
  // ???                                                  xhdpi (320dpi)
  // Samsung S8+    ->    RN:411x798    real:1080x1920    529ppi            (logged resolution: 411.43x797.71)
  const {height, width} = Dimensions.get('window');
  const defPixelWidth = 1438.5;
  const calculatedPixelWidth = width * pixelRatio;
  const fontScale = calculatedPixelWidth / defPixelWidth;
  let asFloat = (fontScale * value);
  let result = PixelRatio.roundToNearestPixel(asFloat);

  if (__DEV__) {
    rlogd('getFontSizeByWidth',`[designUtils] ${caller} result:${result} asFloat:${asFloat.toFixed(2)}`,{asFloat,result,value,caller})
  }

  return result;
}

export function getImageSize(value) {
  const fontScale = PixelRatio.getFontScale();
  let result = PixelRatio.roundToNearestPixel(fontScale * value)

  return result;
}

export function logDebugInformation() {
  const {height, width} = Dimensions.get('window');
  const fontScale = PixelRatio.getFontScale();
  const font12 = PixelRatio.roundToNearestPixel(12*fontScale);

  //log('screen-utils', `Window size: ${width.toFixed(1)}x${height.toFixed(1)}, pixelRatio: ${pixelRatio}x, fontScale: ${fontScale}, font 12 at scale: ${font12}`, {Platform,height, windowSize: {width, pixelRatio}, fontScale})
  //console.log('screen-utils', `Screen size: ${width.toFixed(1)}x${height.toFixed(1)}, pixelRatio: ${pixelRatio}x, fontScale: ${fontScale}, font 12 at scale: ${font12}`, {Platform, windowSize: {height, width}, pixelRatio, fontScale, font12})
}

export function createStyleFromObject(obj) {
  return StyleSheet.create(obj);
}