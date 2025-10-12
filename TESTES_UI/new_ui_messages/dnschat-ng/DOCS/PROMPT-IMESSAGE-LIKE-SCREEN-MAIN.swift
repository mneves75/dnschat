Awesome — here’s a complete, working blueprint for building an iMessage‑feel chat in Expo SDK 54 with the New Architecture (Fabric), using a native iOS renderer made of Swift + UICollectionView and SwiftUI cells via UIHostingConfiguration.
React (with React Query) drives all state and data fetching; the native view renders and animates.

✅ You said you’re OK with a custom dev client / prebuild. That’s required to add the Swift Fabric view.

⸻

What you’ll end up with
	•	A Fabric Expo view module (expo-chatview) that exposes a <ChatView /> component to JS.
	•	iOS renderer = UICollectionView (+ diffable data source) with SwiftUI bubbles using UIHostingConfiguration (iOS 16+).
	•	Events to JS: onNearTop (fetch older), onPressMessage, onVisibleIdsChange.
	•	Commands from JS: scrollToEnd, scrollToIndex.
	•	React Query useInfiniteQuery for pagination, optimistic sends, and snapshots → passed into the native view.

⸻

0) Requirements
	•	Expo SDK 54 (RN 0.74)
	•	iOS 16+ (for UIHostingConfiguration)
	•	New Architecture enabled (Fabric/Hermes)
	•	Custom dev client (or Bare) to include the Swift code

⸻

1) Project setup

npx create-expo-app chat-fabric
cd chat-fabric
pnpm add @tanstack/react-query
pnpm add -D @types/react
expo install expo-dev-client

Enable iOS 16 and New Arch via plugin:

app.json

{
  "expo": {
    "name": "chat-fabric",
    "slug": "chat-fabric",
    "plugins": [
      ["expo-build-properties", { "ios": { "deploymentTarget": "16.0" } }]
    ],
    "ios": {
      "bundleIdentifier": "com.yourco.chatfabric",
      "supportsTablet": false
    }
  }
}

Prebuild to create native projects:

npx expo prebuild -p ios

If you ever need to toggle new-arch manually: set ENV['RCT_NEW_ARCH_ENABLED'] = '1' in ios/Podfile.

⸻

2) Create the native Fabric view (Expo Module)

Scaffold a view module:

npx create-expo-module -t view expo-chatview
# When asked: language Swift, include iOS, name "ExpoChatView"

This creates packages/expo-chatview/ with Swift + TypeScript glue.

Add it to your app (workspace or monorepo is fine). From the app root, add a file dependency:

package.json (root)

{
  "private": true,
  "workspaces": ["packages/*"],
  "dependencies": {
    "expo-chatview": "file:packages/expo-chatview"
  }
}

Re-run autolinking and pods:

pnpm install
npx pod-install

2.1 Define the props, events, and commands (Swift)

Inside packages/expo-chatview/ios replace the generated files with these.

MessageDTO.swift

import ExpoModulesCore

struct MessageDTO: Record, Hashable {
  @Field var id: String
  @Field var text: String
  @Field var isMe: Bool
  @Field var createdAt: Double // seconds since epoch
}

MessageItem.swift

import Foundation

struct MessageItem: Hashable {
  let id: String
  let text: String
  let isMe: Bool
  let createdAt: Date

  init(dto: MessageDTO) {
    self.id = dto.id
    self.text = dto.text
    self.isMe = dto.isMe
    self.createdAt = Date(timeIntervalSince1970: dto.createdAt)
  }
}

MessageRow.swift (SwiftUI bubble)
(very small, tweak as you like)

import SwiftUI

struct BubbleShape: Shape {
  let isMe: Bool
  func path(in r: CGRect) -> Path {
    var p = RoundedRectangle(cornerRadius: 18).path(in: r)
    // You can add a tail if you want; kept simple for clarity.
    return p
  }
}

struct MessageRow: View {
  let item: MessageItem

  var body: some View {
    HStack {
      if item.isMe { Spacer(minLength: 40) }
      Text(item.text)
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(
          BubbleShape(isMe: item.isMe)
            .fill(item.isMe ? Color.blue : Color(UIColor.secondarySystemBackground))
        )
        .foregroundColor(item.isMe ? .white : .primary)
        .frame(maxWidth: 280, alignment: item.isMe ? .trailing : .leading)
      if !item.isMe { Spacer(minLength: 40) }
    }
    .contentShape(Rectangle())
  }
}

ExpoChatView.swift (the Fabric view)

import ExpoModulesCore
import UIKit
import SwiftUI

final class ExpoChatView: ExpoView, UICollectionViewDelegate {

  // MARK: Props from JS
  @Prop var messages: [MessageDTO] = [] { didSet { applySnapshot(from: messages) } }
  @Prop var inverted: Bool = true
  @Prop var contentInsetTop: Double = 8
  @Prop var contentInsetBottom: Double = 8

