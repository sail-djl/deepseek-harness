/** Product identity fields injected into the application package.json by packaging. */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/** Identity fields the packaging pipeline may add to the application package.json. */
export interface DesktopAppManifest {
  /** Display product name for a branded build; undefined in official builds. */
  readonly productName: string | undefined
  /** Windows application user model id paired with the installer app id; undefined when not injected. */
  readonly dshDesktopAppId: string | undefined
}

/**
 * Read injected identity fields from the application package.json.
 * @param appPath - resolved Electron application path holding package.json.
 * @returns parsed identity fields; both undefined when the manifest file is absent
 * (fixture application paths in mocked-Electron tests) and for official builds that inject nothing.
 */
export function readDesktopAppManifest(appPath: string): DesktopAppManifest {
  let raw: string
  try {
    raw = readFileSync(join(appPath, 'package.json'), 'utf8')
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return { productName: undefined, dshDesktopAppId: undefined }
    throw error
  }
  const parsed: unknown = JSON.parse(raw)
  if (typeof parsed !== 'object' || parsed === null) throw new Error('desktop manifest: package.json must be an object')
  const manifest = parsed as { readonly productName?: unknown; readonly dshDesktopAppId?: unknown }
  return {
    productName: typeof manifest.productName === 'string' ? manifest.productName : undefined,
    dshDesktopAppId: typeof manifest.dshDesktopAppId === 'string' ? manifest.dshDesktopAppId : undefined,
  }
}
