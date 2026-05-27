const React = require("react");

const MenuView = React.forwardRef((props, ref) =>
  React.createElement("MenuView", { ...props, ref }, props?.children ?? null),
);
MenuView.displayName = "MenuView";

module.exports = {
  MenuView,
};
