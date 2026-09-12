const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ICONS_DIR = path.join(__dirname, '../public/icons');

if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

// 1. Standard SVG Icon (Full bleed with Apple iOS Squircle aesthetic)
function getSvgIcon({ maskable = false, size = 512 } = {}) {
  // If maskable, scale the central graphic down to ~64% to fit within the 80% safe zone
  const contentScale = maskable ? 0.68 : 0.88;
  const translate = (512 * (1 - contentScale)) / 2;

  return `<svg width="${size}" height="${size}" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Gradients -->
    <linearGradient id="bgGrad" x1="256" y1="0" x2="256" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0F172A"/>
      <stop offset="45%" stop-color="#0B1120"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>

    <!-- Radial Cyan Electric Glow -->
    <radialGradient id="centerGlow" cx="256" cy="230" r="220" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#00D2FF" stop-opacity="0.32"/>
      <stop offset="50%" stop-color="#0066FF" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#020617" stop-opacity="0"/>
    </radialGradient>

    <!-- Aqua Core Gradient -->
    <linearGradient id="aquaCore" x1="120" y1="120" x2="390" y2="390" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#38BDF8"/>
      <stop offset="50%" stop-color="#0284C7"/>
      <stop offset="100%" stop-color="#0369A1"/>
    </linearGradient>

    <!-- Glass Refraction Sheen -->
    <linearGradient id="sheenGrad" x1="120" y1="100" x2="390" y2="280" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.6"/>
      <stop offset="40%" stop-color="#FFFFFF" stop-opacity="0.1"/>
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
    </linearGradient>

    <!-- Lightning / Stream Gradient -->
    <linearGradient id="streamGrad" x1="180" y1="180" x2="340" y2="340" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#F0F9FF"/>
      <stop offset="50%" stop-color="#38BDF8"/>
      <stop offset="100%" stop-color="#0284C7"/>
    </linearGradient>

    <!-- Drop Shadow Filter -->
    <filter id="coreGlow" x="0" y="0" width="512" height="512" filterUnits="userSpaceOnUse">
      <feGaussianBlur stdDeviation="16" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Solid Background Plate -->
  <rect width="512" height="512" fill="url(#bgGrad)"/>
  <rect width="512" height="512" fill="url(#centerGlow)"/>

  <!-- Background Decorative Concentric Orbit Rings -->
  <circle cx="256" cy="256" r="190" stroke="#38BDF8" stroke-opacity="0.08" stroke-width="1.5" stroke-dasharray="8 8"/>
  <circle cx="256" cy="256" r="140" stroke="#0284C7" stroke-opacity="0.12" stroke-width="1.5"/>

  <!-- Scaled Core Container -->
  <g transform="translate(${translate}, ${translate}) scale(${contentScale})">
    <!-- Outer Glass Pod Squircle -->
    <rect x="80" y="80" width="352" height="352" rx="96" fill="#0F172A" fill-opacity="0.6" stroke="rgba(255, 255, 255, 0.15)" stroke-width="2"/>
    <rect x="82" y="82" width="348" height="170" rx="94" fill="url(#sheenGrad)" />

    <!-- Ambient Shadow for Cloud/Server Icon -->
    <ellipse cx="256" cy="350" rx="100" ry="16" fill="#020617" fill-opacity="0.7" />

    <!-- Aqua Cloud & Server Node Emblem -->
    <g filter="url(#coreGlow)">
      <!-- Cloud Backplate -->
      <path d="M190 320 C160 320 135 295 135 265 C135 238 154 216 180 211 C188 172 222 142 264 142 C302 142 334 167 344 202 C368 205 387 226 387 252 C387 280 364 302 336 302 L190 302" 
            fill="url(#aquaCore)" 
            opacity="0.25"/>

      <!-- Liquid Neon Server Cloud Shape -->
      <path d="M196 308 C170 308 148 286 148 260 C148 236 165 217 188 212 C196 178 226 152 262 152 C296 152 324 174 333 205 C354 207 370 225 370 248 C370 272 350 292 326 292 L196 292" 
            fill="none" 
            stroke="url(#aquaCore)" 
            stroke-width="16" 
            stroke-linecap="round" 
            stroke-linejoin="round"/>

      <!-- Central Lightning / Fast Pulse Stream Bolt -->
      <path d="M266 186 L224 254 H260 L242 316 L294 242 H256 L266 186 Z" 
            fill="url(#streamGrad)" 
            stroke="#FFFFFF" 
            stroke-width="3" 
            stroke-linejoin="round"/>
      
      <!-- Node Connection Dots -->
      <circle cx="160" cy="260" r="5" fill="#38BDF8" />
      <circle cx="262" cy="152" r="5" fill="#38BDF8" />
      <circle cx="358" cy="248" r="5" fill="#38BDF8" />
    </g>
  </g>

  <!-- Edge Vignette & Specular Highlight -->
  <rect x="0" y="0" width="512" height="512" stroke="rgba(255, 255, 255, 0.08)" stroke-width="2" fill="none"/>
</svg>`;
}

async function generateIcons() {
  console.log('Generating high-resolution PWA icons with sharp...');

  const standardSvg = Buffer.from(getSvgIcon({ maskable: false }));
  const maskableSvg = Buffer.from(getSvgIcon({ maskable: true }));

  // 1. Standard Icons
  await sharp(standardSvg).resize(192, 192).png().toFile(path.join(ICONS_DIR, 'icon-192x192.png'));
  console.log('✔ Generated icon-192x192.png');

  await sharp(standardSvg).resize(512, 512).png().toFile(path.join(ICONS_DIR, 'icon-512x512.png'));
  console.log('✔ Generated icon-512x512.png');

  // 2. Maskable Icons (Android Adaptive Icons)
  await sharp(maskableSvg).resize(192, 192).png().toFile(path.join(ICONS_DIR, 'icon-maskable-192x192.png'));
  console.log('✔ Generated icon-maskable-192x192.png');

  await sharp(maskableSvg).resize(512, 512).png().toFile(path.join(ICONS_DIR, 'icon-maskable-512x512.png'));
  console.log('✔ Generated icon-maskable-512x512.png');

  // 3. Apple Touch Icon (180x180, iOS Safari Add to Home Screen)
  await sharp(standardSvg).resize(180, 180).png().toFile(path.join(ICONS_DIR, 'apple-touch-icon.png'));
  console.log('✔ Generated apple-touch-icon.png');

  // Also write to public root for default crawlers / browsers
  await sharp(standardSvg).resize(180, 180).png().toFile(path.join(__dirname, '../public/apple-touch-icon.png'));
  await sharp(standardSvg).resize(32, 32).png().toFile(path.join(__dirname, '../public/favicon-32x32.png'));
  await sharp(standardSvg).resize(16, 16).png().toFile(path.join(__dirname, '../public/favicon-16x16.png'));
  
  // Also save SVG icon
  fs.writeFileSync(path.join(ICONS_DIR, 'icon.svg'), getSvgIcon({ maskable: false }));
  fs.writeFileSync(path.join(__dirname, '../public/favicon.svg'), getSvgIcon({ maskable: false }));
  console.log('✔ Generated SVG and Favicons');

  console.log('All PWA icons generated successfully!');
}

generateIcons().catch(err => {
  console.error('Failed to generate PWA icons:', err);
  process.exit(1);
});
