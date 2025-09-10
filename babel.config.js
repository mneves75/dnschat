module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      'babel-preset-expo'
    ],
    // Let babel-preset-expo handle everything for now
    // We'll add React Compiler later once basic build works
  };
};