// Make AsyncStorage available globally for legacy tests referencing it without import
// (Even though we ignore those tests, this keeps the environment predictable.)
// eslint-disable-next-line @typescript-eslint/no-var-requires
const AS = require('@react-native-async-storage/async-storage');
// @ts-ignore
global.AsyncStorage = AS;

