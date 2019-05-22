import { Platform, Dimensions, PixelRatio } from 'react-native'
import { logd } from '../config-debug';
import { isFontScalingEnabled } from '../config';

export const pixelRatio = PixelRatio.getPixelSizeForLayoutSize(100)/100;


export function getFontSizeByFontScle(value) {
  const fontScale = PixelRatio.getFontScale();
  let result = PixelRatio.roundToNearestPixel(fontScale * value)

  return result;
}

//TODO: Finish this implementation
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
    logd('getFontSizeByWidth',`[designUtils] ${caller} result:${result} asFloat:${asFloat.toFixed(2)}`,{asFloat,result,value,caller})
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