const React = require("react");

const createNavigator = () => {
  const Navigator = ({ children }) => React.createElement(React.Fragment, null, children);
  Navigator.Screen = ({ children }) => React.createElement(React.Fragment, null, children);
  return Navigator;
};

module.exports = {
  Stack: createNavigator(),
  Tabs: createNavigator(),
  Slot: ({ children }) => React.createElement(React.Fragment, null, children),
  Redirect: () => React.createElement(React.Fragment, null),
  Link: ({ children }) => React.createElement(React.Fragment, null, children),
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  useSegments: () => [],
  useRootNavigationState: () => ({ key: "test" }),
};
