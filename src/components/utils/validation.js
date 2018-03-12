export const validateName = (name) => {
  return !!name;
};

export const validateEmail = (email) => {
  const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return !!password && password.length > 7;
};

export const validateConfirmPassword = (password, confirmPassword) => {
  return !!password && !!confirmPassword && password === confirmPassword;
};