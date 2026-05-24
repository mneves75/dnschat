const React = require("react");

module.exports = {
  ThemeProvider: ({ children }) => React.createElement(React.Fragment, null, children),
  DarkTheme: {
    dark: true,
    colors: {
      primary: "dark-primary",
      background: "dark-background",
      card: "dark-card",
      text: "dark-text",
      border: "dark-border",
      notification: "dark-notification",
    },
    fonts: {},
  },
  DefaultTheme: {
    dark: false,
    colors: {
      primary: "default-primary",
      background: "default-background",
      card: "default-card",
      text: "default-text",
      border: "default-border",
      notification: "default-notification",
    },
    fonts: {},
  },
};
