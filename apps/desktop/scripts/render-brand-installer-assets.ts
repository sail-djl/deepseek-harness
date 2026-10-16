/**
 * Render the branded NSIS banner and uninstaller sidebar from the brand vector source.
 *
 * Every image rasterizes from one SVG description, so the whale artwork, wordmark,
 * and background stay aligned across scales. The committed
 * `resources/brands/work/installer-assets/*.png` are the outputs; rerun
 * `pnpm run render:brand-installer-assets` in `apps/desktop` after changing the brand copy.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

/** Brand vector source and the committed installer images it produces. */
export const BRAND_INSTALLER_PATHS = {
  source: fileURLToPath(new URL('../resources/brands/work/icon-windows.svg', import.meta.url)),
  directory: fileURLToPath(new URL('../resources/brands/work/installer-assets', import.meta.url)),
} as const

/** Brand accent (mint green) the vector source must declare; recolors replace it per presentation. */
const BRAND_ACCENT = '#2DBE8B'
/** Product name drawn in the banner wordmark. */
const BRAND_WORDMARK = 'Baizhou DSH Work'
const LIGHT_BACKGROUND = '#FFFFFF'
const LIGHT_FOREGROUND = '#1E293B'
const DARK_BACKGROUND = '#151517'
const DARK_FOREGROUND = '#FFFFFF'
const SIDEBAR_BACKGROUND = '#F5F6F8'

/**
 * Extract the drawable artwork from the brand vector source.
 * @param svg - complete SVG document of the brand vector source.
 * @returns every element inside the root `<svg>` element, recolored per call site.
 */
export function brandArtwork(svg: string): string {
  if (!svg.includes(`fill="${BRAND_ACCENT}"`) || /<style\b/iu.test(svg)) {
    throw new Error(`brand installer assets: source must use the fixed brand color ${BRAND_ACCENT} without style blocks`)
  }
  const body = /<svg[^>]*>([\s\S]*)<\/svg>/u.exec(svg)?.[1]
  if (body === undefined) throw new Error('brand installer assets: SVG requires a root svg element')
  return body
}

/**
 * Describe one installer banner.
 * @param body - brand artwork from {@link brandArtwork}.
 * @param scale - pixel multiplier; 1 matches the 600x196 bitmap, 2 the 1200x392 one.
 * @param dark - dark presentation recolors the artwork white on a near-black ground.
 * @returns the SVG document rasterized into one banner.
 */
export function brandBannerSvg(body: string, scale: number, dark: boolean): string {
  const width = 600 * scale
  const height = 196 * scale
  const foreground = dark ? DARK_FOREGROUND : LIGHT_FOREGROUND
  const artwork = body.replaceAll(BRAND_ACCENT, dark ? DARK_FOREGROUND : BRAND_ACCENT)
  const whaleEdge = 130 * scale
  const whaleX = (width - whaleEdge) / 2
  const whaleY = 8 * scale
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${String(width)}" height="${String(height)}">
<rect width="${String(width)}" height="${String(height)}" fill="${dark ? DARK_BACKGROUND : LIGHT_BACKGROUND}"/>
<g transform="translate(${String(whaleX)} ${String(whaleY)}) scale(${String(whaleEdge / 50)})">${artwork}</g>
<text x="${String(width / 2)}" y="${String(176 * scale)}" text-anchor="middle" font-family="Segoe UI" font-size="${String(32 * scale)}" font-weight="600" fill="${foreground}">${BRAND_WORDMARK}</text>
</svg>`
}

/**
 * Describe the uninstaller sidebar: a white brand card on the installer's light gray ground.
 * @param body - brand artwork from {@link brandArtwork}.
 * @returns the SVG document rasterized into one 164x314 sidebar.
 */
export function brandSidebarSvg(body: string): string {
  const card = { x: 25, y: 72, width: 114, height: 186, radius: 12 }
  const whaleEdge = 88
  const whaleX = card.x + (card.width - whaleEdge) / 2
  const whaleY = card.y + (card.height - whaleEdge) / 2
  return `<svg xmlns="http://www.w3.org/2000/svg" width="164" height="314">
<defs><filter id="shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#0F1115" flood-opacity="0.10"/></filter></defs>
<rect width="164" height="314" fill="${SIDEBAR_BACKGROUND}"/>
<rect x="${String(card.x)}" y="${String(card.y)}" width="${String(card.width)}" height="${String(card.height)}" rx="${String(card.radius)}" fill="#FFFFFF" filter="url(#shadow)"/>
<g transform="translate(${String(whaleX)} ${String(whaleY)}) scale(${String(whaleEdge / 50)})">${body}</g>
</svg>`
}

async function main(): Promise<void> {
  const body = brandArtwork((await readFile(BRAND_INSTALLER_PATHS.source)).toString('utf8'))
  const images = [
    ['brand.png', brandBannerSvg(body, 1, false)],
    ['brand-2x.png', brandBannerSvg(body, 2, false)],
    ['brand-dark.png', brandBannerSvg(body, 1, true)],
    ['brand-dark-2x.png', brandBannerSvg(body, 2, true)],
    ['uninstaller-sidebar.png', brandSidebarSvg(body)],
  ] as const
  await mkdir(BRAND_INSTALLER_PATHS.directory, { recursive: true })
  for (const [name, svg] of images) {
    await writeFile(join(BRAND_INSTALLER_PATHS.directory, name), await sharp(Buffer.from(svg)).png().toBuffer())
  }
  console.info(`brand installer assets: wrote ${images.length} images to ${BRAND_INSTALLER_PATHS.directory}`)
}

if (process.argv[1] !== undefined && import.meta.filename === resolve(process.argv[1])) await main()
