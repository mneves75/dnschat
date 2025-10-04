This is documentation for React Native **0.80** , which is no longer in active
development.

For up-to-date documentation, see the **[latest version](/docs/handling-text-
input)** (0.81).

Version: 0.80

# Handling Text Input

[`TextInput`](/docs/0.80/textinput#content) is a [Core
Component](/docs/0.80/intro-react-native-components) that allows the user to
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
[reference docs for TextInput](/docs/0.80/textinput).

Text input is one of the ways the user interacts with the app. Next, let's
look at another type of input and [learn how to handle
touches](/docs/0.80/handling-touches).

[Edit page for next release](https://github.com/facebook/react-native-
website/edit/main/docs/handling-text-input.md)[Edit page for 0.80
release](https://github.com/facebook/react-native-
website/edit/main/website/versioned_docs/version-0.80/handling-text-input.md)

Last updated on **Jun 17, 2025**

[ PreviousReact Fundamentals](/docs/0.80/intro-react)[NextUsing a
ScrollView](/docs/0.80/using-a-scrollview)

