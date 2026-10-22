/**
 * Render the Baizhou tray icon from the brand vector source.
 *
 * The tray shows the icon at 16 logical pixels, so Windows picks one of the
 * bundled bitmaps by display scale. Each size is rasterized from the vector
 * source separately instead of downscaling one large bitmap, which keeps edges
 * crisp at every scale. The committed `resources/brands/baizhou/tray.ico` is the
 * output; rerun `pnpm run render:brand-tray-icon` in `apps/desktop` after changing
 * the vector source.
 */

import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { packIco, TRAY_ICON_SIZES, type IcoEntry } from './render-tray-icon.ts'

/** Vector source and committed output of the branded tray icon. */
export const BRAND_TRAY_ICON_PATHS = {
  source: fileURLToPath(new URL('../resources/brands/baizhou/icon-windows.svg', import.meta.url)),
  output: fileURLToPath(new URL('../resources/brands/baizhou/tray.ico', import.meta.url)),
} as const

/**
 * Rasterize the brand vector source at each tray size.
 * @param svg - SVG document declaring a numeric square edge; artwork fills its viewBox without transforms.
 * @param sizes - Bitmap edges to render.
 * @returns PNG entries in the given order.
 */
export async function renderBrandTrayIconEntries(svg: Buffer, sizes: readonly number[] = TRAY_ICON_SIZES): Promise<IcoEntry[]> {
  const source = svg.toString('utf8')
  const edge = Number(/<svg[^>]*\bwidth="(\d+(?:\.\d+)?)"/u.exec(source)?.[1])
  if (!Number.isFinite(edge) || edge <= 0) throw new Error('brand tray icon: SVG requires a numeric square edge')
  // Density maps the declared edge onto one bitmap pixel, so 72 dpi renders the source at 1:1.
  return Promise.all(sizes.map(async size => ({
    size,
    png: await sharp(Buffer.from(source), { density: 72 * size / edge }).resize(size, size).png().toBuffer(),
  })))
}

async function main(): Promise<void> {
  const entries = await renderBrandTrayIconEntries(await readFile(BRAND_TRAY_ICON_PATHS.source))
  await writeFile(BRAND_TRAY_ICON_PATHS.output, packIco(entries))
  console.info(`brand tray icon: wrote ${BRAND_TRAY_ICON_PATHS.output} with ${entries.map(entry => String(entry.size)).join(', ')} px bitmaps`)
}

if (process.argv[1] !== undefined && import.meta.filename === resolve(process.argv[1])) await main()