  // MARK: Events to JS
  @Event var onNearTop: EventDispatcher
  @Event var onPressMessage: EventDispatcher
  @Event var onVisibleIdsChange: EventDispatcher

  enum Section { case main }

  private lazy var layout: UICollectionViewCompositionalLayout = {
    var config = UICollectionLayoutListConfiguration(appearance: .plain)
    config.headerMode = .none
    config.showsSeparators = false
    config.backgroundColor = .clear
    return UICollectionViewCompositionalLayout.list(using: config)
  }()

  private lazy var collectionView: UICollectionView = {
    let cv = UICollectionView(frame: .zero, collectionViewLayout: layout)
    cv.backgroundColor = .clear
    cv.alwaysBounceVertical = true
    cv.contentInset = UIEdgeInsets(top: contentInsetTop, left: 0, bottom: contentInsetBottom, right: 0)
    cv.delegate = self
    return cv
  }()

  private var dataSource: UICollectionViewDiffableDataSource<Section, MessageItem>!
  private var cellRegistration: UICollectionView.CellRegistration<UICollectionViewListCell, MessageItem>!

  override init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    setUp()
  }

  required init?(coder: NSCoder) { fatalError() }

  private func setUp() {
    addSubview(collectionView)
    collectionView.translatesAutoresizingMaskIntoConstraints = false
    NSLayoutConstraint.activate([
      collectionView.leadingAnchor.constraint(equalTo: leadingAnchor),
      collectionView.trailingAnchor.constraint(equalTo: trailingAnchor),
      collectionView.topAnchor.constraint(equalTo: topAnchor),
      collectionView.bottomAnchor.constraint(equalTo: bottomAnchor)
    ])

    cellRegistration = UICollectionView.CellRegistration<UICollectionViewListCell, MessageItem> { cell, _, item in
      cell.contentConfiguration = UIHostingConfiguration {
        MessageRow(item: item)
          .onTapGesture {
            self.onPressMessage(["id": item.id])
          }
      }.margins(.all, 4)
      cell.backgroundConfiguration = UIBackgroundConfiguration.clear()
    }

    dataSource = UICollectionViewDiffableDataSource<Section, MessageItem>(
      collectionView: collectionView
    ) { [weak self] (cv, indexPath, item) in
      guard let self = self else { return UICollectionViewCell() }
      return cv.dequeueConfiguredReusableCell(using: self.cellRegistration, for: indexPath, item: item)
    }

    // Observe scroll to detect "near top" for pagination
    collectionView.addObserver(self, forKeyPath: #keyPath(UICollectionView.contentOffset), options: [.new], context: nil)
  }

  deinit {
    collectionView.removeObserver(self, forKeyPath: #keyPath(UICollectionView.contentOffset))
  }

  // MARK: Snapshot/updates
  private var lastItems: [MessageItem] = []

  private func applySnapshot(from dtos: [MessageDTO]) {
    let items = dtos.map { MessageItem(dto: $0) }
    lastItems = items
    var snapshot = NSDiffableDataSourceSnapshot<Section, MessageItem>()
    snapshot.appendSections([.main])
    snapshot.appendItems(items, toSection: .main)
    dataSource.apply(snapshot, animatingDifferences: true) { [weak self] in
      guard let self = self else { return }
      self.emitVisibleIds()
    }
  }

  // MARK: Public commands (called from module)
  func scrollToEnd(animated: Bool = true) {
    guard !lastItems.isEmpty else { return }
    let index = inverted ? 0 : lastItems.count - 1
    let ip = IndexPath(item: index, section: 0)
    collectionView.scrollToItem(at: ip, at: inverted ? .top : .bottom, animated: animated)
  }

  func scrollToIndex(_ index: Int, animated: Bool = true) {
    guard index >= 0, index < lastItems.count else { return }
    let ip = IndexPath(item: index, section: 0)
    collectionView.scrollToItem(at: ip, at: .centeredVertically, animated: animated)
  }

  // MARK: Scroll events
  override func observeValue(forKeyPath keyPath: String?, of object: Any?,
                             change: [NSKeyValueChangeKey : Any]?, context: UnsafeMutableRawPointer?) {
    guard keyPath == "contentOffset" else { return }
    // Trigger when 60pt from the top (older messages)
    if collectionView.contentOffset.y < -60 {
      onNearTop([:])
    }
  }

  func scrollViewDidEndDecelerating(_ scrollView: UIScrollView) { emitVisibleIds() }
  func scrollViewDidEndDragging(_ scrollView: UIScrollView, willDecelerate decelerate: Bool) {
    if !decelerate { emitVisibleIds() }
  }

  private func emitVisibleIds() {
    let ids = collectionView.indexPathsForVisibleItems
      .sorted()
      .compactMap { dataSource.itemIdentifier(for: $0)?.id }
    onVisibleIdsChange(["ids": ids])
  }
}

ExpoChatViewModule.swift (module + commands)

import ExpoModulesCore

public class ExpoChatViewModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoChatView")

    View(ExpoChatView.self) {
      Events("onNearTop", "onPressMessage", "onVisibleIdsChange")

      Prop("messages") { (view, value: [MessageDTO]) in
        view.messages = value
      }
      Prop("inverted") { (view, value: Bool) in view.inverted = value }
      Prop("contentInsetTop") { (view, value: Double) in view.contentInsetTop = value }
      Prop("contentInsetBottom") { (view, value: Double) in view.contentInsetBottom = value }

      AsyncFunction("scrollToEnd") { (view: ExpoChatView) in
        view.scrollToEnd(animated: true)
      }
      AsyncFunction("scrollToIndex") { (view: ExpoChatView, index: Int) in
        view.scrollToIndex(index, animated: true)
      }
    }
  }
}


