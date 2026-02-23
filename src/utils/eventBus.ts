/** 简单事件总线，用于 request 与 App 解耦（避免主包打入未使用 JS） */
type Handler = () => void
const listeners: Record<string, Handler[]> = {}

export function emit(event: string): void {
  (listeners[event] || []).forEach((fn) => fn())
}

export function on(event: string, handler: Handler): void {
  if (!listeners[event]) listeners[event] = []
  listeners[event].push(handler)
}
