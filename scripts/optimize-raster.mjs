import { promises as fs } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const assetDir = path.resolve('public/figma')
const rasterExtensions = new Set(['.png', '.jpg', '.jpeg'])

const resizeRules = [
  { match: /^hero-card-main$/i, width: 1200 },
  { match: /^home-hero-bg$/i, width: 1080 },
  { match: /^home-hero-main$/i, width: 720 },
  { match: /^subscription-overlay$/i, width: 900 },
  { match: /^subscription-bg$/i, width: 480 },
  { match: /^subscription-icon-/i, width: 256 },
  { match: /^advantage-title$/i, width: 1200 },
  { match: /^advantage-/i, width: 900 },
  { match: /^brand-logo$/i, width: 256 },
  { match: /^partner-/i, width: 360 },
  { match: /^lang-/i, width: 96 },
  { match: /^contact-/i, width: 320 },
  { match: /^model-coin-2$/i, width: 1200 },
  { match: /^status-bar$/i, width: 640 },
]

function getTargetWidth(baseName, metadata) {
  const matchedRule = resizeRules.find((rule) => rule.match.test(baseName))
  if (!matchedRule) {
    return metadata.width ?? null
  }

  if (!metadata.width) {
    return matchedRule.width
  }

  return Math.min(metadata.width, matchedRule.width)
}

async function optimizeFile(fileName) {
  const inputPath = path.join(assetDir, fileName)
  const ext = path.extname(fileName).toLowerCase()
  if (!rasterExtensions.has(ext)) {
    return null
  }

  const baseName = path.basename(fileName, ext)
  const outputName = `${baseName}.webp`
  const outputPath = path.join(assetDir, outputName)

  const inputBuffer = await fs.readFile(inputPath)
  const image = sharp(inputBuffer, { animated: false })
  const metadata = await image.metadata()
  const targetWidth = getTargetWidth(baseName, metadata)

  let pipeline = sharp(inputBuffer, { animated: false }).rotate()
  if (targetWidth && metadata.width && metadata.width > targetWidth) {
    pipeline = pipeline.resize({
      width: targetWidth,
      fit: 'inside',
      withoutEnlargement: true,
    })
  }

  await pipeline
    .webp({
      quality: 82,
      effort: 6,
      alphaQuality: 85,
    })
    .toFile(outputPath)

  const beforeSize = inputBuffer.byteLength
  const afterSize = (await fs.stat(outputPath)).size
  await fs.unlink(inputPath)

  return {
    fileName,
    outputName,
    beforeSize,
    afterSize,
    width: metadata.width ?? 0,
    height: metadata.height ?? 0,
    targetWidth,
  }
}

async function main() {
  const fileNames = await fs.readdir(assetDir)
  const results = []

  for (const fileName of fileNames) {
    const result = await optimizeFile(fileName)
    if (result) {
      results.push(result)
    }
  }

  results.sort((a, b) => b.beforeSize - a.beforeSize)

  for (const result of results) {
    const savedKb = (result.beforeSize - result.afterSize) / 1024
    const beforeKb = result.beforeSize / 1024
    const afterKb = result.afterSize / 1024
    console.log(
      `${result.fileName} -> ${result.outputName} | ${beforeKb.toFixed(1)} KB -> ${afterKb.toFixed(1)} KB | saved ${savedKb.toFixed(1)} KB`,
    )
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
