// Minimal mock for react-native-udp to avoid ESM parsing in Jest
module.exports = {
  createSocket: function () {
    const handlers = {};
    return {
      once: (event, fn) => {
        handlers[event] = fn;
      },
      on: (event, fn) => {
        handlers[event] = fn;
      },
      emit: (event, ...args) => {
        if (handlers[event]) handlers[event](...args);
      },
      send: (buf, offset, length, port, host, cb) => {
        // Immediately succeed in tests
        if (typeof cb === "function") cb();
      },
      close: () => {},
    };
  },
};
