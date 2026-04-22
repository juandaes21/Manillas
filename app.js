const imageInput = document.getElementById('imageInput');
const beadWidthInput = document.getElementById('beadWidth');
const beadSizeInput = document.getElementById('beadSize');
const paletteSizeInput = document.getElementById('paletteSize');
const generateBtn = document.getElementById('generateBtn');
const sourceCanvas = document.getElementById('sourceCanvas');
const beadCanvas = document.getElementById('beadCanvas');
const legend = document.getElementById('legend');

const sourceCtx = sourceCanvas.getContext('2d');
const beadCtx = beadCanvas.getContext('2d');

let loadedImage = null;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function rgbToHex(r, g, b) {
  const toHex = (n) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function quantizeColor(r, g, b, levels) {
  const step = 255 / (levels - 1);
  const q = (v) => Math.round(v / step) * step;
  return [q(r), q(g), q(b)].map((v) => clamp(Math.round(v), 0, 255));
}

function drawCircle(ctx, x, y, radius, fillStyle) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = fillStyle;
  ctx.fill();

  // brillo suave para dar efecto de bolita
  ctx.beginPath();
  ctx.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.35, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fill();
}

function renderLegend(usageMap) {
  legend.innerHTML = '';

  const entries = Array.from(usageMap.entries()).sort((a, b) => b[1] - a[1]);
  entries.forEach(([hex, count], index) => {
    const item = document.createElement('div');
    item.className = 'legend-item';

    const swatch = document.createElement('span');
    swatch.className = 'swatch';
    swatch.style.backgroundColor = hex;

    const text = document.createElement('span');
    text.textContent = `#${index + 1} ${hex.toUpperCase()} · ${count} bolitas`;

    item.append(swatch, text);
    legend.appendChild(item);
  });
}

function generatePattern() {
  if (!loadedImage) {
    alert('Primero sube una imagen.');
    return;
  }

  const beadWidth = clamp(parseInt(beadWidthInput.value, 10) || 60, 4, 300);
  const beadSize = clamp(parseInt(beadSizeInput.value, 10) || 12, 4, 40);
  const paletteSize = clamp(parseInt(paletteSizeInput.value, 10) || 24, 2, 64);

  const aspectRatio = loadedImage.height / loadedImage.width;
  const beadHeight = Math.max(1, Math.round(beadWidth * aspectRatio));

  sourceCanvas.width = loadedImage.width;
  sourceCanvas.height = loadedImage.height;
  sourceCtx.clearRect(0, 0, sourceCanvas.width, sourceCanvas.height);
  sourceCtx.drawImage(loadedImage, 0, 0);

  const downsampleCanvas = document.createElement('canvas');
  downsampleCanvas.width = beadWidth;
  downsampleCanvas.height = beadHeight;
  const downsampleCtx = downsampleCanvas.getContext('2d');
  downsampleCtx.drawImage(loadedImage, 0, 0, beadWidth, beadHeight);

  const imgData = downsampleCtx.getImageData(0, 0, beadWidth, beadHeight);
  const { data } = imgData;

  beadCanvas.width = beadWidth * beadSize;
  beadCanvas.height = beadHeight * beadSize;
  beadCtx.clearRect(0, 0, beadCanvas.width, beadCanvas.height);

  const quantLevels = clamp(Math.round(Math.cbrt(paletteSize) + 1), 2, 8);
  const usageMap = new Map();

  for (let y = 0; y < beadHeight; y += 1) {
    for (let x = 0; x < beadWidth; x += 1) {
      const idx = (y * beadWidth + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const [qr, qg, qb] = quantizeColor(r, g, b, quantLevels);
      const hex = rgbToHex(qr, qg, qb);
      usageMap.set(hex, (usageMap.get(hex) || 0) + 1);

      const centerX = x * beadSize + beadSize / 2;
      const centerY = y * beadSize + beadSize / 2;
      drawCircle(beadCtx, centerX, centerY, beadSize * 0.45, hex);
    }
  }

  renderLegend(usageMap);
}

imageInput.addEventListener('change', (event) => {
  const [file] = event.target.files;
  if (!file) {
    return;
  }

  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    loadedImage = img;
    generatePattern();
    URL.revokeObjectURL(url);
  };
  img.src = url;
});

generateBtn.addEventListener('click', generatePattern);
