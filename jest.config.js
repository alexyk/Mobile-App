module.exports = {
  preset: "react-native",
  testEnvironment: "node",
  moduleFileExtensions: ['js', 'jsx', 'json', 'vue'],
  transform: {
    '^.+\\.(js|jsx)?$': 'babel-jest'
  },
  transformIgnorePatterns: ['node_modules/js-tools/src/[a-zA-Z].js']
};