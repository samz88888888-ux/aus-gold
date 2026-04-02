const requiredEnvKeys = [
  'VITE_APP_TITLE',
  'VITE_API_BASE_URL',
  'VITE_ASSET_BASE_URL',
  'VITE_API_GATEWAY_PATH',
  'VITE_API_USE_GATEWAY',
] as const

requiredEnvKeys.forEach((key) => {
  if (!import.meta.env[key]) {
    throw new Error(`Missing required env variable: ${key}`)
  }
})

export const appEnv = {
  mode: import.meta.env.MODE,
  appTitle: import.meta.env.VITE_APP_TITLE,
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  assetBaseUrl: import.meta.env.VITE_ASSET_BASE_URL,
  apiGatewayPath: import.meta.env.VITE_API_GATEWAY_PATH,
  apiUseGateway: import.meta.env.VITE_API_USE_GATEWAY === 'true',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const
