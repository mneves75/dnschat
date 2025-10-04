This is documentation for React Native **0.80** , which is no longer in active
development.

For up-to-date documentation, see the **[latest version](/docs/the-new-
architecture/what-is-codegen)** (0.81).

Version: 0.80

On this page

# What is Codegen?

**Codegen** is a tool to avoid writing a lot of repetitive code. Using Codegen
**is not mandatory** : you can write all the generated manually. However,
**Codegen** generates scaffolding code that could save you a lot of time.

React Native invokes **Codegen** automatically every time an iOS or Android
app is built. Occasionally, you would like to manually run the **Codegen**
scripts to know which types and files are actually generated: this is a common
scenario when developing Turbo Native Modules and Fabric Native Components.

## How does Codegen works​

**Codegen** is a process that is tightly coupled with a React Native app. The
**Codegen** scripts live inside the `react-native` NPM package and the apps
call those scripts at build time.

**Codegen** crawls the folders in your project, starting from a directory you
specify in your `package.json`, looking for some specific JS files that
contains the specification (or specs) for your custom modules and components.
Spec files are JS files written in a typed dialect: React Native currently
supports Flow and TypeScript.

Every time **Codegen** finds a spec file, it generates the boilerplate code
associated to it. **Codegen** generates some C++ glue-code and then it
generates platform-specific code, using Java for Android and Objective-C++ for
iOS.

[Edit page for next release](https://github.com/facebook/react-native-
website/edit/main/docs/the-new-architecture/what-is-codegen.md)[Edit page for
0.80 release](https://github.com/facebook/react-native-
website/edit/main/website/versioned_docs/version-0.80/the-new-
architecture/what-is-codegen.md)

Last updated on **Jun 17, 2025**

[ PreviousUsing Hermes](/docs/0.80/hermes)[NextUsing Codegen](/docs/0.80/the-
new-architecture/using-codegen)

  * How does Codegen works