⸻

3) The JS/TS side (React wrapper + React Query)

packages/expo-chatview/src/ChatView.tsx

import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { requireNativeViewManager, NativeModulesProxy, findNodeHandle, ViewStyle } from 'expo-modules-core';

export type ChatMessage = {
  id: string;
  text: string;
  isMe: boolean;
  createdAt: number; // epoch seconds
};

type NativeProps = {
  messages: ChatMessage[];
  inverted?: boolean;
  contentInsetTop?: number;
  contentInsetBottom?: number;
  style?: ViewStyle;

  onNearTop?: () => void;
  onPressMessage?: (e: { nativeEvent: { id: string } }) => void;
  onVisibleIdsChange?: (e: { nativeEvent: { ids: string[] } }) => void;
};

const NativeChatView: React.ComponentType<NativeProps> =
  requireNativeViewManager('ExpoChatView');

const NativeModule = NativeModulesProxy.ExpoChatView as any;

export type ChatViewHandle = {
  scrollToEnd(): void;
  scrollToIndex(index: number): void;
};

export const ChatView = forwardRef<ChatViewHandle, NativeProps>((props, ref) => {
  const innerRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    scrollToEnd() {
      const tag = findNodeHandle(innerRef.current);
      NativeModule.scrollToEnd(tag);
    },
    scrollToIndex(index: number) {
      const tag = findNodeHandle(innerRef.current);
      NativeModule.scrollToIndex(tag, index);
    }
  }));

  return <NativeChatView ref={innerRef} {...props} />;
});

Add an index export:

packages/expo-chatview/src/index.ts

export { ChatView } from './ChatView';
export type { ChatMessage, ChatViewHandle } from './ChatView';

Build TypeScript:

pnpm --filter expo-chatview build


⸻

4) Use it in your Expo app

src/api/messages.ts (mock service; replace with your backend)

export type Page = { items: any[]; nextCursor?: string | null };

export async function fetchMessages(roomId: string, cursor?: string | null): Promise<Page> {
  // Server returns older messages when cursor provided (for "scroll up")
  // Here we mock: newest at the end
  await new Promise(r => setTimeout(r, 300));
  const now = Math.floor(Date.now() / 1000);
  const base = Array.from({ length: 20 }).map((_, i) => ({
    id: `${cursor ?? 'seed'}-${i}`,
    text: `Message ${i}${cursor ? ' (older)' : ''}`,
    isMe: i % 3 === 0,
    createdAt: now - (cursor ? 2000 + i : i)
  }));
  return { items: base.reverse(), nextCursor: cursor ? null : 'older-1' };
}

src/screens/ChatScreen.tsx

import React, { useMemo, useRef } from 'react';
import { SafeAreaView, View, Button } from 'react-native';
import { useInfiniteQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChatView, ChatMessage, ChatViewHandle } from 'expo-chatview';
import { fetchMessages } from '../api/messages';

const qc = new QueryClient();

function ChatInner({ roomId }: { roomId: string }) {
  const chatRef = useRef<ChatViewHandle>(null);

  const query = useInfiniteQuery({
    queryKey: ['chat', roomId],
    queryFn: ({ pageParam }) => fetchMessages(roomId, pageParam ?? null),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor ?? null
  });

  const messages: ChatMessage[] = useMemo(() => {
    const pages = query.data?.pages ?? [];
    const items = pages.flatMap(p => p.items) as ChatMessage[];
    // Ensure ascending by createdAt (top=older, bottom=newer)
    return items.sort((a, b) => a.createdAt - b.createdAt);
  }, [query.data]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ChatView
        ref={chatRef}
        style={{ flex: 1 }}
        messages={messages}
        inverted={false} // list is chronological; bottom is newest
        contentInsetTop={8}
        contentInsetBottom={12}
        onNearTop={() => query.fetchNextPage()} // infinite "older" loading
        onPressMessage={(e) => console.log('press', e.nativeEvent.id)}
      />
      <View style={{ padding: 8 }}>
        <Button title="Scroll to end" onPress={() => chatRef.current?.scrollToEnd()} />
      </View>
    </SafeAreaView>
  );
}

