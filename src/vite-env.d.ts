/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_ASSET_BASE_URL: string
  readonly VITE_API_GATEWAY_PATH: string
  readonly VITE_API_USE_GATEWAY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
