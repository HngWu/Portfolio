import fs from "fs"
import path from "path"
import sharp from "sharp"

const SOURCE_PATH = "C:/Users/pc/.gemini/antigravity-cli/brain/ed92ded3-fc1f-4c5a-9b1b-f43868ce6634/.user_uploaded/uploaded_media_1794672950328.jpg"
const OUTPUT_DIR = path.resolve(process.cwd(), "public/images/deity")

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  if (!fs.existsSync(SOURCE_PATH)) {
    console.error(`Source image not found at: ${SOURCE_PATH}`)
    process.exit(1)
  }

  console.log(`Loading source image: ${SOURCE_PATH}`)
  const image = sharp(SOURCE_PATH)
  const metadata = await image.metadata()
  const { width, height } = metadata
  console.log(`Source dimensions: ${width}x${height}`)

  // 1. Output high-efficiency source.webp master
  const sourceWebpPath = path.join(OUTPUT_DIR, "source.webp")
  await image.clone().webp({ quality: 92, effort: 4 }).toFile(sourceWebpPath)
  console.log(`Saved master: ${sourceWebpPath}`)

  // 2. Generate layer-emission-mask.webp
  // Extract pixels with high luminance or strong electric blue/purple saturation
  const { data, info } = await image
    .clone()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const pixelCount = info.width * info.height
  const channels = info.channels // 3 (RGB)
  const emissionBuffer = Buffer.alloc(pixelCount * 4) // RGBA

  for (let i = 0; i < pixelCount; i++) {
    const r = data[i * channels]
    const g = data[i * channels + 1]
    const b = data[i * channels + 2]

    // Luminance calculation
    const lum = 0.299 * r + 0.587 * g + 0.114 * b
    
    // Check if pixel belongs to glowing energy structures:
    // - Cyan electric lightning / reactor core (high G and B, high lum)
    // - Purple visor eyes / blade aura (high R and B, moderate to high lum)
    // - High intensity highlights (lum > 210)
    const isCyanGlow = b > 160 && g > 130 && (b + g) > (r * 1.6)
    const isPurpleGlow = r > 130 && b > 160 && (r + b) > (g * 1.8)
    const isBrightCore = lum > 195
    const isLightningVein = (b > 180 || (b > 140 && g > 120)) && lum > 140

    if (isBrightCore || isCyanGlow || isPurpleGlow || isLightningVein) {
      // Scale alpha by intensity
      const intensityFactor = Math.min(1.0, (lum / 255) * 1.2)
      emissionBuffer[i * 4] = Math.min(255, Math.floor(r * 1.3))
      emissionBuffer[i * 4 + 1] = Math.min(255, Math.floor(g * 1.3))
      emissionBuffer[i * 4 + 2] = Math.min(255, Math.floor(b * 1.4))
      emissionBuffer[i * 4 + 3] = Math.floor(255 * intensityFactor)
    } else {
      // Non-emissive regions are completely transparent
      emissionBuffer[i * 4] = 0
      emissionBuffer[i * 4 + 1] = 0
      emissionBuffer[i * 4 + 2] = 0
      emissionBuffer[i * 4 + 3] = 0
    }
  }

  const emissionMaskPath = path.join(OUTPUT_DIR, "layer-emission-mask.webp")
  await sharp(emissionBuffer, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .webp({ quality: 90 })
    .toFile(emissionMaskPath)
  console.log(`Saved emission mask: ${emissionMaskPath}`)

  // 3. Generate Layer 2: Astrolabe Halo Rings (isolated around top center crown)
  // Region: y from 0 to 300, x from 120 to 650
  const haloBuffer = Buffer.alloc(pixelCount * 4)
  const haloCenterX = width / 2
  const haloCenterY = height * 0.13
  const haloRadius = width * 0.38

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x
      const r = data[idx * channels]
      const g = data[idx * channels + 1]
      const b = data[idx * channels + 2]
      
      const dx = x - haloCenterX
      const dy = (y - haloCenterY) * 1.3
      const dist = Math.sqrt(dx * dx + dy * dy)

      // Halo ring spatial bounds & threshold
      if (dist < haloRadius && y < height * 0.32) {
        // Exclude central head armor below y = 140
        const isHeadCenter = Math.abs(x - haloCenterX) < 70 && y > 130
        if (!isHeadCenter) {
          const lum = 0.299 * r + 0.587 * g + 0.114 * b
          // Keep the luminous ring pixels and fade edges
          const edgeAlpha = Math.max(0, 1 - Math.pow(dist / haloRadius, 3))
          const alpha = lum > 60 ? Math.floor(Math.min(255, lum * 1.4) * edgeAlpha) : 0
          haloBuffer[idx * 4] = r
          haloBuffer[idx * 4 + 1] = g
          haloBuffer[idx * 4 + 2] = b
          haloBuffer[idx * 4 + 3] = alpha
          continue
        }
      }
      haloBuffer[idx * 4] = 0
      haloBuffer[idx * 4 + 1] = 0
      haloBuffer[idx * 4 + 2] = 0
      haloBuffer[idx * 4 + 3] = 0
    }
  }

  const haloPath = path.join(OUTPUT_DIR, "layer-halo-rings.webp")
  await sharp(haloBuffer, {
    raw: { width, height, channels: 4 },
  })
    .webp({ quality: 90 })
    .toFile(haloPath)
  console.log(`Saved halo layer: ${haloPath}`)

  // 4. Generate Layer 4: Foreground Sword & Asteroids
  // Focus on the bottom half diagonal sword and asteroid rocks
  const fgBuffer = Buffer.alloc(pixelCount * 4)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x
      const r = data[idx * channels]
      const g = data[idx * channels + 1]
      const b = data[idx * channels + 2]

      // Foreground sword is predominantly on the lower center-left quadrant
      // Bottom asteroids are at corners (y > 650)
      const isSwordRegion = y > height * 0.45 && x < width * 0.85
      const isAsteroidCorner = y > height * 0.65 && (x < width * 0.35 || x > width * 0.75)

      if (isSwordRegion || isAsteroidCorner) {
        const lum = 0.299 * r + 0.587 * g + 0.114 * b
        // Height weighting creates smooth Z-layering separation
        const progress = Math.min(1.0, Math.max(0, (y - height * 0.45) / (height * 0.55)))
        const alpha = Math.floor(255 * progress)
        fgBuffer[idx * 4] = r
        fgBuffer[idx * 4 + 1] = g
        fgBuffer[idx * 4 + 2] = b
        fgBuffer[idx * 4 + 3] = alpha
      } else {
        fgBuffer[idx * 4] = 0
        fgBuffer[idx * 4 + 1] = 0
        fgBuffer[idx * 4 + 2] = 0
        fgBuffer[idx * 4 + 3] = 0
      }
    }
  }

  const fgPath = path.join(OUTPUT_DIR, "layer-fg-sword-asteroids.webp")
  await sharp(fgBuffer, {
    raw: { width, height, channels: 4 },
  })
    .webp({ quality: 90 })
    .toFile(fgPath)
  console.log(`Saved foreground layer: ${fgPath}`)

  // 5. Generate Layer 1: Deep Space Background
  // Softened/deepened base layer
  const bgPath = path.join(OUTPUT_DIR, "layer-bg-space.webp")
  await image
    .clone()
    .modulate({ brightness: 0.85, saturation: 1.15 })
    .blur(1.2)
    .webp({ quality: 85 })
    .toFile(bgPath)
  console.log(`Saved background layer: ${bgPath}`)

  // 6. Generate Layer 3: Main Deity Body
  // Full crisp midground plate
  const bodyPath = path.join(OUTPUT_DIR, "layer-deity-body.webp")
  await image
    .clone()
    .webp({ quality: 90 })
    .toFile(bodyPath)
  console.log(`Saved deity body layer: ${bodyPath}`)

  console.log("All deity assets processed successfully!")
}

main().catch((err) => {
  console.error("Error processing deity assets:", err)
  process.exit(1)
})
