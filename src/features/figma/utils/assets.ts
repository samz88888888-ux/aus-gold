export const APP_VERSION = __APP_VERSION__

export function assetUrl(path: string): string {
  const separator = path.includes('?') ? '&' : '?'
  return `${path}${separator}v=${encodeURIComponent(APP_VERSION)}`
}
