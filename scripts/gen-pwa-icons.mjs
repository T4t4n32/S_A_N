import sharp from 'sharp';
import { mkdirSync } from 'fs';

const SRC = 'resources/icon.png'; // 1024x1024 RGBA, full-bleed logo mark

async function main() {
  mkdirSync('public/icons', { recursive: true });

  // Plain "any" icons — full bleed, safe for favicon/apple-touch/browser UI.
  await sharp(SRC).resize(192, 192).png().toFile('public/icons/pwa-192.png');
  await sharp(SRC).resize(512, 512).png().toFile('public/icons/pwa-512.png');
  await sharp(SRC).resize(180, 180).png().toFile('public/icons/apple-touch-icon.png');

  // Maskable icon: OS crops to a circle/rounded-square, so the artwork must
  // sit inside the ~80% "safe zone" with padding in the brand background
  // color, or Android/iOS will clip the logo.
  const bg = { r: 10, g: 10, b: 15, alpha: 1 }; // matches body background #0a0a0f
  const canvasSize = 512;
  const logoSize = Math.round(canvasSize * 0.7);
  const logo = await sharp(SRC).resize(logoSize, logoSize).png().toBuffer();
  await sharp({
    create: { width: canvasSize, height: canvasSize, channels: 4, background: bg }
  })
    .composite([{ input: logo, gravity: 'center' }])
    .png()
    .toFile('public/icons/maskable-512.png');

  console.log('PWA icons generated in public/icons/');
}

main().catch(err => { console.error(err); process.exit(1); });
