class Socket {}
module.exports = {
  Socket,
  createConnection: () => new Socket(),
  default: {
    Socket,
    createConnection: () => new Socket(),
  },
};

