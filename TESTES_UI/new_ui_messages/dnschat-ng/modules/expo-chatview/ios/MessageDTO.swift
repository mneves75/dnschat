import ExpoModulesCore
import Foundation

struct MessageDTO: Record {
  @Field
  var id: String

  @Field
  var text: String

  @Field
  var authorId: String

  @Field
  var status: String

  @Field
  var createdAt: Double
}

struct MessageItem: Hashable {
  let id: String
  let text: String
  let isMe: Bool
  let createdAt: Date
  let authorId: String

  init(dto: MessageDTO) {
    id = dto.id
    text = dto.text
    authorId = dto.authorId
    isMe = dto.status == "sent" || dto.authorId == "me"
    createdAt = Date(timeIntervalSince1970: dto.createdAt / 1000.0)
  }
}
