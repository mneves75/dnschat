On this page

# JavaScript Environment

## JavaScript Runtime​

When using React Native, you're going to be running your JavaScript code in up
to three environments:

  * In most cases, React Native will use [Hermes](/docs/hermes), an open-source JavaScript engine optimized for React Native.
  * If Hermes is disabled, React Native will use [JavaScriptCore](https://trac.webkit.org/wiki/JavaScriptCore), the JavaScript engine that powers Safari. Note that on iOS, JavaScriptCore does not use JIT due to the absence of writable executable memory in iOS apps.
  * When using Chrome debugging, all JavaScript code runs within Chrome itself, communicating with native code via WebSockets. Chrome uses [V8](https://v8.dev/) as its JavaScript engine.

While these environments are very similar, you may end up hitting some
inconsistencies. It is best to avoid relying on specifics of any runtime.

## JavaScript Syntax Transformers​

Syntax transformers make writing code more enjoyable by allowing you to use
new JavaScript syntax without having to wait for support on all interpreters.

React Native ships with the [Babel JavaScript compiler](https://babeljs.io).
Check [Babel documentation](https://babeljs.io/docs/plugins/#transform-
plugins) on its supported transformations for more details.

A full list of React Native's enabled transformations can be found in [@react-
native/babel-preset](https://github.com/facebook/react-
native/tree/main/packages/react-native-babel-preset).

Transformation| Code  
---|---  
ECMAScript 5  
Reserved Words|

    
    
    promise.catch(function() {...});  
      
  
ECMAScript 2015 (ES6)  
[Arrow functions](https://babeljs.io/docs/learn-es2015/#arrows)|

    
    
    <C onPress={() => this.setState({pressed: true})} />  
      
  
[Block scoping](https://babeljs.io/docs/learn-es2015/#let-const)|

    
    
    let greeting = 'hi';  
      
  
[Call spread](https://babeljs.io/docs/learn-es2015/#default-rest-spread)|

    
    
    Math.max(...array);  
      
  
[Classes](https://babeljs.io/docs/learn-es2015/#classes)|

    
    
    class C extends React.Component {render() { return <View />; }}  
      
  
[Computed Properties](https://babeljs.io/docs/learn-es2015/#enhanced-object-
literals)|

    
    
    const key = 'abc'; const obj = {[key]: 10};  
      
  
[Constants](https://babeljs.io/docs/learn-es2015/#let-const)|

    
    
    const answer = 42;  
      
  
[Destructuring](https://babeljs.io/docs/learn-es2015/#destructuring)|

    
    
    const {isActive, style} = this.props;  
      
  
[for…of](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Statements/for...of)|

    
    
    for (var num of [1, 2, 3]) {...};  
      
  
[Function Name](https://babeljs.io/docs/en/babel-plugin-transform-function-
name)|

    
    
    let number = x => x;  
      
  
[Literals](https://babeljs.io/docs/en/babel-plugin-transform-literals)|

    
    
    const b = 0b11; const o = 0o7; const u = 'Hello\u{000A}\u{0009}!';  
      
  
[Modules](https://babeljs.io/docs/learn-es2015/#modules)|

    
    
    import React, {Component} from 'react';  
      
  
[Object Concise Method](https://babeljs.io/docs/learn-es2015/#enhanced-object-
literals)|

    
    
    const obj = {method() { return 10; }};  
      
  
[Object Short Notation](https://babeljs.io/docs/learn-es2015/#enhanced-object-
literals)|

    
    
    const name = 'vjeux'; const obj = {name};  
      
  
[Parameters](https://babeljs.io/docs/en/babel-plugin-transform-parameters)|

    
    
    function test(x = 'hello', {a, b}, ...args) {}  
      
  
[Rest Params](https://github.com/sebmarkbage/ecmascript-rest-spread)|

    
    
    function(type, ...args) {};  
      
  
[Shorthand Properties](https://babeljs.io/docs/en/babel-plugin-transform-
shorthand-properties)|

    
    
    const o = {a, b, c};  
      
  
[Sticky Regex](https://babeljs.io/docs/en/babel-plugin-transform-sticky-
regex)|

    
    
    const a = /o+/y;  
      
  
[Template Literals](https://babeljs.io/docs/learn-es2015/#template-strings)|

    
    
    const who = 'world'; const str = `Hello ${who}`;  
      
  
[Unicode Regex](https://babeljs.io/docs/en/babel-plugin-transform-unicode-
regex)|

    
    
    const string = 'foo💩bar'; const match = string.match(/foo(.)bar/u);  
      
  
ECMAScript 2016 (ES7)  
[Exponentiation Operator](https://babeljs.io/docs/en/babel-plugin-transform-
exponentiation-operator)|

    
    
    let x = 10 ** 2;  
      
  
ECMAScript 2017 (ES8)  
[Async Functions](https://github.com/tc39/ecmascript-asyncawait)|

    
    
    async function doStuffAsync() {const foo = await doOtherStuffAsync();};  
      
  
[Function Trailing Comma](https://github.com/jeffmo/es-trailing-function-
commas)|

    
    
    function f(a, b, c,) {};  
      
  
ECMAScript 2018 (ES9)  
[Object Spread](https://github.com/tc39/proposal-object-rest-spread)|

    
    
    const extended = {...obj, a: 10};  
      
  
ECMAScript 2019 (ES10)  
[Optional Catch Binding](https://babeljs.io/docs/en/babel-plugin-proposal-
optional-catch-binding)|

    
    
    try {throw 0; } catch { doSomethingWhichDoesNotCareAboutTheValueThrown();}  
      
  
ECMAScript 2020 (ES11)  
[Dynamic Imports](https://babeljs.io/docs/en/babel-plugin-syntax-dynamic-
import)|

    
    
    const package = await import('package'); package.function()  
      
  
[Nullish Coalescing Operator](https://babeljs.io/docs/en/babel-plugin-
proposal-nullish-coalescing-operator)|

    
    
    const foo = object.foo ?? 'default';  
      
  
[Optional Chaining](https://github.com/tc39/proposal-optional-chaining)|

    
    
    const name = obj.user?.name;  
      
  
ECMAScript 2022 (ES13)  
[Class Fields](https://babeljs.io/docs/en/babel-plugin-proposal-class-
properties)|

    
    
    class Bork {static a = 'foo'; static b; x = 'bar'; y;}  
      
  
Stage 1 Proposal  
[Export Default From](https://babeljs.io/docs/en/babel-plugin-proposal-export-
default-from)|

    
    
    export v from 'mod';  
      
  
Miscellaneous  
[Babel Template](https://babeljs.io/docs/en/babel-template)|

    
    
    template(`const %%importName%% = require(%%source%%);`);  
      
  
[Flow](https://flowtype.org/)|

    
    
    function foo(x: ?number): string {};  
      
  
[ESM to CJS](https://babeljs.io/docs/en/babel-plugin-transform-modules-
commonjs)|

    
    
    export default 42;  
      
  
[JSX](https://react.dev/learn/writing-markup-with-jsx)|

    
    
    <View style={{color: 'red'}} />  
      
  
[Object Assign](https://babeljs.io/docs/en/babel-plugin-transform-object-
assign)|

    
    
    Object.assign(a, b);  
      
  
[React Display Name](https://babeljs.io/docs/en/babel-plugin-transform-react-
display-name)|

    
    
    const bar = createReactClass({});  
      
  
[TypeScript](https://www.typescriptlang.org/)|

    
    
    function foo(x: {hello: true, target: 'react native!'}): string {};  
      
  
## Polyfills​

Many standard functions are also available on all the supported JavaScript
runtimes.

#### Browser​

  * [CommonJS `require`](https://nodejs.org/docs/latest/api/modules.html)
  * `[console.{log, warn, error, info, debug, trace, table, group, groupCollapsed, groupEnd}](https://developer.chrome.com/devtools/docs/console-api)`
  * [`XMLHttpRequest`, `fetch`](/docs/network#content)
  * [`{set, clear}{Timeout, Interval, Immediate}, {request, cancel}AnimationFrame`](/docs/timers#content)

#### ECMAScript 2015 (ES6)​

  * [`Array.from`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from)
  * `Array.prototype.{[find](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find), [findIndex](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex)}`
  * [`Object.assign`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
  * `String.prototype.{[startsWith](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith), [endsWith](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith), [repeat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/repeat), [includes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes)}`

#### ECMAScript 2016 (ES7)​

  * `Array.prototype.[includes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes)`

#### ECMAScript 2017 (ES8)​

  * `Object.{[entries](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries), [values](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/values)}`

#### Specific​

  * `__DEV__`

[Edit page for next release](https://github.com/facebook/react-native-
website/edit/main/docs/javascript-environment.md)[Edit page for current
release](https://github.com/facebook/react-native-
website/edit/main/website/versioned_docs/version-0.81/javascript-
environment.md)

Last updated on **Aug 12, 2025**

[ PreviousProfiling](/docs/profiling)[NextTimers](/docs/timers)

  * JavaScript Runtime
  * JavaScript Syntax Transformers
  * Polyfills

