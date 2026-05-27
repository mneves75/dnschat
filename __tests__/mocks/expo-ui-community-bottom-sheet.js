const React = require("react");

const createSheetComponent = (name) => {
  const Component = React.forwardRef((props, ref) =>
    React.createElement(name, { ...props, ref }, props?.children ?? null),
  );
  Component.displayName = name;
  return Component;
};

const BottomSheetModal = React.forwardRef((props, ref) => {
  React.useImperativeHandle(ref, () => ({
    dismiss: jest.fn(),
    present: jest.fn(),
  }));
  return React.createElement("BottomSheetModal", props, props?.children ?? null);
});
BottomSheetModal.displayName = "BottomSheetModal";

module.exports = {
  BottomSheetModal,
  BottomSheetView: createSheetComponent("BottomSheetView"),
  BottomSheetFlatList: createSheetComponent("BottomSheetFlatList"),
  BottomSheetScrollView: createSheetComponent("BottomSheetScrollView"),
  BottomSheetSectionList: createSheetComponent("BottomSheetSectionList"),
};
