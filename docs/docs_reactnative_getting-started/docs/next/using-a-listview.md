This is unreleased documentation for React Native **Next** version.

For up-to-date documentation, see the **[latest version](/docs/using-a-
listview)** (0.81).

Version: Next

# Using List Views

React Native provides a suite of components for presenting lists of data.
Generally, you'll want to use either [FlatList](/docs/next/flatlist) or
[SectionList](/docs/next/sectionlist).

The `FlatList` component displays a scrolling list of changing, but similarly
structured, data. `FlatList` works well for long lists of data, where the
number of items might change over time. Unlike the more generic
[`ScrollView`](/docs/next/using-a-scrollview), the `FlatList` only renders
elements that are currently showing on the screen, not all the elements at
once.

The `FlatList` component requires two props: `data` and `renderItem`. `data`
is the source of information for the list. `renderItem` takes one item from
the source and returns a formatted component to render.

This example creates a basic `FlatList` of hardcoded data. Each item in the
`data` props is rendered as a `Text` component. The `FlatListBasics` component
then renders the `FlatList` and all `Text` components.

If you want to render a set of data broken into logical sections, maybe with
section headers, similar to `UITableView` on iOS, then a
[SectionList](/docs/next/sectionlist) is the way to go.

One of the most common uses for a list view is displaying data that you fetch
from a server. To do that, you will need to [learn about networking in React
Native](/docs/next/network).

[Edit this page](https://github.com/facebook/react-native-
website/edit/main/docs/using-a-listview.md)

Last updated on **Oct 1, 2025**

[ PreviousUsing a ScrollView](/docs/next/using-a-
scrollview)[NextTroubleshooting](/docs/next/troubleshooting)

