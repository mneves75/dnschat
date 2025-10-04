# Using a ScrollView

The [ScrollView](/docs/scrollview) is a generic scrolling container that can
contain multiple components and views. The scrollable items can be
heterogeneous, and you can scroll both vertically and horizontally (by setting
the `horizontal` property).

This example creates a vertical `ScrollView` with both images and text mixed
together.

ScrollViews can be configured to allow paging through views using swiping
gestures by using the `pagingEnabled` props. Swiping horizontally between
views can also be implemented on Android using the
[ViewPager](https://github.com/react-native-community/react-native-viewpager)
component.

On iOS a ScrollView with a single item can be used to allow the user to zoom
content. Set up the `maximumZoomScale` and `minimumZoomScale` props and your
user will be able to use pinch and expand gestures to zoom in and out.

The ScrollView works best to present a small number of things of a limited
size. All the elements and views of a `ScrollView` are rendered, even if they
are not currently shown on the screen. If you have a long list of items which
cannot fit on the screen, you should use a `FlatList` instead. So let's [learn
about list views](/docs/using-a-listview) next.

[Edit page for next release](https://github.com/facebook/react-native-
website/edit/main/docs/using-a-scrollview.md)[Edit page for current
release](https://github.com/facebook/react-native-
website/edit/main/website/versioned_docs/version-0.81/using-a-scrollview.md)

Last updated on **Aug 12, 2025**

[ PreviousHandling Text Input](/docs/handling-text-input)[NextUsing List
Views](/docs/using-a-listview)

