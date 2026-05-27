const React = require("react");
const { View } = require("react-native");

const SafeAreaView = ({ children, ...props }) =>
  React.createElement(View, props, children);

module.exports = {
  SafeAreaProvider: ({ children }) => React.createElement(React.Fragment, null, children),
  SafeAreaView,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
};
