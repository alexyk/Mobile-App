import { isString, isNumber } from "js-tools";

var valid = require("card-validator");

export const validateEmail = email => {
  const re = /^(([^<>\*()[\]\\.,;:\s@\"\']+(\.[^<>\*()[\]\\.,;:\s@\"\']+)*))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; // eslint-disable-line
  return re.test(email);
};

export const validatePhone = phone => {
  // TODO: May consider using google library directly if it covers project needs better
  // Continuing with current simple validation seems to me (Alex K) also a good idea (in terms of maintenance and following project needs)
  // Google library demo:  https://github.com/google/libphonenumber/blob/master/javascript/i18n/phonenumbers/demo.js
  // Previous partially applied solution was: 'react-native-phone-input'.phoneNumber.isValidNumber()
  const re = /^([+]{0,1})([\d]{5,})$/; // eslint-disable-line
  return re.test(phone);
};

export const PHONE_VALIDATION_ISSUES = {
  LENGTH: "Phone number should be at least 5 digits",
  DIGITS_ONLY: "Phone number should contain only digits",
  INTERNAL: "Phone number - internal error",
  NA: "Phone number - unknown error",
}
export function validatePhoneIssues(phone) {
  let result = null;

  if (validatePhone(phone)) {
    return result;
  }

  if (!isString(phone)) {
    result = PHONE_VALIDATION_ISSUES.INTERNAL;
  } else {
    if (phone && phone.charAt(0) == "+") {
      phone = phone.slice(1);
    }
    if (!phone || phone.length < 5) {
      result = PHONE_VALIDATION_ISSUES.LENGTH;
    } else if (!/^[\d]{5,}$/.test(phone)) {
      result = PHONE_VALIDATION_ISSUES.DIGITS_ONLY;
    } else {
      result = PHONE_VALIDATION_ISSUES.NA;
    }

  }

  return result;
}

export const validatePassword = password => {
  // const re = /^(?=.*?[A-Za-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-])(.{8,})$/; // eslint-disable-line
  const re = /^(?=.*?[A-Za-z])(?=.*?[0-9])(.{8,})$/; // eslint-disable-line
  return re.test(password);
};

// = password => !!password && password.length > 7;

export const hasLetterAndNumber = password => {
  const re = /^(?=.*?[A-Z a-z])(?=.*?[0-9])/; // eslint-disable-line
  return re.test(password);
};

export const hasLetter = password => {
  const re = /^(?=.*?[A-Z a-z])/; // eslint-disable-line
  return re.test(password);
};

export const validateName = value => {
  if (!value) {
    return false;
  }
  
  const re = /^([A-Za-z]{2,})$/; // eslint-disable-line
  return re.test(value);
};

export const hasSymbol = password => {
  const re = /^(?=.*?[#?!@$%^&*-]).{8,}$/; // eslint-disable-line
  return re.test(password);
};

export const validatePassword1 = password => {
  const re = /^(?=.*?[A-Z, a-z])(?=.*?[0-9]).{8,}$/; // eslint-disable-line
  return re.test(password);
};

export const validateNumberic = number => {
  const re = /^-{0,1}\d*\.{0,1}\d+$/; // eslint-disable-line
  return re.test(number);
};

export const validateEmptyString = str => {
  return !str || /^\s*$/.test(str);
};
export const validateCardNumber = card => {
  var cardNumber = valid.number(card);
  return cardNumber.isValid;
};

export const validateCardExpiry = cardExpiry => {
  var expirationDateValidation = valid.expirationDate(cardExpiry);
  return expirationDateValidation.isValid;
};

export const validateCVV = cvv => {
  var cvv = valid.cvv(cvv);
  return cvv.isValid;
};

/**
 * Very basic validator
 * Maybe switch to using wallet-address-validator from npm in the future
 * @param {Number | String | null} value
 * @returns -1 for null or not a number or string, 0 for invalid, 1 for valid
 */
export const validateLOCAddress = value => {
  const asString = isString(value)
    ? value
    : isNumber(value)
    ? "0x" + value.toString(16)
    : null;
  if (value == null || asString == null) {
    return -1;
  }

  const re = /^0x[a-f\d]{1,42}$/i; // eslint-disable-line
  const result = re.test(asString);

  if (result) {
    return 1;
  } else {
    return 0;
  }
};

export const validateConfirmPassword = (password, confirmPassword) =>
  !!password && !!confirmPassword && password === confirmPassword;
