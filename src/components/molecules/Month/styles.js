import { StyleSheet } from "react-native";

export const monthTitleHeight = 20;
export const monthTitlePaddingTop = 5;
export const monthTitlePaddingBottom = 17;

export default StyleSheet.create({
  month: {
    paddingTop: monthTitlePaddingTop,
    paddingBottom: monthTitlePaddingBottom
  },
  monthTitle: {
    paddingHorizontal: 10
  },
  monthTitleText: {
    fontFamily: "FuturaStd-Light",
    fontSize: 20,
    lineHeight: monthTitleHeight
  }
});
