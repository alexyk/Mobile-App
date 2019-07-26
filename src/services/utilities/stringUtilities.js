export default class StringUtils {
  static shorten(str, length) {
    if (str.length <= length) {
      return str;
    }

    return `${str.substring(0, length)}...`;
  }

  /**
   * Returns a substring of a string based on @sourceStr -> indexOf( @fromIndexOfStr ) and @length
   * @param {String} sourceStr
   * @param {String} fromIndexOfStr
   * @param {Number} length
   * @param {Number} indexCorrection Add or subtract from index (indexOf position)
   */
  static subBeforeIndexOf(sourceStr, toIndexOfStr, indexCorrection=0) {
    if (!sourceStr || !toIndexOfStr) {
      return '';
    }

    const index = sourceStr.indexOf(toIndexOfStr);

    if (index == -1) {
      return '';
    } else {
      return sourceStr.substr(0, index+indexCorrection);
    }
  }
  

  /**
   * Returns a substring of a string based on @sourceStr -> indexOf( @fromIndexOfStr ) and @length
   * @param {String} sourceStr
   * @param {String} fromIndexOfStr
   * @param {Number} length
   * @param {Number} indexCorrection Add or subtract from index (indexOf position)
   */
  static subFromIndexOf(sourceStr, fromIndexOfStr, length, indexCorrection=0) {
    if (!sourceStr || !fromIndexOfStr) {
      return '';
    }

    const index = sourceStr.indexOf(fromIndexOfStr);

    if (index == -1) {
      return '';
    } else {
      return sourceStr.substr(index+indexCorrection,length);
    }
  }

}