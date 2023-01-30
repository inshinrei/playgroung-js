interface KeymasterEvent {
  key: string
  method: KeyHandler
  mods: number[]
  scope: string
  shortcut: string
}

interface KeyHandler {
  (event: KeyboardEvent, keyEvent: KeymasterEvent): void
}
