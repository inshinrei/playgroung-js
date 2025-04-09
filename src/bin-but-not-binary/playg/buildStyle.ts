type BuildStyleParts = (string | false | undefined)[]

export function buildStyle(...parts: BuildStyleParts) {
  return parts.filter(Boolean).join(';') as React.CSSProperties
}
