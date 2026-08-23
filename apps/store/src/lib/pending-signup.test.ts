import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearPendingSignup,
  readPendingSignup,
  resolvePendingFullName,
  resolvePendingStoreName,
  savePendingSignup,
} from './pending-signup.js'

function mockSessionStorage(): Storage {
  const store = new Map<string, string>()
  return {
    get length() {
      return store.size
    },
    clear() {
      store.clear()
    },
    getItem(key: string) {
      return store.get(key) ?? null
    },
    key(index: number) {
      return [...store.keys()][index] ?? null
    },
    removeItem(key: string) {
      store.delete(key)
    },
    setItem(key: string, value: string) {
      store.set(key, value)
    },
  }
}

describe('pending-signup', () => {
  beforeEach(() => {
    vi.stubGlobal('sessionStorage', mockSessionStorage())
    clearPendingSignup()
  })

  it('persists and resolves signup fields for finish setup', () => {
    savePendingSignup('Pashva Soni', 'Mangaldeep')

    expect(readPendingSignup()).toEqual({
      fullName: 'Pashva Soni',
      storeName: 'Mangaldeep',
    })
    expect(resolvePendingStoreName({ full_name: 'Other' })).toBe('Mangaldeep')
    expect(resolvePendingFullName({ full_name: 'Other' })).toBe('Pashva Soni')

    clearPendingSignup()
    expect(readPendingSignup()).toEqual({ fullName: null, storeName: null })
    expect(resolvePendingStoreName({ store_name: 'From metadata' })).toBe('From metadata')
  })
})