export default function ChatScreen() {
  return (
    <QueryClientProvider client={qc}>
      <ChatInner roomId="r1" />
    </QueryClientProvider>
  );
}

Run with a custom dev client:

pnpm expo run:ios   # builds locally with your native module
# or
pnpm expo start --dev-client

You now have:
	•	JS controls (React Query for fetching, mutations, optimistic updates).
	•	Native renders the list with UIKit + SwiftUI, giving smooth perf + free UICollectionView animations.

⸻

Notes & rationale

Why a native renderer?
	•	Zero JS rendering pressure while scrolling (no blank gaps).
	•	Diffable data source animates inserts/removals for free (iMessage‑like behavior).
	•	SwiftUI hosting keeps cell code tiny yet fully native.

Keeping JS ↔ native sync cheap
	•	Pass a flat array of lightweight messages (id, text, isMe, createdAt).
	•	The view applies a diffable snapshot; you don’t push “operations” across the bridge.
	•	For very large histories, you can add append/prepend commands to send only deltas; the above works well into thousands of rows.

Pagination pattern
	•	Emit onNearTop as the user approaches the top → useInfiniteQuery.fetchNextPage().
	•	You can preserve scroll position when prepending by applying the snapshot without calling scrollToEnd. If you need pixel‑perfect anchoring across large prepends, capture and restore contentOffset around the snapshot apply.

Sending messages (optimistic)

Use a mutation that writes into the React Query cache, update the messages array, and let the native view animate the insertion. On server ack, update status / replace the temp id — diffable animates it.

iOS specifics
	•	UIHostingConfiguration requires iOS 16+ (we set that in build properties).
	•	Fabric is enabled by default on RN 0.74; if you ever need to force it, set RCT_NEW_ARCH_ENABLED=1.
	•	If you want typing indicators, add a trailing “virtual” item and render a special SwiftUI row.

⸻

Extending the cell (images, status, time groups)

Replace MessageRow with a richer SwiftUI layout:

struct MessageRow: View {
  let item: MessageItem
  var body: some View {
    VStack(alignment: item.isMe ? .trailing : .leading, spacing: 4) {
      HStack {
        if item.isMe { Spacer(minLength: 40) }
        Text(item.text)
          .padding(10)
          .background(BubbleShape(isMe: item.isMe).fill(item.isMe ? Color.blue : Color(UIColor.secondarySystemBackground)))
          .foregroundColor(item.isMe ? .white : .primary)
        if !item.isMe { Spacer(minLength: 40) }
      }
      Text(item.createdAt.formatted(date: .omitted, time: .shortened))
        .font(.caption2)
        .foregroundColor(.secondary)
        .padding(item.isMe ? .trailing : .leading, 10)
    }
  }
}

Add read receipts, reactions, attachments — all in SwiftUI, still self-sizing.

⸻

Cross‑platform fallback (optional)

If you need Android immediately, you can render a JS list when the native view isn’t available:

import { Platform, FlatList, Text, View } from 'react-native';
// ...
return Platform.OS === 'ios'
  ? <ChatView /* native */ {...props} />
  : <FlatList
      data={messages}
      renderItem={({ item }) => (
        <View style={{ padding: 6, alignItems: item.isMe ? 'flex-end' : 'flex-start' }}>
          <Text style={{
            paddingHorizontal: 12, paddingVertical: 8,
            backgroundColor: item.isMe ? '#0a84ff' : '#e9e9eb',
            color: item.isMe ? 'white' : 'black', borderRadius: 18, maxWidth: 280
          }}>
            {item.text}
          </Text>
        </View>
      )}
    />;


⸻

Troubleshooting
	•	“symbol not found / new arch off” → ensure pods installed after prebuild; check RCT_NEW_ARCH_ENABLED=1.
	•	Blank screen → verify the module name is ExpoChatView, and autolinking pulled it in (npx react-native config shows it).
	•	No iMessage‑like animation → ensure dataSource.apply(snapshot, animatingDifferences: true) and you aren’t re‑mounting the native view; keep prop identities stable.

⸻

What to try next
	•	Add onMeasureContent from cells to support “jump to unread” with precise offsets.
	•	Add context menus (long‑press) from SwiftUI (.contextMenu) and pass selections to JS.
	•	Support images/video via SwiftUI.AsyncImage or custom views in the hosting configuration.

⸻

If you want, I can package the above into a minimal repo layout (app + packages/expo-chatview) so you can drop it into your project.