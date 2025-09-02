// Minimal mock for react-native-tcp-socket to avoid ESM parsing and provide a no-op Socket
class MockSocket {
  constructor() {
    this.handlers = {};
  }
  on(event, handler) {
    this.handlers[event] = handler;
  }
  once(event, handler) {
    this.handlers[event] = handler;
  }
  emit(event, ...args) {
    if (this.handlers[event]) this.handlers[event](...args);
  }
  connect(options, cb) {
    // Simulate async successful connect
    setTimeout(() => {
      if (typeof cb === "function") cb({ ok: true });
      this.emit("connect");
    }, 0);
  }
  write(_data) {
    // Accept writes in tests
    return true;
  }
  end() {
    this.emit("close");
  }
  destroy() {
    this.emit("close");
  }
  setTimeout() {}
}

module.exports = {
  Socket: MockSocket,
};
