import ExpoModulesCore

public final class ExpoChatViewModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoChatView")

    View(ExpoChatView.self) {
      Events("onNearTop", "onVisibleIdsChange", "onPressMessage")

      Prop("messages") { (view: ExpoChatView, messages: [MessageDTO]?) in
        view.update(messages: messages ?? [])
      }

      Prop("contentBottomInset") { (view: ExpoChatView, inset: Double?) in
        view.update(contentBottomInset: inset ?? 0)
      }

      AsyncFunction("scrollToEnd") { (view: ExpoChatView, animated: Bool?) in
        try await MainActor.run {
          view.scrollToEnd(animated: animated ?? true)
        }
      }
    }
  }
}
