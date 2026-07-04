const React = require("react");
const { View } = require("react-native");

const makePassthrough = (name) => {
  const Component = ({ children, ...props }) =>
    React.createElement(View, props, children);
  Component.displayName = name;
  return Component;
};

const Svg = makePassthrough("Svg");

module.exports = new Proxy(
  { __esModule: true, default: Svg, Svg },
  {
    get(target, prop) {
      if (prop in target) {
        return target[prop];
      }
      if (typeof prop === "symbol") {
        return undefined;
      }
      const component = makePassthrough(String(prop));
      target[prop] = component;
      return component;
    },
  },
);
