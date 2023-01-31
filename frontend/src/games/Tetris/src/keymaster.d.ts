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

interface FilterEvent {
  target?: { tagName?: string }
  srcElement?: { tagName?: string }
}

interface Keymaster {
  (key: string, callback: KeyHandler): void
  (key: string, scope: string, callback: KeyHandler): void

  shift: boolean
  alt: boolean
  option: boolean
  ctrl: boolean
  control: boolean
  command: boolean
}
