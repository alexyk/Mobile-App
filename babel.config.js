module.exports = function(api) {
  api && api.cache(false);
    return {
    "presets": ["module:metro-react-native-babel-preset"],
    "plugins": [
      ["@babel/plugin-proposal-decorators", {"legacy": true}],
      ["@babel/plugin-transform-runtime", {"regenerator": false}]
    ]
  }
}