/** Email / SMS / WhatsApp provider abstraction (Phase 1+). */
export interface NotificationProvider {
  send(input: { to: string; template: string; data: Record<string, string> }): Promise<void>
}
