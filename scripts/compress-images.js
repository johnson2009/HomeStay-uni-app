/**
 * 将 static/images 下超过 200KB 的图片压缩到 200KB 以内（微信小程序代码质量要求）
 * 需要先安装: npm install sharp --save-dev
 * 使用: node scripts/compress-images.js
 */
const fs = require('fs')
const path = require('path')

const staticDir = path.join(__dirname, '../src/static/images')
const maxSizeKB = 200
const maxSizeBytes = maxSizeKB * 1024

function getFiles(dir) {
  try {
    return fs.readdirSync(dir).filter(f => /\.(png|jpe?g|webp)$/i.test(f))
  } catch (e) {
    return []
  }
}

async function compressFile(sharp, filePath, outPath, originalSize) {
  const ext = path.extname(filePath).toLowerCase()
  let pipeline = sharp(filePath).resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
  if (ext === '.png') {
    pipeline = pipeline.png({ compressionLevel: 9 })
  } else {
    pipeline = pipeline.jpeg({ quality: 82 })
  }
  const buf = await pipeline.toBuffer()
  if (buf.length < originalSize && buf.length <= maxSizeBytes) {
    fs.writeFileSync(outPath, buf)
    return buf.length
  }
  return null
}

async function run() {
  let sharp
  try {
    sharp = require('sharp')
  } catch (e) {
    console.log('请先安装 sharp: npm install sharp --save-dev')
    process.exit(1)
  }
  const files = getFiles(staticDir)
  for (const file of files) {
    const filePath = path.join(staticDir, file)
    const stat = fs.statSync(filePath)
    if (stat.size <= maxSizeBytes) continue
    console.log(`压缩 ${file} (${(stat.size / 1024).toFixed(1)} KB) -> 目标 <= ${maxSizeKB} KB`)
    try {
      const newSize = await compressFile(sharp, filePath, filePath, stat.size)
      if (newSize) {
        console.log(`  -> ${(newSize / 1024).toFixed(1)} KB`)
      } else {
        console.log('  -> 仍超过 200KB，请用 https://tinypng.com 或 https://squoosh.app 手动压缩')
      }
    } catch (err) {
      console.error(`  失败: ${err.message}`)
    }
  }
}

run()
