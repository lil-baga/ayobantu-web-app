const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

/**
 * Generate PNG icons from logo design for PWA
 * Requires: npm install canvas
 */

const ICON_DIR = path.join(__dirname, '../public/icons');
const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const MASKABLE_SIZES = [192, 512];

// Brand colors
const COLORS = {
  primary: '#2563eb', // blue-600
  gradient: {
    start: '#2563eb',
    end: '#4f46e5', // indigo-600
  },
  white: '#ffffff',
};

function generateIcon(size, isMaskable = false) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // For maskable, use full gradient background
  if (isMaskable) {
    // Full bleed gradient for maskable
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, COLORS.gradient.start);
    gradient.addColorStop(1, COLORS.gradient.end);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  } else {
    // Regular icon: solid blue gradient square
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, COLORS.gradient.start);
    gradient.addColorStop(1, COLORS.gradient.end);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    
    // Optional: subtle shadow for depth
    ctx.shadowColor = 'rgba(37, 99, 235, 0.2)';
    ctx.shadowBlur = size * 0.02;
  }

  return canvas;
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

async function generateAllIcons() {
  console.log('🎨 Generating PNG icons for PWA...\n');

  // Create directory if not exists
  if (!fs.existsSync(ICON_DIR)) {
    fs.mkdirSync(ICON_DIR, { recursive: true });
  }

  // Generate regular icons
  for (const size of SIZES) {
    const canvas = generateIcon(size, false);
    const filename = `icon-${size}x${size}.png`;
    const filepath = path.join(ICON_DIR, filename);

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filepath, buffer);

    console.log(`✅ Generated: ${filename}`);
  }

  // Generate maskable icons
  for (const size of MASKABLE_SIZES) {
    const canvas = generateIcon(size, true);
    const filename = `icon-maskable-${size}x${size}.png`;
    const filepath = path.join(ICON_DIR, filename);

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filepath, buffer);

    console.log(`✅ Generated: ${filename} (maskable)`);
  }

  // Delete old SVG placeholders
  const svgFiles = fs.readdirSync(ICON_DIR).filter((f) => f.endsWith('.svg'));
  svgFiles.forEach((file) => {
    fs.unlinkSync(path.join(ICON_DIR, file));
    console.log(`🗑️  Deleted SVG placeholder: ${file}`);
  });

  console.log('\n✨ All PNG icons generated successfully!');
  console.log('📁 Location: public/icons/\n');
}

// Run
generateAllIcons().catch((error) => {
  console.error('❌ Error generating icons:', error.message);
  console.log('\n⚠️  Make sure to install canvas package:');
  console.log('   npm install canvas\n');
  process.exit(1);
});
