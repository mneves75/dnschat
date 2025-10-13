import ExpoModulesCore
import SwiftUI
import UIKit

final class ExpoChatView: ExpoView, UICollectionViewDelegate {
  private typealias Section = Int
  private typealias DataSource = UICollectionViewDiffableDataSource<Section, MessageItem>
  private typealias Snapshot = NSDiffableDataSourceSnapshot<Section, MessageItem>

  private static let nearTopThreshold: CGFloat = 120

  private let collectionView: UICollectionView
  private lazy var dataSource: DataSource = makeDataSource()
  private var messages: [MessageItem] = []
  private var hasEmittedNearTop = false
  private var lastVisibleIdentifiers: [String] = []

  private var bottomInset: CGFloat = 24 {
    didSet {
      collectionView.contentInset.bottom = bottomInset
      collectionView.verticalScrollIndicatorInsets.bottom = bottomInset
    }
  }

  let onNearTop = EventDispatcher()
  let onVisibleIdsChange = EventDispatcher()
  let onPressMessage = EventDispatcher()

  override init(appContext: AppContext? = nil) {
    let layout = Self.makeLayout()
    collectionView = UICollectionView(frame: .zero, collectionViewLayout: layout)
    super.init(appContext: appContext)
    configureCollectionView()
  }

  override func layoutSubviews() {
    super.layoutSubviews()
    collectionView.frame = bounds
  }

  func update(messages newMessages: [MessageDTO]) {
    let sorted = newMessages.sorted { $0.createdAt < $1.createdAt }
    let items = sorted.map(MessageItem.init)
    let shouldAutoScroll = isNearBottom()

    messages = items
    var snapshot = Snapshot()
    snapshot.appendSections([0])
    snapshot.appendItems(items, toSection: 0)

    dataSource.apply(snapshot, animatingDifferences: !messages.isEmpty) { [weak self] in
      guard let self else { return }
      if shouldAutoScroll {
        self.scrollToEnd(animated: true)
      }
      self.updateVisibleIdentifiers()
    }
  }

  func update(contentBottomInset value: Double) {
    bottomInset = CGFloat(value)
  }

  @MainActor
  func scrollToEnd(animated: Bool) {
    guard !messages.isEmpty else { return }
    let indexPath = IndexPath(item: messages.count - 1, section: 0)
    collectionView.layoutIfNeeded()
    collectionView.scrollToItem(at: indexPath, at: .bottom, animated: animated)
  }

  private func configureCollectionView() {
    addSubview(collectionView)
    collectionView.delegate = self
    collectionView.backgroundColor = .clear
    collectionView.alwaysBounceVertical = true
    collectionView.keyboardDismissMode = .interactive
    collectionView.contentInset = UIEdgeInsets(top: 12, left: 0, bottom: bottomInset, right: 0)
    collectionView.verticalScrollIndicatorInsets = UIEdgeInsets(top: 0, left: 0, bottom: bottomInset, right: 0)
    collectionView.register(MessageCell.self, forCellWithReuseIdentifier: MessageCell.reuseIdentifier)
  }

  private func makeDataSource() -> DataSource {
    DataSource(collectionView: collectionView) { [weak self] collectionView, indexPath, itemIdentifier in
      guard let cell = collectionView.dequeueReusableCell(withReuseIdentifier: MessageCell.reuseIdentifier, for: indexPath) as? MessageCell else {
        return UICollectionViewCell()
      }
      cell.configure(with: itemIdentifier, traitCollection: self?.traitCollection)
      return cell
    }
  }

  private func emitNearTopIfNeeded() {
    let offset = collectionView.contentOffset.y + collectionView.adjustedContentInset.top
    if offset < Self.nearTopThreshold {
      if !hasEmittedNearTop {
        hasEmittedNearTop = true
        onNearTop()
      }
    } else if offset > Self.nearTopThreshold * 1.5 {
      hasEmittedNearTop = false
    }
  }

  private func updateVisibleIdentifiers() {
    let ids = collectionView.indexPathsForVisibleItems
      .sorted()
      .compactMap { indexPath -> String? in
        guard indexPath.item >= 0, indexPath.item < messages.count else { return nil }
        return messages[indexPath.item].id
      }

    guard ids != lastVisibleIdentifiers else { return }
    lastVisibleIdentifiers = ids
    onVisibleIdsChange(["ids": ids])
  }

  private func isNearBottom() -> Bool {
    let visibleHeight = collectionView.bounds.height - (collectionView.adjustedContentInset.top + collectionView.adjustedContentInset.bottom)
    guard visibleHeight > 0 else { return true }
    let contentHeight = collectionView.contentSize.height
    let yOffset = collectionView.contentOffset.y + visibleHeight
    return contentHeight - yOffset < 120
  }

  func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
    guard indexPath.item < messages.count else { return }
    onPressMessage(["id": messages[indexPath.item].id])
  }

  func scrollViewDidScroll(_ scrollView: UIScrollView) {
    emitNearTopIfNeeded()
    updateVisibleIdentifiers()
  }

  func scrollViewDidEndDecelerating(_ scrollView: UIScrollView) {
    updateVisibleIdentifiers()
  }

  func scrollViewDidEndDragging(_ scrollView: UIScrollView, willDecelerate decelerate: Bool) {
    if !decelerate {
      updateVisibleIdentifiers()
    }
  }

  private static func makeLayout() -> UICollectionViewFlowLayout {
    let layout = UICollectionViewFlowLayout()
    layout.estimatedItemSize = UICollectionViewFlowLayout.automaticSize
    layout.minimumLineSpacing = 12
    layout.sectionInset = .zero
    layout.minimumInteritemSpacing = 0
    layout.scrollDirection = .vertical
    return layout
  }
}

private final class MessageCell: UICollectionViewCell {
  static let reuseIdentifier = "MessageCell"

  override init(frame: CGRect) {
    super.init(frame: frame)
    backgroundColor = .clear
    contentView.backgroundColor = .clear
  }

  @available(*, unavailable)
  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }

  override func prepareForReuse() {
    super.prepareForReuse()
    if #available(iOS 16.0, *) {
      contentConfiguration = nil
    }
  }

  func configure(with item: MessageItem, traitCollection: UITraitCollection?) {
    if #available(iOS 16.0, *) {
      contentConfiguration = UIHostingConfiguration {
        MessageRow(item: item)
          .environment(\.colorScheme, traitCollection?.userInterfaceStyle == .dark ? .dark : .light)
      }
      .margins(.all, 0)
    } else {
      var configuration = UIListContentConfiguration.cell()
      configuration.text = item.text
      contentConfiguration = configuration
    }
  }
}
