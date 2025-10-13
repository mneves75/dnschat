import SwiftUI

struct BubbleShape: Shape {
  let isMe: Bool

  func path(in rect: CGRect) -> Path {
    var path = RoundedRectangle(cornerRadius: 18, style: .continuous).path(in: rect)
    if isMe {
      path = path.offsetBy(dx: 0, dy: 0)
    }
    return path
  }
}

struct MessageRow: View {
  let item: MessageItem

  var body: some View {
    HStack(spacing: 0) {
      if item.isMe {
        Spacer(minLength: 40)
      }
      Text(item.text)
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(
          BubbleShape(isMe: item.isMe)
            .fill(item.isMe ? Color(red: 10 / 255, green: 132 / 255, blue: 1) : Color(uiColor: .secondarySystemBackground))
        )
        .foregroundStyle(item.isMe ? Color.white : Color.primary)
        .frame(maxWidth: 280, alignment: item.isMe ? .trailing : .leading)
        .contentShape(Rectangle())
      if !item.isMe {
        Spacer(minLength: 40)
      }
    }
    .padding(.vertical, 2)
  }
}
