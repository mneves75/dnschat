const mock = {
  getSystemVersion: jest.fn(async () => "26.0"),
  getModel: jest.fn(async () => "iPhone16,1"),
};

module.exports = {
  __esModule: true,
  default: mock,
};
