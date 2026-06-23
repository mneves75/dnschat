/**
 * Shared Jest mock for react-native-reanimated.
 *
 * Jest does not transform node_modules, and the real reanimated entry is ESM
 * (`import './publicGlobals'`), so importing it from a test throws
 * "Cannot use import statement outside a module". Any suite that RENDERS a
 * reanimated-backed component therefore needs this module mocked. It is wired
 * globally via jest.config.js `moduleNameMapper` so every rendering suite gets a
 * working, deterministic stub without importing the native runtime.
 *
 * Behavioural contract:
 * - Animation helpers (withTiming/withSpring/...) resolve SYNCHRONOUSLY to their
 *   target value, so `sharedValue.set(withSpring(x))` lands on `x` and
 *   `useAnimatedStyle` reads the final state in a single render pass.
 * - Shared values expose both `.value` and the `.get()/.set()/.modify()`
 *   accessors the codebase uses (React Compiler convention).
 *
 * Covers exactly the API surface used in src/ (verified by grep): useSharedValue,
 * useAnimatedStyle, useAnimatedReaction, withTiming/Spring/Delay/Repeat/Sequence,
 * cancelAnimation, runOnJS, interpolate, Easing, makeMutable, measure,
 * createAnimatedComponent, and Animated.View. Extra common APIs are included so
 * new callers don't hit the same wall.
 */

const React = require("react");
const RN = require("react-native");

const View = RN.View;
const Text = RN.Text || RN.View;
const ScrollView = RN.ScrollView || RN.View;
const Image = RN.Image || RN.View;

function createAnimatedComponent(Component) {
  const Base = Component || View;
  return React.forwardRef(function AnimatedComponent(props, ref) {
    return React.createElement(Base, Object.assign({}, props, { ref }));
  });
}

const AnimatedView = createAnimatedComponent(View);
const AnimatedText = createAnimatedComponent(Text);
const AnimatedScrollView = createAnimatedComponent(ScrollView);
const AnimatedImage = createAnimatedComponent(Image);

function makeMutable(initial) {
  return {
    value: initial,
    get() {
      return this.value;
    },
    set(next) {
      this.value = typeof next === "function" ? next(this.value) : next;
    },
    modify(modifier) {
      this.value = modifier ? modifier(this.value) : this.value;
    },
    addListener() {},
    removeListener() {},
  };
}

function useSharedValue(initial) {
  const ref = React.useRef(undefined);
  if (ref.current === undefined) {
    ref.current = makeMutable(initial);
  }
  return ref.current;
}

function useAnimatedStyle(factory) {
  try {
    return factory() || {};
  } catch (error) {
    return {};
  }
}

function useDerivedValue(factory) {
  let value;
  try {
    value = factory();
  } catch (error) {
    value = undefined;
  }
  return useSharedValue(value);
}

function useAnimatedReaction() {}
function useAnimatedScrollHandler() {
  return function scrollHandler() {};
}
function useAnimatedRef() {
  return React.useRef(null);
}

// Resolve synchronously to the target value (see contract above).
function withTiming(toValue) {
  return toValue;
}
function withSpring(toValue) {
  return toValue;
}
function withDelay(_delayMs, animation) {
  return animation;
}
function withRepeat(animation) {
  return animation;
}
function withSequence() {
  const steps = Array.prototype.slice.call(arguments);
  return steps.length ? steps[steps.length - 1] : undefined;
}
function withDecay() {
  return 0;
}
function cancelAnimation() {}

function runOnJS(fn) {
  return function runner() {
    return fn.apply(null, arguments);
  };
}
function runOnUI(fn) {
  return function runner() {
    return fn.apply(null, arguments);
  };
}

function interpolate(value) {
  return typeof value === "number" ? value : 0;
}
function interpolateColor() {
  return "rgba(0,0,0,0)";
}
function measure() {
  return { x: 0, y: 0, width: 0, height: 0, pageX: 0, pageY: 0 };
}

// Every Easing access returns a chainable callable so module-load-time uses like
// `Easing.out(Easing.cubic)`, `Easing.linear`, and `Easing.bezier(...)` all work.
const easing = function easing() {
  return easing;
};
const Easing = new Proxy({}, { get: () => easing });

const Extrapolation = { CLAMP: "clamp", EXTEND: "extend", IDENTITY: "identity" };

const Animated = {
  View: AnimatedView,
  Text: AnimatedText,
  ScrollView: AnimatedScrollView,
  Image: AnimatedImage,
  createAnimatedComponent,
};

module.exports = {
  __esModule: true,
  default: Animated,
  View: AnimatedView,
  Text: AnimatedText,
  ScrollView: AnimatedScrollView,
  Image: AnimatedImage,
  createAnimatedComponent,
  useSharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useAnimatedRef,
  withTiming,
  withSpring,
  withDelay,
  withRepeat,
  withSequence,
  withDecay,
  cancelAnimation,
  runOnJS,
  runOnUI,
  interpolate,
  interpolateColor,
  measure,
  makeMutable,
  Easing,
  Extrapolation,
  Extrapolate: Extrapolation,
};
