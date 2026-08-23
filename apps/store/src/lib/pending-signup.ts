const STORE_NAME_KEY = 'sonari.pendingStoreName'
const FULL_NAME_KEY = 'sonari.pendingFullName'

export type PendingSignup = {
  fullName: string | null
  storeName: string | null
}

export function savePendingSignup(fullName: string, storeName: string): void {
  sessionStorage.setItem(FULL_NAME_KEY, fullName)
  sessionStorage.setItem(STORE_NAME_KEY, storeName)
}

export function readPendingSignup(): PendingSignup {
  return {
    fullName: sessionStorage.getItem(FULL_NAME_KEY),
    storeName: sessionStorage.getItem(STORE_NAME_KEY),
  }
}

export function clearPendingSignup(): void {
  sessionStorage.removeItem(FULL_NAME_KEY)
  sessionStorage.removeItem(STORE_NAME_KEY)
}

export function resolvePendingStoreName(userMetadata: Record<string, unknown> | undefined): string {
  const pending = readPendingSignup()
  const fromMetadata =
    typeof userMetadata?.store_name === 'string' ? userMetadata.store_name.trim() : ''
  return pending.storeName?.trim() || fromMetadata
}

export function resolvePendingFullName(userMetadata: Record<string, unknown> | undefined): string {
  const pending = readPendingSignup()
  const fromMetadata =
    typeof userMetadata?.full_name === 'string' ? userMetadata.full_name.trim() : ''
  return pending.fullName?.trim() || fromMetadata
}
