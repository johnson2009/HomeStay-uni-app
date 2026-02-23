/**
 * 构建微信小程序后，删除 static/images 下超过 200KB 的图片，使主包满足「图片不超过200K」且减小主包体积。
 * 这些图片已改为从网络加载（getImageUrl），无需打入包内。
 * 使用：在 build:mp-weixin 之后自动执行，或手动 node scripts/strip-mp-weixin-images.js
 */
const fs = require('fs')
const path = require('path')

const dir = path.join(__dirname, '../dist/build/mp-weixin/static/images')
const maxBytes = 200 * 1024

if (!fs.existsSync(dir)) {
  console.log('skip: dist/build/mp-weixin/static/images 不存在')
  process.exit(0)
}

let removed = 0
for (const name of fs.readdirSync(dir)) {
  const filePath = path.join(dir, name)
  const stat = fs.statSync(filePath)
  if (!stat.isFile()) continue
  if (stat.size > maxBytes) {
    fs.unlinkSync(filePath)
    console.log(`移除大图(>200KB): ${name} (${(stat.size / 1024).toFixed(1)} KB)`)
    removed++
  }
}
if (removed > 0) {
  console.log(`共移除 ${removed} 个文件，主包图片已改为网络加载`)
}
