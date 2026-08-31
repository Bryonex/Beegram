const fs = require('fs');
const Jimp = require('jimp');

async function main() {
  const img = await Jimp.read('public/ghochou.jpeg');
  await img.clone().resize(192, 192).writeAsync('public/pwa-192x192.png');
  await img.clone().resize(512, 512).writeAsync('public/pwa-512x512.png');
  console.log('done');
}
main().catch(console.error);
