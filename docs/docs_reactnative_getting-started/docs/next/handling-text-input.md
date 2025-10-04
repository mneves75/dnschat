This is unreleased documentation for React Native **Next** version.

For up-to-date documentation, see the **[latest version](/docs/handling-text-
input)** (0.81).

Version: Next

# Handling Text Input

[`TextInput`](/docs/next/textinput#content) is a [Core
Component](/docs/next/intro-react-native-components) that allows the user to
enter text. It has an `onChangeText` prop that takes a function to be called
every time the text changed, and an `onSubmitEditing` prop that takes a
function to be called when the text is submitted.

For example, let's say that as the user types, you're translating their words
into a different language. In this new language, every single word is written
the same way: 🍕. So the sentence "Hello there Bob" would be translated as "🍕 🍕
🍕".

In this example, we store `text` in the state, because it changes over time.

There are a lot more things you might want to do with a text input. For
example, you could validate the text inside while the user types. For more
detailed examples, see the [React docs on controlled
components](https://react.dev/reference/react-
dom/components/input#controlling-an-input-with-a-state-variable), or the
[reference docs for TextInput](/docs/next/textinput).

Text input is one of the ways the user interacts with the app. Next, let's
look at another type of input and [learn how to handle
touches](/docs/next/handling-touches).

[Edit this page](https://github.com/facebook/react-native-
website/edit/main/docs/handling-text-input.md)

Last updated on **Nov 23, 2024**

[ PreviousReact Fundamentals](/docs/next/intro-react)[NextUsing a
ScrollView](/docs/next/using-a-scrollview)

