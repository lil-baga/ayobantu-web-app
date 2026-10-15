#!/usr/bin/env node

/**
 * PWA Icon Generator
 * 
 * Generates placeholder PWA icons from base logo design.
 * For production: use real design tools (Figma, Photoshop) or online generators like:
 * - https://realfavicongenerator.net/
 * - https://www.pwabuilder.com/imageGenerator
 * 
 * This script creates simple canvas-based placeholders for development.
 */

const fs = require('fs');
const path = require('path');

const ICON_DIR = path.join(__dirname, '../public/icons');
const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

// Create icons directory if not exists
if (!fs.existsSync(ICON_DIR)) {
  fs.mkdirSync(ICON_DIR, { recursive: true });
}

console.log('📱 PWA Icon Placeholder Generator');
console.log('==================================\n');
console.log('⚠️  PLACEHOLDER MODE: Creating simple SVG-based icons for development.');
console.log('📸 For production, generate proper PNG icons using:');
console.log('   - https://realfavicongenerator.net/');
console.log('   - https://www.pwabuilder.com/imageGenerator\n');

// Generate SVG template for each size
SIZES.forEach((size) => {
  const svgContent = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="#2563eb" rx="${size * 0.18}"/>
  
  <!-- Letter A -->
  <text 
    x="50%" 
    y="50%" 
    font-family="system-ui, -apple-system, sans-serif" 
    font-size="${size * 0.6}" 
    font-weight="900" 
    fill="white" 
    text-anchor="middle" 
    dominant-baseline="central"
  >A</text>
</svg>`;

  const filename = `icon-${size}x${size}.png`;
  const svgPath = path.join(ICON_DIR, `icon-${size}x${size}.svg`);
  
  fs.writeFileSync(svgPath, svgContent);
  console.log(`✅ Generated: ${filename} (as SVG placeholder)`);
});

// Generate maskable variants (with safe zone padding)
[192, 512].forEach((size) => {
  const padding = size * 0.1; // 10% safe zone
  const innerSize = size - (padding * 2);
  const svgContent = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Full bleed background -->
  <rect width="${size}" height="${size}" fill="#2563eb"/>
  
  <!-- Safe zone content -->
  <g transform="translate(${padding}, ${padding})">
    <rect width="${innerSize}" height="${innerSize}" fill="#1d4ed8" rx="${innerSize * 0.18}"/>
    <text 
      x="50%" 
      y="50%" 
      font-family="system-ui, -apple-system, sans-serif" 
      font-size="${innerSize * 0.6}" 
      font-weight="900" 
      fill="white" 
      text-anchor="middle" 
      dominant-baseline="central"
    >${innerSize}</text>
  </g>
</svg>`;

  const svgPath = path.join(ICON_DIR, `icon-maskable-${size}x${size}.svg`);
  fs.writeFileSync(svgPath, svgContent);
  console.log(`✅ Generated: icon-maskable-${size}x${size}.png (as SVG placeholder)`);
});

console.log('\n✨ Icon placeholders created successfully!');
console.log('📁 Location: public/icons/\n');
console.log('🔄 Next steps:');
console.log('   1. For production, replace SVG files with proper PNG icons');
console.log('   2. Use realfavicongenerator.net with your actual logo');
console.log('   3. Ensure maskable icons have proper safe zone (10% padding)\n');
