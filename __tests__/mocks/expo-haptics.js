const createAsyncMock = () => {
  const fn = jest.fn();
  fn.mockResolvedValue(undefined);
  return fn;
};

const impactAsync = createAsyncMock();
const notificationAsync = createAsyncMock();
const selectionAsync = createAsyncMock();
const isAvailableAsync = jest.fn().mockResolvedValue(true);

const ImpactFeedbackStyle = {
  Light: 'light',
  Medium: 'medium',
  Heavy: 'heavy',
  Rigid: 'rigid',
  Soft: 'soft',
};

const NotificationFeedbackType = {
  Success: 'success',
  Warning: 'warning',
  Error: 'error',
};

const reset = () => {
  impactAsync.mockClear().mockResolvedValue(undefined);
  notificationAsync.mockClear().mockResolvedValue(undefined);
  selectionAsync.mockClear().mockResolvedValue(undefined);
  isAvailableAsync.mockClear().mockResolvedValue(true);
};

reset();

module.exports = {
  impactAsync,
  notificationAsync,
  selectionAsync,
  isAvailableAsync,
  ImpactFeedbackStyle,
  NotificationFeedbackType,
  __reset: reset,
};
